// src/auth/PublicOnlyRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { setAccessToken, doRefresh, isTokenExpired, getRoleFromToken } from "../lib/api";

export default function PublicOnlyRoute({ children }) {
    const [state, setState] = useState("checking"); // checking | authed | anon

    useEffect(() => {
        (async () => {
            const token = localStorage.getItem("accessToken");
            if (token && !isTokenExpired(token)) {
                setState("authed");
                return;
            }
            // IMPORTANT: do NOT refresh on public-only pages if there is no token.
            // This prevents "can't log out" loops when a refresh cookie still exists.
            setState("anon");
        })();
    }, []);

    if (state === "checking") return null;
    if (state === "authed") {
        const role = getRoleFromToken();
        const target = role === "OPERATOR" ? "/operator" : "/home";
        return <Navigate to={target} replace />;
    }
    return children;
}