import React, { useState } from "react";
import "../styles/Transactions.css";
import { useTranslation } from "react-i18next";

import TopUp from "../components/TopUp";
import Buy from "../components/Buy";

function Transactions() {
    const { t } = useTranslation();

    const [activeButton, setActiveButton] = useState("topup");

    // Keep one source of truth for “period” here if you want both pages to share it
    const [period, setPeriod] = useState("day");
    const apiPeriod = {
        day: "day",
        week: "week",
        month: "month",
        year: "year",
        all: "all_time",
    }[period];

    const renderTrans = () => {
        switch (activeButton) {
            case "buy":
                return (
                    <Buy
                        active="buy"
                        onSwitch={setActiveButton}
                        sharedPeriod={period}
                        onChangePeriod={setPeriod}
                    />
                );
            default:
                return (
                    <TopUp
                        active="topup"
                        onSwitch={setActiveButton}
                        sharedPeriod={period}
                        onChangePeriod={setPeriod}
                        period={apiPeriod} // still supported in TopUp for backward compatibility
                    />
                );
        }
    };

    return (
        <div className="Home">
            <div className="report-display">
                {renderTrans()}
            </div>
        </div>
    );
}

export default Transactions;