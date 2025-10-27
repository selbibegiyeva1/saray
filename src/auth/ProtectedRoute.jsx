// src/auth/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api, { setAccessToken } from "../lib/api";

export default function ProtectedRoute({ children }) {
    const [status, setStatus] = useState("checking"); // checking | authed | anon

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            setStatus("authed");
            return;
        }

        // No token → try one silent refresh
        (async () => {
            try {
                const { data } = await api.post("/v1/auth/refresh", {});
                if (data?.accessToken) {
                    setAccessToken(data.accessToken);
                    setStatus("authed");
                } else {
                    setStatus("anon");
                }
            } catch {
                setStatus("anon");
            }
        })();
    }, []);

    if (status === "checking") return null; // or a spinner/skeleton
    if (status === "anon") return <Navigate to="/" replace />;

    return children;
}