import { useState, useEffect, useRef } from "react";
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

// === Status SVGs ===
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

export default function Buy({
    active = "buy",
    onSwitch,                // (optional) parent callback to flip between tabs
    sharedPeriod,            // (optional) parent period value for visual sync
    onChangePeriod,          // (optional) parent setter if you want single source of truth
}) {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language || "ru";

    // ======= Header (page-head) local state =======
    const [filter, setFilter] = useState(false);
    const [openCat, setOpenCat] = useState(false);
    const [openDay, setOpenDay] = useState(false);

    const [appliedCategory, setAppliedCategory] = useState("All");   // drives API
    const [pendingCategory, setPendingCategory] = useState("All");   // UI selection only
    // UI state must be one of: "day" | "week" | "month" | "year" | "all"
    const [period, setPeriod] = useState(
        (sharedPeriod === "all_time" ? "all" : sharedPeriod) || "all"
    );

    useEffect(() => {
        if (sharedPeriod) {
            setPeriod(sharedPeriod === "all_time" ? "all" : sharedPeriod);
        }
    }, [sharedPeriod]);

    const filterFunc = () => setFilter(v => !v);

    const periodOptions = [
        { value: "day", label: { ru: "День", tm: "Gün" } },
        { value: "week", label: { ru: "Неделя", tm: "Hepde" } },
        { value: "month", label: { ru: "Месяц", tm: "Aý" } },
        { value: "year", label: { ru: "Год", tm: "Ýyl" } },
        { value: "all", label: { ru: "Всё", tm: "Ählisi" } }, // maps to all_time
    ];
    const categoryOptions = [
        { value: "All", label: { ru: "Всё", tm: "Ählisi" } },
        { value: "eSIM", label: { ru: "eSIM", tm: "eSIM" } },
        { value: "TopUp", label: { ru: "Topup", tm: "Topup" } },
        { value: "Steam", label: { ru: "Steam", tm: "Steam" } },
        { value: "Voucher", label: { ru: "Voucher", tm: "Voucher" } }
    ];

    const apiPeriod = {
        day: "day",
        week: "week",
        month: "month",
        year: "year",
        all: "all_time",
    }[period];

    // UI "category" -> API query value (backend expects uppercase)
    const apiCategory = ({
        eSIM: 'ESIM',
        TopUp: 'TOPUP',
        Steam: 'STEAM',
        Voucher: 'VOUCHER',
    }[appliedCategory]) || null;   // null => no category param (All)

    // ======= Existing Buy logic =======
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
    const [isLastPage, setIsLastPage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [refreshTick, setRefreshTick] = useState(0);
    const [err, setErr] = useState("");

    const [copyToast, setCopyToast] = useState({ show: false, message: "" });
    const copyTimerRef = useRef(null);

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
                if (apiCategory) params.append("category", apiCategory);
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
                setIsLastPage(apiTotalPages ? page >= apiTotalPages : list.length < perPage);
            } catch (e) {
                if (!cancel) setErr(e?.response?.data?.message || "Failed to load transactions");
            } finally {
                if (!cancel) setLoading(false);
            }
        })();
        return () => { cancel = true; };
    }, [page, apiPeriod, appliedCategory, refreshTick]);

    // whenever period changes, go back to first page
    useEffect(() => { setPage(1); }, [apiPeriod, appliedCategory]);

    const formatDateTime = (dt) => {
        const d = new Date(dt);
        const date = d.toLocaleDateString("ru-RU", { year: "numeric", month: "short", day: "numeric" });
        const time = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
        return { date, time };
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

    useEffect(() => {
        return () => {
            if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
        };
    }, []);

    return (
        <div>
            {/* ===== page-head (with category + day filters) ===== */}
            <div className="page-head trans-head">
                <h1>{t("transactions.title")}</h1>
                <form>
                    {/* Category filter — visible on Buy */}
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
                                    {pendingCategory !== "All" && (
                                        <span
                                            className="reset-btn"
                                            onClick={() => {
                                                setPendingCategory("All");
                                                setAppliedCategory("All");   // actually apply immediately
                                                setFilter(false);            // close filter panel
                                                setPage(1);                  // reset to first page
                                            }}
                                        >
                                            {t("home.reset")}
                                        </span>
                                    )}
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <div
                                        className="filter-select"
                                        onClick={() => { setOpenCat(v => !v); }}
                                        aria-expanded={openCat}
                                    >
                                        <p>{categoryOptions.find((opt) => opt.value === pendingCategory)?.label[currentLang]}</p>
                                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M4.29289 5.29289L0.707107 1.70711C0.0771419 1.07714 0.523309 0 1.41421 0H8.58579C9.47669 0 9.92286 1.07714 9.29289 1.70711L5.70711 5.29289C5.31658 5.68342 4.68342 5.68342 4.29289 5.29289Z" fill="black" />
                                        </svg>
                                    </div>
                                    {openCat && (
                                        <div className="drop-options">
                                            {categoryOptions.map((opt) => (
                                                <p
                                                    key={opt.value}
                                                    className={opt.value === pendingCategory ? "opt-active" : ""}
                                                    onClick={() => {
                                                        setPendingCategory(opt.value); // only change pending
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
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAppliedCategory(pendingCategory); // commit selection
                                        setFilter(false);                     // close panel
                                        setPage(1);                           // show from first page
                                    }}
                                >
                                    {t("home.apply")}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Day filter */}
                    <div className='nav-filter'>
                        <button
                            type='button'
                            onClick={() => { setOpenDay(v => !v); setOpenCat(false); }}
                            aria-expanded={openDay}
                            role="button"
                            tabIndex={0}
                        >
                            <p>{periodOptions.find((opt) => opt.value === period)?.label[currentLang]}</p>
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

                        <div className="table-viewport">
                            <table>
                                <tr className="row-titles" style={{ marginBottom: 16, marginTop: 14 }}>
                                    <p>{t("transactions.date")}</p>
                                    <p>{t("transactions.time")}</p>
                                    <p>{t("transactions.txId")}</p>
                                    <p>{t("transactions.operator")}</p>
                                    <p>{t("transactions.category")}</p>
                                    <p>{t("transactions.description")}</p>
                                    <p>{t("transactions.statusLabel")}</p>
                                    <p>{t("transactions.amount")}</p>
                                </tr>

                                {err && <div className="no-data"><p>{err}</p></div>}

                                {!err && rows.length > 0 ? (
                                    rows.map((tx, i) => {
                                        const { date, time } = formatDateTime(tx.datetime);
                                        const key = normalizeStatus(tx.status);
                                        const StatusDef = STATUS[key];
                                        const Icon = StatusDef?.Icon;
                                        const label = StatusDef?.label || tx.status;

                                        return (
                                            <tr key={tx.transaction_id || i} className="row-titles row-data">
                                                <p>{date}</p>
                                                <p>{time}</p>
                                                <p
                                                    className="trans-overflow"
                                                    style={{ color: "#2D85EA", cursor: "pointer", textDecoration: "underline" }}
                                                    title="Click to copy"
                                                    onClick={() => copyTxId(tx.transaction_id)}
                                                >
                                                    {tx.transaction_id}
                                                </p>

                                                {copyToast.show && (
                                                    <div
                                                        role="alert"
                                                        aria-live="polite"
                                                        style={{
                                                            position: "fixed",
                                                            left: "50%",
                                                            bottom: "28px",
                                                            transform: "translateX(-50%)",
                                                            zIndex: 9999,
                                                            padding: "15px 30px",
                                                            background: "#FFFFFF",
                                                            border: "1px solid #00000026",
                                                            color: "black",
                                                            borderRadius: "10px",
                                                            fontSize: 14,
                                                        }}
                                                    >
                                                        <center><span style={{ fontWeight: 500 }}>{copyToast.message}</span></center>
                                                    </div>
                                                )}

                                                <p className="trans-overflow" style={{ color: "#2D85EA" }}>{tx.operator}</p>
                                                <p>{tx.category}</p>
                                                <p>{tx.description}</p>

                                                <div className="status-block">
                                                    <div className="status-cell" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                        {Icon && <Icon />}
                                                        <p className="trans-overflow">{label}</p>
                                                    </div>
                                                </div>

                                                <p>{tx.amount} TMT</p>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    !err && <div className="no-data"><p>{t("transactions.noData")}</p></div>
                                )}
                            </table>
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