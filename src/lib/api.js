// src/lib/api.js
import axios from "axios";

const baseURL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const api = axios.create({
    baseURL,
    withCredentials: true,               // needed so server can set/read refreshToken cookie
    headers: { "Content-Type": "application/json" },
});

let accessToken = localStorage.getItem("accessToken") || null;

api.interceptors.request.use((config) => {
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        const status = error?.response?.status;

        // Try one silent refresh on 401, then bounce to / (login)
        if (status === 401 && !original?._retry) {
            original._retry = true;
            try {
                const { data } = await axios.post(
                    `${baseURL}/v1/auth/refresh`,
                    {},
                    { withCredentials: true } // server sends a new refresh cookie + returns new accessToken
                );
                accessToken = data?.accessToken || null;
                if (!accessToken) throw new Error("No accessToken in refresh response");
                localStorage.setItem("accessToken", accessToken);
                original.headers.Authorization = `Bearer ${accessToken}`;
                return api(original);
            } catch (e) {
                accessToken = null;
                localStorage.removeItem("accessToken");
                // Hard redirect to clear any protected app state
                window.location.href = "/";
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

export default api;