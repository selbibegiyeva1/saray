import React, { useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/Transactions.css";
import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// === Status SVGs ===
const SuccessIcon = () => (
    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M14.2083 3.2796C13.2042 2.78059 12.0724 2.5 10.875 2.5C6.73286 2.5 3.375 5.85786 3.375 10C3.375 14.1421 6.73286 17.5 10.875 17.5C15.0171 17.5 18.375 14.1421 18.375 10C18.375 9.71833 18.3595 9.44028 18.3292 9.16667M18.375 4.16667L10.875 11.6667L8.375 9.16667"
            stroke="#14C57A"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const RejectedIcon = () => (
    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M13.375 7.50003L8.375 12.5M13.375 12.5L8.375 7.50003M10.875 17.5C15.0171 17.5 18.375 14.1421 18.375 10C18.375 5.85786 15.0171 2.5 10.875 2.5C6.73286 2.5 3.375 5.85786 3.375 10C3.375 14.1421 6.73286 17.5 10.875 17.5Z"
            stroke="#ED2428"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const PendingIcon = () => (
    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M17.8619 8.33325H14.5416M17.8619 8.33325V4.99992M17.8619 8.33325L15.089 5.28587C12.4855 2.68238 8.26437 2.68238 5.66087 5.28587C3.05738 7.88937 3.05738 12.1105 5.66087 14.714C8.26437 17.3175 12.4855 17.3175 15.089 14.714C15.7422 14.0607 16.2315 13.3057 16.5569 12.4999M10.3749 7.49992V10.8333L12.8749 12.0833"
            stroke="#FFB01D"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

function Transactions() {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language || "ru";

    const STATUS = {
        success: { label: t("transactions.status.success"), Icon: SuccessIcon },
        rejected: { label: t("transactions.status.rejected"), Icon: RejectedIcon },
        pending: { label: t("transactions.status.pending"), Icon: PendingIcon },
    };

    const [hasTransactions] = useState(true);
    const [loading, setLoading] = useState(false);

    const transactions = [
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "success",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "rejected",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "pending",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "success",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "rejected",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "pending",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "success",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "rejected",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "pending",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "success",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "rejected",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "pending",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "success",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "rejected",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "pending",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "success",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "rejected",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "pending",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "success",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "rejected",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "pending",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "success",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "rejected",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "pending",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "success",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "rejected",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "pending",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "success",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "rejected",
            amount: "+325ТМТ",
        },
        {
            date: currentLang === "ru" ? "Авг 6, 2024" : "Awg 6, 2024",
            time: "15:56",
            txId: "x0565847856584785",
            orderId: "x0565847856584785",
            category: currentLang === "ru" ? "Игра" : "Oýun",
            description: "Merhaba 10gb, 3 day",
            extId: "x056584785",
            status: "pending",
            amount: "+325ТМТ",
        }
    ];

    const [period, setPeriod] = useState("day");
    const [openDay, setOpenDay] = useState(false);

    const periodOptions = [
        { value: "day", label: { ru: "День", tm: "Gün" } },
        { value: "week", label: { ru: "Неделя", tm: "Hepde" } },
        { value: "month", label: { ru: "Месяц", tm: "Aý" } },
        { value: "year", label: { ru: "Год", tm: "Ýyl" } },
    ];

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
                        <form>
                            <button className={`filter-btn blue-nav ${!hasTransactions ? "hide-xls" : ""}`} type="button" disabled={!hasTransactions ? true : false}>
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M10.8337 2.5H6.16699C5.06242 2.5 4.16699 3.39543 4.16699 4.5V8.33333M10.8337 2.5L15.8337 7.5M10.8337 2.5V6.5C10.8337 7.05228 11.2814 7.5 11.8337 7.5H15.8337M15.8337 7.5V15.5C15.8337 16.6046 14.9382 17.5 13.8337 17.5H8.33366C6.49271 17.5 5.00033 16.0076 5.00033 14.1667C5.00033 12.3257 6.49271 10.8333 8.33366 10.8333H10.8337M10.8337 10.8333L8.33366 8.33333M10.8337 10.8333L8.33366 13.3333"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <span>{t("transactions.exportXLS")}</span>
                            </button>

                            <button className="filter-btn" type="button">
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M10.8334 2.5H6.16675C5.06218 2.5 4.16675 3.39543 4.16675 4.5V15.5C4.16675 16.6046 5.06218 17.5 6.16675 17.5H13.8334C14.938 17.5 15.8334 16.6046 15.8334 15.5V7.5M10.8334 2.5L15.8334 7.5M10.8334 2.5V6.5C10.8334 7.05228 11.2811 7.5 11.8334 7.5H15.8334M10.0001 10.8333V14.1667M11.6667 12.5H8.33341"
                                        stroke="black"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <span>{t("transactions.exportCSV")}</span>
                            </button>

                            <div className="nav-filter">
                                <button type="button" onClick={() => setOpenDay((v) => !v)} aria-expanded={openDay}>
                                    <p>{periodOptions.find((p) => p.value === period)?.label[currentLang]}</p>
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M9.29289 12.2929L5.70711 8.70711C5.07714 8.07714 5.52331 7 6.41421 7H13.5858C14.4767 7 14.9229 8.07714 14.2929 8.70711L10.7071 12.2929C10.3166 12.6834 9.68342 12.6834 9.29289 12.2929Z"
                                            fill="black"
                                        />
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
                    </div>

                    <div className="transactions-container">
                        <div className="search-table">
                            <p className="tb-head">{t("transactions.latest")}</p>
                            <div className="search">
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M11.1572 11.1572L15.833 15.833M7.91634 12.4997C10.4476 12.4997 12.4997 10.4476 12.4997 7.91634C12.4997 5.38504 10.4476 3.33301 7.91634 3.33301C5.38504 3.33301 3.33301 5.38504 3.33301 7.91634C3.33301 10.4476 5.38504 12.4997 7.91634 12.4997Z"
                                        stroke="black"
                                        strokeOpacity="0.6"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <input
                                    type="text"
                                    placeholder={t("transactions.searchPlaceholder")}
                                />
                            </div>
                        </div>
                        <div className="table-viewport">
                            <table>

                                <tr className="row-titles" style={{ marginBottom: 16, marginTop: 14 }}>
                                    <p>{t("transactions.date")}</p>
                                    <p>{t("transactions.time")}</p>
                                    <p>{t("transactions.txId")}</p>
                                    <p>{t("transactions.orderId")}</p>
                                    <p>{t("transactions.category")}</p>
                                    <p>{t("transactions.description")}</p>
                                    <p id="exid">{t("transactions.externalId")}</p>
                                    <p>{t("transactions.statusLabel")}</p>
                                    <p>{t("transactions.amount")}</p>
                                </tr>

                                {hasTransactions ? (
                                    transactions.map((tx, i) => {
                                        const meta = STATUS[tx.status] || STATUS.pending;
                                        const Icon = meta.Icon;
                                        return (
                                            <tr key={i} className="row-titles row-data">
                                                <p>{tx.date}</p>
                                                <p>{tx.time}</p>
                                                <p className="trans-overflow" style={{ color: "#2D85EA" }}>
                                                    {tx.txId}
                                                </p>
                                                <p className="trans-overflow" style={{ color: "#2D85EA" }}>
                                                    {tx.orderId}
                                                </p>
                                                <p>{tx.category}</p>
                                                <p className="trans-overflow">{tx.description}</p>
                                                <p className="trans-overflow" id="exid">
                                                    {tx.extId}
                                                </p>
                                                <div className="status-block">
                                                    <div className="status-cell">
                                                        <Icon />
                                                        <p className="trans-overflow">{meta.label}</p>
                                                    </div>
                                                </div>
                                                <p>{tx.amount}</p>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <div className="no-data">
                                        <p>{t("transactions.noData")}</p>
                                    </div>
                                )}
                            </table>
                        </div>
                    </div>

                    <div className="pags">
                        <button className="active-btn">1</button>
                        <button className="inactive-btn">2</button>
                        <button className="inactive-btn">3</button>
                        <button className="inactive-btn">4</button>
                        <button className="inactive-btn">5</button>
                        <button className="inactive-btn">...</button>
                        <button className="inactive-btn">24</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Transactions;