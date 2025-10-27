// src/lib/logout.js
import api, { clearAccessToken } from "./api";

export async function logout() {
    try {
        await api.post("/v1/auth/logout"); // clears refresh cookie on server
    } catch (_) {
        // ignore – we’ll clear client state either way
    } finally {
        clearAccessToken();
    }
    window.location.href = "/"; // force go to login
}