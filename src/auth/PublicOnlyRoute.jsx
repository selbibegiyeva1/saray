// src/auth/PublicOnlyRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { setAccessToken, doRefresh, isTokenExpired } from "../lib/api";

export default function PublicOnlyRoute({ children }) {
    const [state, setState] = useState("checking"); // checking | authed | anon

    useEffect(() => {
        (async () => {
            const token = localStorage.getItem("accessToken");
            if (token && !isTokenExpired(token)) {
                setState("authed");
                return;
            }
            try {
                const newToken = await doRefresh();
                setAccessToken(newToken);
                setState("authed");
            } catch {
                setState("anon");
            }
        })();
    }, []);

    if (state === "checking") return null;
    if (state === "authed") return <Navigate to="/home" replace />;
    return children;
}