// src/lib/api.js
import axios from "axios";

const baseURL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const api = axios.create({
    baseURL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

let accessToken = localStorage.getItem("accessToken") || null;

// attach token
api.interceptors.request.use((config) => {
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
});

// ---- NEW: single-flight refresh helper (bare axios, no interceptors) ----
let refreshPromise = null;
async function refreshAccessToken() {
    if (!refreshPromise) {
        refreshPromise = axios
            .post(`${baseURL}/v1/auth/refresh`, {}, { withCredentials: true })
            .finally(() => { refreshPromise = null; });
    }
    const { data } = await refreshPromise;
    const newToken = data?.accessToken;
    if (!newToken) throw new Error("No accessToken in refresh response");
    accessToken = newToken;
    localStorage.setItem("accessToken", newToken);
    return newToken;
}

// ---- UPDATED: response interceptor ----
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        const status = error?.response?.status;

        // if 401 and not already retried, and not the refresh endpoint itself
        const isRefreshCall = original?.url?.includes("/v1/auth/refresh");
        if (status === 403 && !original?._retry && !isRefreshCall) {
            original._retry = true;
            try {
                const newToken = await refreshAccessToken();
                original.headers.Authorization = `Bearer ${newToken}`;
                return api(original);
            } catch (e) {
                accessToken = null;
                localStorage.removeItem("accessToken");
                window.location.href = "/"; // hard reset to login
                return Promise.reject(e);
            }
        }

        return Promise.reject(error);
    }
);

export function setAccessToken(token) {
    accessToken = token;
    if (token) localStorage.setItem("accessToken", token);
}
export function clearAccessToken() {
    accessToken = null;
    localStorage.removeItem("accessToken");
}

// ---- NEW: export the helper + a tiny expiry checker ----
export async function doRefresh() {
    return refreshAccessToken();
}

export function isTokenExpired(token, skewMs = 30000) {
    try {
        const [, payload] = token.split(".");
        const { exp } = JSON.parse(atob(payload));
        return (exp * 1000) <= (Date.now() + skewMs);
    } catch {
        return true; // if unreadable, treat as expired
    }
}

// near the other exports
export function getTokenPayload(token = accessToken) {
    try {
        const [, payload] = token.split(".");
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
}

export function getRoleFromToken(token = accessToken) {
    const p = getTokenPayload(token);
    return p?.aud || p?.role || null; // backend seems to put role in `aud`
}

export default api;