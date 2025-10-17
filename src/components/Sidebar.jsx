import React from 'react'
import { NavLink } from 'react-router-dom';
import { useTranslation } from "react-i18next";

function Sidebar({ sidebar, sidebarFunc }) {
    const { t } = useTranslation();

    return (
        <div className={sidebar ? "sidebar moveleft" : "sidebar"}>
            <ul>
                <li>
                    <NavLink to="/home" onClick={sidebarFunc}>
                        {t("navbar.home")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/transactions" onClick={sidebarFunc}>
                        {t("navbar.transactions")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/reports" onClick={sidebarFunc}>
                        {t("navbar.reports")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/help" onClick={sidebarFunc}>
                        {t("navbar.help")}
                    </NavLink>
                </li>
            </ul>
        </div>
    )
}

export default Sidebar