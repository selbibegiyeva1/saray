// routes/TopUp.jsx
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import api from "../lib/api";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Compact pagination with smart, symmetric ellipses
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

function TopUp({
    period = "day",          // legacy prop (mapped value for API like "all_time"); still accepted
    active = "topup",
    onSwitch,                // (optional) parent tab switch
    sharedPeriod,            // (optional) UI period from parent ("day" | "week" | "month" | "year" | "all")
    onChangePeriod,          // (optional) setter in parent
}) {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language || "ru";

    // ======= Header state (no category filter on TopUp) =======
    const [openDay, setOpenDay] = useState(false);
    const [uiPeriod, setUiPeriod] = useState(
        (sharedPeriod === "all_time" ? "all" : sharedPeriod) || "all"
    );

    useEffect(() => {
        if (sharedPeriod) {
            setUiPeriod(sharedPeriod === "all_time" ? "all" : sharedPeriod);
        }
    }, [sharedPeriod]);

    const periodOptions = [
        { value: "day", label: { ru: "День", tm: "Gün" } },
        { value: "week", label: { ru: "Неделя", tm: "Hepde" } },
        { value: "month", label: { ru: "Месяц", tm: "Aý" } },
        { value: "year", label: { ru: "Год", tm: "Ýyl" } },
        { value: "all", label: { ru: "Всё", tm: "Ählisi" } },
    ];

    const apiPeriod = {
        day: "day",
        week: "week",
        month: "month",
        year: "year",
        all: "all_time",
    }[uiPeriod];

    const perPage = 10;
    const [page, setPage] = useState(1);
    const [rows, setRows] = useState([]);
    const [totalPages, setTotalPages] = useState(null);
    const [isLastPage, setIsLastPage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [refreshTick, setRefreshTick] = useState(0);

    const [copyToast, setCopyToast] = useState({ show: false, message: "" });
    const copyTimerRef = useRef(null);

    const splitDateTime = (iso) => {
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

    const fmtMoney = (n) => typeof n === "number" ? `${n.toLocaleString("ru-RU")} TMT` : n;

    useEffect(() => {
        let cancel = false;
        (async () => {
            setLoading(true);
            setErr("");
            try {
                const { data } = await api.get(
                    `/v1/partner/info/topup_history?page=${page}&per_page=${perPage}&period=${apiPeriod}`
                );
                const list = Array.isArray(data?.topup_history) ? data.topup_history : [];

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
                setIsLastPage(apiTotalPages ? page >= apiTotalPages : list.length < perPage);
            } catch (e) {
                if (!cancel) setErr(e?.response?.data?.message || "Failed to load topup history");
            } finally {
                if (!cancel) setLoading(false);
            }
        })();
        return () => { cancel = true; };
    }, [page, apiPeriod, refreshTick]);

    useEffect(() => { setPage(1); }, [apiPeriod]);

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

    useEffect(() => {
        return () => {
            if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
        };
    }, []);

    return (
        <div>
            {/* ===== page-head (TopUp: only day filter) ===== */}
            <div className="page-head trans-head">
                <h1>{t("transactions.title")}</h1>
                <form>
                    {/* Day filter only */}
                    <div className='nav-filter'>
                        <button
                            type='button'
                            onClick={() => { setOpenDay(v => !v); }}
                            aria-expanded={openDay}
                            role="button"
                            tabIndex={0}
                        >
                            <p>{periodOptions.find((opt) => opt.value === uiPeriod)?.label[currentLang]}</p>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.29289 12.2929L5.70711 8.70711C5.07714 8.07714 5.52331 7 6.41421 7H13.5858C14.4767 7 14.9229 8.07714 14.2929 8.70711L10.7071 12.2929C10.3166 12.6834 9.68342 12.6834 9.29289 12.2929Z" fill="black" />
                            </svg>
                        </button>

                        {openDay && (
                            <div className="drop-options days">
                                {periodOptions.map((opt) => (
                                    <p
                                        key={opt.value}
                                        className={opt.value === uiPeriod ? "opt-active" : ""}
                                        onClick={() => {
                                            setUiPeriod(opt.value);
                                            onChangePeriod?.(opt.value);
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

            {/* ===== report-links ===== */}
            <div className="report-links">
                <button
                    className={active === "topup" ? "report-btn active" : "report-btn"}
                    onClick={() => onSwitch?.("topup")}
                >
                    {t("home.withdrawn2")}
                </button>

                <button
                    className={active === "buy" ? "report-btn active" : "report-btn"}
                    onClick={() => onSwitch?.("buy")}
                >
                    {t("home.earned2")}
                </button>
            </div>

            {/* ===== existing table/content ===== */}
            <div className="transactions-container">
                {loading ? (
                    <div className="loading-overlay">
                        <Skeleton height={24} width={204} />
                        <div style={{ margin: "14px 0px" }}>
                            <Skeleton height={32} />
                        </div>

                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="loading-grid" style={{ marginBottom: 16 }}>
                                <Skeleton height={30} />
                                <Skeleton height={30} />
                                <Skeleton height={30} />
                                <Skeleton height={30} />
                                <Skeleton height={30} />
                                <Skeleton height={30} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="search-table" style={{ marginBottom: 14 }}>
                            <p className="tb-head">{t("transactions.latest")}</p>
                            <svg
                                width="40"
                                height="40"
                                viewBox="0 0 40 40"
                                fill="none"
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
                                <path
                                    d="M11.0156 18H15M11.0156 18V14M11.0156 18L14.3431 14.3431C17.4673 11.219 22.5327 11.219 25.6569 14.3431C28.781 17.4673 28.781 22.5327 25.6569 25.6569C22.5327 28.781 17.4673 28.781 14.3431 25.6569C13.5593 24.873 12.9721 23.9669 12.5816 23"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>

                        <div className="table-viewport" style={{ position: "relative" }}>
                            {(err || (!err && rows.length === 0)) && (
                                <div className="table-message">
                                    <p>{err || t("transactions.noData")}</p>
                                </div>
                            )}

                            <table style={{ opacity: err || (!err && rows.length === 0) ? 0.3 : 1 }}>
                                <tr className="row-titles topup" style={{ marginBottom: 16 }}>
                                    <p style={{ textAlign: "left" }}>{t("transactions.date")}</p>
                                    <p style={{ textAlign: "left" }}>{t("transactions.txId")}</p>
                                    <p>{t("transactions.balance_b")}</p>
                                    <p>{t("transactions.balance_a")}</p>
                                    <p style={{ textAlign: "right" }}>{t("transactions.amount")}</p>
                                </tr>

                                {!err &&
                                    rows.map((tx, i) => {
                                        const { date, time, invalid } = splitDateTime(tx.datetime);

                                        if (invalid) {
                                            return (
                                                <div key={`invalid-${i}`} className="table-message">
                                                    <p>{t("transactions.empty")}</p>
                                                </div>
                                            );
                                        }

                                        return (
                                            <tr key={tx.transaction_id || i} className="row-titles row-data topup">
                                                <p style={{ textAlign: "left" }}>{date} {time}</p>
                                                <p
                                                    className="trans-overflow"
                                                    style={{
                                                        color: "#2D85EA",
                                                        cursor: "pointer",
                                                        textDecoration: "underline",
                                                        textAlign: "left"
                                                    }}
                                                    onClick={() => copyTxId(tx.transaction_id)}
                                                >
                                                    {tx.transaction_id}
                                                </p>
                                                <p className="trans-overflow">{fmtMoney(tx.balance_before)}</p>
                                                <p>{fmtMoney(tx.balance_after)}</p>
                                                <p style={{ textAlign: "right" }} className="trans-overflow">{fmtMoney(tx.amount)}</p>
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

            {/* Numbered pagination with ellipses (keeps original classes) */}
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

export default TopUp;