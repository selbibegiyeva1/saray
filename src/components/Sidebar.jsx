import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../lib/api";

function Sidebar({ sidebar, sidebarFunc }) {
    const { t } = useTranslation();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const TOKEN = localStorage.getItem("accessToken");
        if (!TOKEN) return;
        (async () => {
            try {
                const { data } = await api.get("/v1/user/info");
                setUser(data?.user || null);
            } catch (e) {
                console.error("Failed to load user info in Sidebar:", e);
            }
        })();
    }, []);

    return (
        <div className={sidebar ? "sidebar moveleft" : "sidebar"}>
            <ul style={{listStyle: "none"}}>
                <li>
                    <NavLink
                        to={user?.role === "OPERATOR" ? "/operator" : "/home"}
                        onClick={sidebarFunc}
                    >
                        {t("navbar.home")}
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to={user?.role === "OPERATOR" ? "/operator_transactions" : "/transactions"}
                        onClick={sidebarFunc}
                    >
                        {t("navbar.transactions")}
                    </NavLink>
                </li>

                {user?.role === "OPERATOR" ? (
                    <>
                        <li>
                            <NavLink to="/digital" onClick={sidebarFunc}>
                                Цифровые товары
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/esim" onClick={sidebarFunc}>
                                eSIM
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/steam" onClick={sidebarFunc}>
                                Steam
                            </NavLink>
                        </li>
                    </>
                ) : (
                    <li>
                        <NavLink to="/reports" onClick={sidebarFunc}>
                            {t("navbar.reports")}
                        </NavLink>
                    </li>
                )}

                <li>
                    <NavLink to="/help" onClick={sidebarFunc}>
                        {t("navbar.help")}
                    </NavLink>
                </li>
            </ul>
        </div>
    );
}

export default Sidebar;