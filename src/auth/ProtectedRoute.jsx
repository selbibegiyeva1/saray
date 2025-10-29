// src/auth/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api, { setAccessToken, doRefresh, isTokenExpired } from "../lib/api";

export default function ProtectedRoute({ children }) {
    const [status, setStatus] = useState("checking"); // checking | authed | anon

    useEffect(() => {
        (async () => {
            const token = localStorage.getItem("accessToken");
            if (token && !isTokenExpired(token)) {
                setStatus("authed");
                return;
            }
            // token missing or expired -> try one silent refresh
            try {
                const newToken = await doRefresh();
                setAccessToken(newToken);
                setStatus("authed");
            } catch {
                setStatus("anon");
            }
        })();
    }, []);

    if (status === "checking") return null;
    if (status === "anon") return <Navigate to="/" replace />;
    return children;
}