// src/auth/PublicOnlyRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api, { setAccessToken } from "../lib/api";

export default function PublicOnlyRoute({ children }) {
    const [state, setState] = useState("checking"); // checking | authed | anon

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) { setState("authed"); return; }

        (async () => {
            try {
                const { data } = await api.post("/v1/auth/refresh", {});
                if (data?.accessToken) {
                    setAccessToken(data.accessToken);
                    setState("authed");
                } else {
                    setState("anon");
                }
            } catch {
                setState("anon");
            }
        })();
    }, []);

    if (state === "checking") return null;
    if (state === "authed") return <Navigate to="/home" replace />;
    return children;
}