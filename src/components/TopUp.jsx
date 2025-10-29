// routes/TopUp.jsx
import { useEffect, useState, useRef } from "react"; // + useRef
import { useTranslation } from "react-i18next";
import api from "../lib/api";

// Compact pagination with smart, symmetric ellipses
function buildPageItems(page, totalPages) {
    if (!totalPages || totalPages < 1) return [];

    // Small sets: show everything
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const WINDOW = 5;          // how many inner pages to show between the ends
    const HALF = Math.floor(WINDOW / 2); // 2
    // Clamp the start so the [start..end] block stays within 2..totalPages-1
    const start = Math.max(2, Math.min(page - HALF, totalPages - WINDOW));
    const end = start + WINDOW - 1; // inclusive

    const items = [1];
    if (start > 2) items.push("…");
    for (let i = start; i <= end; i++) items.push(i);
    if (end < totalPages - 1) items.push("…");
    items.push(totalPages);
    return items;
}

function TopUp() {
    const { t } = useTranslation();

    const perPage = 10;
    const [page, setPage] = useState(1);
    const [rows, setRows] = useState([]);
    const [totalPages, setTotalPages] = useState(null);
    const [isLastPage, setIsLastPage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const [copyToast, setCopyToast] = useState({ show: false, message: "" });
    const copyTimerRef = useRef(null);

    const splitDateTime = (iso) => {
        const d = new Date(iso);
        const date = d.toLocaleDateString("ru-RU", { year: "numeric", month: "short", day: "numeric" });
        const time = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
        return { date, time };
    };

    const fmtMoney = (n) =>
        typeof n === "number" ? `${n.toLocaleString("ru-RU")} TMT` : n;

    useEffect(() => {
        let cancel = false;
        (async () => {
            setLoading(true);
            setErr("");
            try {
                const { data } = await api.get(`/v1/partner/info/topup_history?page=${page}&per_page=${perPage}`);
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
    }, [page]);

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
        } catch (_) {
            // ignore copy errors; still show toast
        }

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
            <div className="transactions-container">
                <div className="search-table" style={{ marginBottom: 14 }}>
                    <p className="tb-head">{t("transactions.latest")}</p>
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="40" height="40" rx="8" fill="#2D85EA" />
                        <path d="M11.0156 18H15M11.0156 18V14M11.0156 18L14.3431 14.3431C17.4673 11.219 22.5327 11.219 25.6569 14.3431C28.781 17.4673 28.781 22.5327 25.6569 25.6569C22.5327 28.781 17.4673 28.781 14.3431 25.6569C13.5593 24.873 12.9721 23.9669 12.5816 23" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>

                <div className="table-viewport">
                    <table>
                        <tr className="row-titles topup" style={{ marginBottom: 16, marginTop: 14 }}>
                            <p>{t("transactions.date")}</p>
                            <p>{t("transactions.time")}</p>
                            <p>{t("transactions.txId")}</p>
                            <p>{t("transactions.balance_b")}</p>
                            <p>{t("transactions.balance_a")}</p>
                            <p>{t("transactions.amount")}</p>
                        </tr>

                        {loading && (
                            <div className="no-data">
                                <p>{t("common.loading") || "Loading..."}</p>
                            </div>
                        )}

                        {err && (
                            <div className="no-data">
                                <p>{err}</p>
                            </div>
                        )}

                        {!loading && !err && rows.length === 0 && (
                            <div className="no-data">
                                <p>{t("transactions.noData")}</p>
                            </div>
                        )}

                        {!loading && !err && rows.map((tx, i) => {
                            const { date, time } = splitDateTime(tx.datetime);
                            return (
                                <tr key={tx.transaction_id || i} className="row-titles row-data topup">
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

                                    <p className="trans-overflow">{fmtMoney(tx.balance_before)}</p>
                                    <p>{fmtMoney(tx.balance_after)}</p>
                                    <p className="trans-overflow">{fmtMoney(tx.amount)}</p>
                                </tr>
                            );
                        })}
                    </table>
                </div>
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