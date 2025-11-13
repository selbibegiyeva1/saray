import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import api from "../lib/api";
import "../styles/Home.css";
import "../styles/OperatorHome.css";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import "../styles/Transactions2.css";

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

function Transactions2() {
    const { t } = useTranslation();

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

    const perPage = 10;
    const [page, setPage] = useState(1);
    const [rows, setRows] = useState([]);
    const [totalPages, setTotalPages] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshTick, setRefreshTick] = useState(0);
    const [err, setErr] = useState("");

    const [copyToast, setCopyToast] = useState({ show: false, message: "" });
    const copyTimerRef = useRef(null);

    // ==== Filter inputs vs applied filters ====
    const DEFAULT_PERIOD = "all_time"; // backend enum
    const DEFAULT_CATEGORY = "ALL";

    // UI inputs (change freely without fetching)
    const [periodInput, setPeriodInput] = useState(DEFAULT_PERIOD);
    const [categoryInput, setCategoryInput] = useState(DEFAULT_CATEGORY);
    const [txidInput, setTxidInput] = useState("");

    // Applied filters (only change on Поиск/Сбросить)
    const [period, setPeriod] = useState(DEFAULT_PERIOD);
    const [category, setCategory] = useState(DEFAULT_CATEGORY);
    const [txid, setTxid] = useState("");

    useEffect(() => {
        let cancel = false;
        (async () => {
            setLoading(true);
            setErr("");
            try {
                const params = new URLSearchParams({
                    page: String(page),
                    per_page: String(perPage),
                    period: period,
                    category: category,
                });
                if (txid.trim()) params.set("transaction_id", txid.trim());

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
    }, [page, period, category, txid, refreshTick]);

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

    const applyFilters = () => {
        setPage(1);
        setPeriod(periodInput);
        setCategory(categoryInput);
        setTxid(txidInput.trim());
    };

    const resetFilters = () => {
        setPeriodInput(DEFAULT_PERIOD);
        setCategoryInput(DEFAULT_CATEGORY);
        setTxidInput("");
        setPage(1);
        setPeriod(DEFAULT_PERIOD);
        setCategory(DEFAULT_CATEGORY);
        setTxid("");
    };

    const onEnter = (e) => {
        if (e.key === "Enter") applyFilters();
    };

    const isTxSearch = !!txid;

    return (
        <div className='Home transhome'>
            <h1>{t("transFilter.title")}</h1>

            <div className="trans-filter">
                <p className="filter-h">{t("transFilter.filters")}</p>
                <div className="filter-flex">
                    <div className='filter-b'>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{t("transFilter.date")}</span>
                        <div style={{ position: 'relative', marginTop: 8 }}>
                            <select value={periodInput} onChange={(e) => setPeriodInput(e.target.value)}>
                                <option value="day">{t("transFilter.date_day")}</option>
                                <option value="week">{t("transFilter.date_week")}</option>
                                <option value="month">{t("transFilter.date_month")}</option>
                                <option value="year">{t("transFilter.date_year")}</option>
                                <option value="all_time">{t("transFilter.date_all")}</option>
                            </select>
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className='filt-arr'>
                                <path d="M3.87883 5.29289L0.293044 1.70711C-0.336921 1.07714 0.109246 0 1.00015 0H8.17172C9.06263 0 9.50879 1.07714 8.87883 1.70711L5.29304 5.29289C4.90252 5.68342 4.26935 5.68342 3.87883 5.29289Z" fill="black" />
                            </svg>
                        </div>
                    </div>
                    <div className='filter-b'>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{t("transFilter.category")}</span>
                        <div style={{ position: 'relative', marginTop: 8 }}>
                            <select value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)}>
                                <option value="ALL">{t("transFilter.category_all")}</option>
                                <option value="ESIM">{t("transFilter.category_esim")}</option>
                                <option value="VOUCHER">{t("transFilter.category_voucher")}</option>
                                <option value="STEAM">{t("transFilter.category_steam")}</option>
                                <option value="TOPUP">{t("transFilter.category_topup")}</option>
                            </select>
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className='filt-arr'>
                                <path d="M3.87883 5.29289L0.293044 1.70711C-0.336921 1.07714 0.109246 0 1.00015 0H8.17172C9.06263 0 9.50879 1.07714 8.87883 1.70711L5.29304 5.29289C4.90252 5.68342 4.26935 5.68342 3.87883 5.29289Z" fill="black" />
                            </svg>
                        </div>
                    </div>
                    <div className="filter-b">
                        <span style={{ fontSize: 14, fontWeight: 500, opacity: 0 }}>{t("transFilter.category")}</span>
                        <div className="b-flex">
                            <div className="search-filt" style={{ position: 'relative', marginTop: 8 }}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11.1524 11.1572L15.8281 15.833M7.91146 12.4997C10.4428 12.4997 12.4948 10.4476 12.4948 7.91634C12.4948 5.38504 10.4428 3.33301 7.91146 3.33301C5.38015 3.33301 3.32812 5.38504 3.32812 7.91634C3.32812 10.4476 5.38015 12.4997 7.91146 12.4997Z" stroke="black" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <input
                                    value={txidInput}
                                    onChange={(e) => setTxidInput(e.target.value)}
                                    onKeyDown={onEnter}
                                    type="text"
                                    placeholder={t("transFilter.searchPlaceholder")}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="filter-b">
                        <button onClick={applyFilters}>{t("transFilter.search")}</button>
                    </div>
                    <div className="filter-b">
                        <button style={{ color: "#2D85EA", padding: "11px 0px", background: "none" }} onClick={resetFilters}>{t("transFilter.reset")}</button>
                    </div>
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
                                    <p>{t("transactions.date")}</p>
                                    <p>{t("transactions.email")}</p>
                                    <p>{t("transactions.txId")}</p>
                                    <p>{t("transactions.operator")}</p>
                                    <p>{t("transactions.category")}</p>
                                    <p>{t("transactions.description")}</p>
                                    <p>{t("transactions.amount")}</p>
                                    <p>{t("transactions.statusLabel")}</p>
                                    <p>{t("transactions.link")}</p>
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
                                            <tr key={tx.transaction_id || i} className="row-titles row-data oper-row" style={{ height: 48 }}>
                                                <p>{date} {time}</p>
                                                <p>{tx.email}</p>
                                                <p className="trans-overflow" style={{ color: "#2D85EA", cursor: "pointer", textDecoration: "underline" }} onClick={() => copyTxId(tx.transaction_id)}>
                                                    {tx.transaction_id}
                                                </p>
                                                <p className="trans-overflow" style={{ color: "#2D85EA" }}>{tx.operator}</p>
                                                <p>{tx.category}</p>
                                                <p>{tx.description}</p>
                                                <p>{tx.amount} TMT</p>
                                                <div className="status-block">
                                                    <div className="status-cell" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                        {Icon && <Icon />}
                                                        <p className="trans-overflow">{label}</p>
                                                    </div>
                                                </div>
                                                <p>
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
            {(!isTxSearch) && totalPages && totalPages > 1 && (
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
    )
}

export default Transactions2;