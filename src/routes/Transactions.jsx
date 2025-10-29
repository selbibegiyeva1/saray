import React, { useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/Transactions.css";
import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import TopUp from "../components/TopUp";
import Buy from "../components/Buy";

function Transactions() {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language || "ru";

    const [hasTransactions] = useState(true);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState(false);

    const [category, setCategory] = useState("eSIM");
    const [period, setPeriod] = useState("day");
    const [openCat, setOpenCat] = useState(false);

    const filterFunc = () => setFilter(!filter);

    const [openDay, setOpenDay] = useState(false);

    const periodOptions = [
        { value: "day", label: { ru: "День", tm: "Gün" } },
        { value: "month", label: { ru: "Месяц", tm: "Aý" } },
        { value: "year", label: { ru: "Год", tm: "Ýyl" } },
        { value: "all", label: { ru: "Всё", tm: "Ählisi" } },
    ];

    const categoryOptions = [
        { value: "eSIM", label: { ru: "eSIM", tm: "eSIM" } },
        { value: "TopUp", label: { ru: "Topup", tm: "Topup" } },
        { value: "Steam", label: { ru: "Steam", tm: "Steam" } },
        { value: "Voucher", label: { ru: "Voucher", tm: "Voucher" } }
    ];

    const [activeButton, setActiveButton] = useState("topup");
    const renderTrans = () => {
        switch (activeButton) {
            case "buy":
                return <Buy />
            default:
                return <TopUp />
        }
    }

    return (
        <div className="Home">
            <Navbar />

            {loading ? (
                <div className="trans-load">
                    <div style={{ marginBottom: 14 }}>
                        <Skeleton height={24} width={204} />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <Skeleton height={32} width={"100%"} />
                    </div>
                    <div className="loads">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div className="grid-load" key={i}>
                                {Array.from({ length: 9 }).map((_, j) => (
                                    <div key={j}>
                                        <Skeleton height={32} width={"100%"} />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div>
                    <div className="page-head trans-head">
                        <h1>{t("transactions.title")}</h1>

                        {hasTransactions ? (
                            <form>

                                {/* Category filter — hide on TopUp */}
                                {activeButton !== "topup" && (
                                    <div className='nav-filter'>
                                        <button type='button' onClick={filterFunc}>
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M3.3335 5.83337H16.6668M5.83345 10H14.1668M9.16678 14.1667H10.8334" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <span>{t("home.filter")}</span>
                                        </button>

                                        <div className={filter ? "filter-drop drop" : "filter-drop"}>
                                            <div className="prof-flex filter-flex">
                                                <span>{t("home.filter")}</span>
                                                <svg width="24" height="24" viewBox="0 0 72 75" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ cursor: "pointer" }} onClick={filterFunc}>
                                                    <g id="close">
                                                        <path id="Icon" d="M18 19.5L54 55.5M54 19.5L18 55.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </g>
                                                </svg>
                                            </div>

                                            <div className='filter-opts'>
                                                <div className='opts-head'>
                                                    <span>{t("home.category")}</span>
                                                    {category !== "eSIM" && (
                                                        <span className="reset-btn" onClick={() => setCategory("eSIM")}>
                                                            {t("home.reset")}
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ position: 'relative' }}>
                                                    <div
                                                        className="filter-select"
                                                        onClick={() => { setOpenCat(v => !v); setOpenPay(false); }}
                                                        aria-expanded={openCat}
                                                    >
                                                        <p>
                                                            {categoryOptions.find((opt) => opt.value === category)?.label[currentLang]}
                                                        </p>
                                                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M4.29289 5.29289L0.707107 1.70711C0.0771419 1.07714 0.523309 0 1.41421 0H8.58579C9.47669 0 9.92286 1.07714 9.29289 1.70711L5.70711 5.29289C5.31658 5.68342 4.68342 5.68342 4.29289 5.29289Z" fill="black" />
                                                        </svg>
                                                    </div>
                                                    {openCat && (
                                                        <div className="drop-options">
                                                            {categoryOptions.map((opt) => (
                                                                <p
                                                                    key={opt.value}
                                                                    className={opt.value === category ? "opt-active" : ""}
                                                                    onClick={() => {
                                                                        setCategory(opt.value);
                                                                        setOpenCat(false);
                                                                    }}
                                                                >
                                                                    {opt.label[currentLang]}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div id='filter-btn'>
                                                <button>{t("home.apply")}</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Day filter */}
                                <div className='nav-filter'>
                                    <button
                                        type='button'
                                        onClick={() => { setOpenDay(v => !v); setOpenCat(false); setOpenPay(false); }}
                                        aria-expanded={openDay}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <p>
                                            {
                                                periodOptions.find((opt) => opt.value === period)?.label[currentLang]
                                            }
                                        </p>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9.29289 12.2929L5.70711 8.70711C5.07714 8.07714 5.52331 7 6.41421 7H13.5858C14.4767 7 14.9229 8.07714 14.2929 8.70711L10.7071 12.2929C10.3166 12.6834 9.68342 12.6834 9.29289 12.2929Z" fill="black" />
                                        </svg>
                                    </button>

                                    {openDay && (
                                        <div className="drop-options days">
                                            {periodOptions.map((opt) => (
                                                <p
                                                    key={opt.value}
                                                    className={opt.value === period ? "opt-active" : ""}
                                                    onClick={() => {
                                                        setPeriod(opt.value);
                                                        setOpenDay(false);
                                                    }}
                                                >
                                                    {opt.label[currentLang]}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </form>
                        ) : (
                            <div></div>
                        )}
                    </div>

                    <div className="report-links">
                        <button
                            className={activeButton === "topup" ? "report-btn active" : "report-btn"}
                            onClick={() => setActiveButton("topup")}
                        >
                            {t("home.withdrawn2")}
                        </button>

                        <button
                            className={activeButton === "buy" ? "report-btn active" : "report-btn"}
                            onClick={() => setActiveButton("buy")}
                        >
                            {t("home.earned2")}
                        </button>
                    </div>

                    <div className="report-display">
                        {renderTrans()}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Transactions;