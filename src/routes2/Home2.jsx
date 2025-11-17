import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import api from "../lib/api";
import "../styles/Home.css";
import "../styles/OperatorHome.css";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Compact pagination with smart, symmetric ellipses (same as in Buy)
function buildPageItems(page, totalPages) {
    if (!totalPages || totalPages < 1) return [];
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const WINDOW = 5;
    const HALF = Math.floor(WINDOW / 2);
    const start = Math.max(2, Math.min(page - HALF, totalPages - WINDOW));
    const end = start + WINDOW - 1;
    const items = [1];
    if (start > 2) items.push("…");
    for (let i = start; i <= end; i++) items.push(i);
    if (end < totalPages - 1) items.push("…");
    items.push(totalPages);
    return items;
}

// === Status SVGs (copied from Buy) ===
const SuccessIcon = () => (
    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.2083 3.2796C13.2042 2.78059 12.0724 2.5 10.875 2.5C6.73286 2.5 3.375 5.85786 3.375 10C3.375 14.1421 6.73286 17.5 10.875 17.5C15.0171 17.5 18.375 14.1421 18.375 10C18.375 9.71833 18.3595 9.44028 18.3292 9.16667M18.375 4.16667L10.875 11.6667L8.375 9.16667" stroke="#14C57A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const RejectedIcon = () => (
    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.375 7.50003L8.375 12.5M13.375 12.5L8.375 7.50003M10.875 17.5C15.0171 17.5 18.375 14.1421 18.375 10C18.375 5.85786 15.0171 2.5 10.875 2.5C6.73286 2.5 3.375 5.85786 3.375 10C3.375 14.1421 6.73286 17.5 10.875 17.5Z" stroke="#ED2428" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const PendingIcon = () => (
    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.8619 8.33325H14.5416M17.8619 8.33325V4.99992M17.8619 8.33325L15.089 5.28587C12.4855 2.68238 8.26437 2.68238 5.66087 5.28587C3.05738 7.88937 3.05738 12.1105 5.66087 14.714C8.26437 17.3175 12.4855 17.3175 15.089 14.714C15.7422 14.0607 16.2315 13.3057 16.5569 12.4999M10.3749 7.49992V10.8333L12.8749 12.0833" stroke="#FFB01D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

function Home2() {
    const { t } = useTranslation();

    // ===== Operator balance card (existing) =====
    const [balance, setBalance] = useState(null);
    const [balanceErr, setBalanceErr] = useState("");

    useEffect(() => {
        let cancel = false;
        (async () => {
            try {
                const { data } = await api.get("/v1/partner/info/main");
                if (!cancel) {
                    setBalance(typeof data?.balance === "number" ? data.balance : null);
                    setBalanceErr("");
                }
            } catch (e) {
                if (!cancel) {
                    setBalance(null);
                    setBalanceErr("—");
                }
            }
        })();
        return () => { cancel = true; };
    }, []);

    // ===== Transactions table state (same API as Buy) =====
    const STATUS = {
        success: { label: t("transactions.status.success"), Icon: SuccessIcon },
        rejected: { label: t("transactions.status.rejected"), Icon: RejectedIcon },
        pending: { label: t("transactions.status.pending"), Icon: PendingIcon },

        SUCCESS: { label: t("transactions.status.success"), Icon: SuccessIcon },
        PAID: { label: t("transactions.status.success"), Icon: SuccessIcon },
        CANCELED: { label: t("transactions.status.rejected"), Icon: RejectedIcon },
        PENDING: { label: t("transactions.status.pending"), Icon: PendingIcon },
    };

    const perPage = 8;
    const [page, setPage] = useState(1);
    const [rows, setRows] = useState([]);
    const [totalPages, setTotalPages] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshTick, setRefreshTick] = useState(0);
    const [err, setErr] = useState("");

    const [copyToast, setCopyToast] = useState({ show: false, message: "" });
    const copyTimerRef = useRef(null);

    // For Home2, we show today's operations by default (period=day)
    const apiPeriod = "all_time"; // maps to the same backend enum

    useEffect(() => {
        let cancel = false;
        (async () => {
            setLoading(true);
            setErr("");
            try {
                const params = new URLSearchParams({
                    page: String(page),
                    per_page: String(perPage),
                    period: apiPeriod,
                });
                const { data } = await api.get(`/v1/partner/info/orders?${params.toString()}`);

                const list = Array.isArray(data?.orders_history) ? data.orders_history : [];
                if (cancel) return;
                setRows(list);

                const apiTotalPages =
                    (typeof data?.total_pages === "number" && data.total_pages > 0)
                        ? data.total_pages
                        : (typeof data?.total === "number" && data.total >= 0)
                            ? Math.ceil(data.total / perPage)
                            : (typeof data?.count === "number" && data.count >= 0)
                                ? Math.ceil(data.count / perPage)
                                : null;
                setTotalPages(apiTotalPages || null);
            } catch (e) {
                if (!cancel) setErr(e?.response?.data?.message || "Failed to load transactions");
            } finally {
                if (!cancel) setLoading(false);
            }
        })();
        return () => { cancel = true; };
    }, [page, apiPeriod, refreshTick]);

    const formatDateTime = (iso) => {
        if (!iso) return { invalid: true };
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return { invalid: true };
        const date = d.toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
        const time = d.toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
        });
        return { date, time, invalid: false };
    };

    const normalizeStatus = (s) => {
        const v = (s || "").toString().trim().toUpperCase();
        if (["PAID", "SUCCESS", "SUCCEEDED"].includes(v)) return "SUCCESS";
        if (["PENDING", "IN_PROGRESS", "PROCESSING"].includes(v)) return "PENDING";
        if (["CANCELED", "CANCELLED", "REJECTED", "FAILED"].includes(v)) return "CANCELED";
        if (["В ПРОЦЕССЕ"].includes(v)) return "PENDING";
        if (["ОТКЛОНЕНО"].includes(v)) return "CANCELED";
        return v;
    };

    const copyTxId = async (value) => {
        if (!value) return;
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(value);
            } else {
                const ta = document.createElement("textarea");
                ta.value = value;
                ta.style.position = "fixed";
                ta.style.opacity = "0";
                document.body.appendChild(ta);
                ta.select();
                document.execCommand("copy");
                document.body.removeChild(ta);
            }
        } catch (_) { }
        setCopyToast({ show: true, message: "Transaction ID copied" });
        if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
        copyTimerRef.current = setTimeout(() => {
            setCopyToast({ show: false, message: "" });
        }, 2500);
    };

    useEffect(() => () => { if (copyTimerRef.current) clearTimeout(copyTimerRef.current); }, []);

    return (
        <div className='Home'>
            <div className="operator-top">
                <h1>{t("operator.mainSections")}</h1>

                <div className="oper-flex-block">
                    <div className="operator-flex">
                        <Link to="/steam">
                            <img src="/steam.png" alt="box" />
                            <center><b>{t("operator.steam")}</b></center>
                        </Link>
                        <Link to="/digital?category=games">
                            <img src="/games.png" alt="box" />
                            <center><b>{t("operator.games")}</b></center>
                        </Link>
                        <Link to="/digital?category=business">
                            <img src="/services.png" alt="box" />
                            <center><b>{t("operator.services")}</b></center>
                        </Link>
                        <Link to="/esim">
                            <img src="/esim.png" alt="box" />
                            <center><b>{t("operator.esim")}</b></center>
                        </Link>
                    </div>

                    <div className="oper-balance">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: 18, fontWeight: 500 }}>
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.9974 6.66667H24.9409C25.7087 6.66667 26.1901 7.49615 25.8091 8.16281L21.9066 14.9923C21.5505 15.6154 20.8878 16 20.1701 16H10.6641M10.6641 16L8.28698 19.8033C7.8707 20.4694 8.34954 21.3333 9.13498 21.3333H23.9974M10.6641 16L5.21685 5.10557C4.87806 4.428 4.18554 4 3.42799 4H2.66406M10.6641 26.6667C10.6641 27.403 10.0671 28 9.33073 28C8.59435 28 7.9974 27.403 7.9974 26.6667C7.9974 25.9303 8.59435 25.3333 9.33073 25.3333C10.0671 25.3333 10.6641 25.9303 10.6641 26.6667ZM23.9974 26.6667C23.9974 27.403 23.4004 28 22.6641 28C21.9277 28 21.3307 27.403 21.3307 26.6667C21.3307 25.9303 21.9277 25.3333 22.6641 25.3333C23.4004 25.3333 23.9974 25.9303 23.9974 26.6667Z" stroke="#5682FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <p>{t("operator.balance")}</p>
                        </div>
                        <div style={{ display: "flex", marginTop: 24, alignItems: "center", justifyContent: "space-between", fontSize: 20, fontWeight: 500 }}>
                            <p>{t("operator.available")}</p>
                            <p>
                                {balanceErr
                                    ? balanceErr
                                    : balance != null
                                        ? `${Number(balance).toLocaleString("ru-RU")} ТМТ`
                                        : "—"}
                            </p>
                        </div>
                        <div style={{ display: "flex", marginTop: 16, alignItems: "center", justifyContent: "space-between", fontSize: 20, fontWeight: 500 }}>
                            <p>{t("operator.mode")}</p>
                            <p>{t("operator.deposit")}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 1680, margin: "auto" }}>
                <div className="oper-head">
                    <h1>{t("operator.todayOperations")}</h1>
                </div>
            </div>

            {/* === Inserted transactions table (exact same API & table structure as Buy) === */}
            <div className="transactions-container oper-trans" style={{ marginTop: 24 }}>
                {loading ? (
                    <div className="loading-overlay" aria-busy="true" aria-live="polite">
                        <Skeleton height={24} width={204} />
                        <div style={{ margin: "14px 0px" }}>
                            <Skeleton height={32} />
                        </div>
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="loading-grid buyload" style={{ marginBottom: 16 }}>
                                <Skeleton height={30} /><Skeleton height={30} /><Skeleton height={30} /><Skeleton height={30} />
                                <Skeleton height={30} /><Skeleton height={30} /><Skeleton height={30} /><Skeleton height={30} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="search-table" style={{ marginBottom: 14 }}>
                            <p className="tb-head">{t("transactions.latest")}</p>
                            <svg
                                width="40" height="40" viewBox="0 0 40 40" fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className={`refresh-table ${loading ? "spinning" : ""}`}
                                role="button"
                                aria-label={t("common.refresh") || "Refresh"}
                                tabIndex={0}
                                title={t("common.refresh") || "Refresh"}
                                onClick={() => { if (!loading) setRefreshTick(v => v + 1); }}
                                onKeyDown={(e) => {
                                    if ((e.key === "Enter" || e.key === " ") && !loading) setRefreshTick(v => v + 1);
                                }}
                                style={{ cursor: loading ? "not-allowed" : "pointer", outline: "none" }}
                            >
                                <rect width="40" height="40" rx="8" fill="#2D85EA" />
                                <path d="M11.0156 18H15M11.0156 18V14M11.0156 18L14.3431 14.3431C17.4673 11.219 22.5327 11.219 25.6569 14.3431C28.781 17.4673 28.781 22.5327 25.6569 25.6569C22.5327 28.781 17.4673 28.781 14.3431 25.6569C13.5593 24.873 12.9721 23.9669 12.5816 23" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        <div className="table-viewport" style={{ position: "relative" }}>
                            {(err || (!err && rows.length === 0)) && (
                                <div className="table-message">
                                    <p>{err || t("transactions.noData")}</p>
                                </div>
                            )}

                            <table style={{ opacity: err || (!err && rows.length === 0) ? 0.3 : 1 }}>
                                <tr className="row-titles oper-row" style={{ marginBottom: 16, marginTop: 14 }}>
                                    <p style={{ textAlign: "left" }}>{t("transactions.date")}</p>
                                    <p>{t("transactions.email")}</p>
                                    <p style={{ textAlign: "left" }}>{t("transactions.txId")}</p>
                                    <p>{t("transactions.operator")}</p>
                                    <p style={{ textAlign: "left" }}>{t("transactions.category")}</p>
                                    <p>{t("transactions.description")}</p>
                                    <p style={{ textAlign: "right" }}>{t("transactions.amount")}</p>
                                    <p>{t("transactions.statusLabel")}</p>
                                    <p style={{ textAlign: "right" }}>{t("transactions.link")}</p>
                                </tr>

                                {!err &&
                                    rows.map((tx, i) => {
                                        const { date, time, invalid } = formatDateTime(tx.datetime);
                                        if (invalid) {
                                            return (
                                                <div key={`invalid-${i}`} className="table-message">
                                                    <p>{t("transactions.empty")}</p>
                                                </div>
                                            );
                                        }
                                        const key = normalizeStatus(tx.status);
                                        const StatusDef = STATUS[key];
                                        const Icon = StatusDef?.Icon;
                                        const label = StatusDef?.label || tx.status;

                                        return (
                                            <tr key={tx.transaction_id || i} className="row-titles row-data oper-row">
                                                <p style={{ textAlign: "left" }}>{date} {time}</p>
                                                <p className="trans-overflow">{tx.email}</p>
                                                <p className="trans-overflow" style={{ color: "#2D85EA", cursor: "pointer", textDecoration: "underline", textAlign: "left" }} onClick={() => copyTxId(tx.transaction_id)}>
                                                    {tx.transaction_id}
                                                </p>
                                                <p className="trans-overflow" style={{ color: "#2D85EA" }}>{tx.operator}</p>
                                                <p style={{ textAlign: "left" }}>{tx.category}</p>
                                                <p>{tx.description}</p>
                                                <p style={{ textAlign: "right" }}>{tx.amount} TMT</p>
                                                <div className="status-block">
                                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                                        {Icon && <Icon />}
                                                        <p style={{ width: "auto" }}>{label}</p>
                                                    </div>
                                                </div>
                                                <p style={{ textAlign: "right" }}>
                                                    {tx.instruction_url
                                                        ? <a href={tx.instruction_url} target="_blank" rel="noreferrer" style={{ color: "#2D85EA" }}>{t("transactions.qr")}</a>
                                                        : "—"}
                                                </p>
                                            </tr>
                                        );
                                    })}
                            </table>

                            {copyToast.show && (
                                <div
                                    role="status"
                                    aria-live="polite"
                                    style={{
                                        position: "fixed",
                                        left: "50%",
                                        bottom: 16,
                                        transform: "translateX(-50%)",
                                        padding: "15px 40px",
                                        background: "white",
                                        color: "black",
                                        fontSize: 12,
                                        borderRadius: 10,
                                        border: "1px solid #00000026",
                                        boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                                        zIndex: 9999,
                                        pointerEvents: "none",
                                        transition: "opacity 150ms ease",
                                    }}
                                >
                                    {t("navbar.copied")}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Numbered pagination (same behavior as Buy) */}
            {totalPages && totalPages > 1 && (
                <div className="pags">
                    {buildPageItems(page, totalPages).map((item, idx) =>
                        item === "…" ? (
                            <button key={`ellipsis-${idx}`} className="inactive-btn" disabled>
                                …
                            </button>
                        ) : (
                            <button
                                key={item}
                                className={item === page ? "active-btn" : "inactive-btn"}
                                disabled={loading}
                                onClick={() => setPage(item)}
                            >
                                {item}
                            </button>
                        )
                    )}
                </div>
            )}
        </div>
    );
}

export default Home2;