import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../lib/api";

// Compact pagination with smart ellipses
function buildPageItems(page, totalPages) {
    if (!totalPages || totalPages < 1) return [];

    // Small sets: show everything
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    // Early pages: show 1..6 then …
    if (page <= 5) return [1, 2, 3, 4, 5, 6, "…", totalPages];

    // Late pages: show … then last 5 pages
    if (page >= totalPages - 4)
        return [1, "…", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];

    // Middle window: … (p-1) p (p+1) …
    return [1, "…", page - 1, page, page + 1, "…", totalPages];
}

// === Status SVGs ===
const SuccessIcon = () => (
    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M14.2083 3.2796C13.2042 2.78059 12.0724 2.5 10.875 2.5C6.73286 2.5 3.375 5.85786 3.375 10C3.375 14.1421 6.73286 17.5 10.875 17.5C15.0171 17.5 18.375 14.1421 18.375 10C18.375 9.71833 18.3595 9.44028 18.3292 9.16667M18.375 4.16667L10.875 11.6667L8.375 9.16667"
            stroke="#14C57A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        />
    </svg>
);

const RejectedIcon = () => (
    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M13.375 7.50003L8.375 12.5M13.375 12.5L8.375 7.50003M10.875 17.5C15.0171 17.5 18.375 14.1421 18.375 10C18.375 5.85786 15.0171 2.5 10.875 2.5C6.73286 2.5 3.375 5.85786 3.375 10C3.375 14.1421 6.73286 17.5 10.875 17.5Z"
            stroke="#ED2428" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        />
    </svg>
);

const PendingIcon = () => (
    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M17.8619 8.33325H14.5416M17.8619 8.33325V4.99992M17.8619 8.33325L15.089 5.28587C12.4855 2.68238 8.26437 2.68238 5.66087 5.28587C3.05738 7.88937 3.05738 12.1105 5.66087 14.714C8.26437 17.3175 12.4855 17.3175 15.089 14.714C15.7422 14.0607 16.2315 13.3057 16.5569 12.4999M10.3749 7.49992V10.8333L12.8749 12.0833"
            stroke="#FFB01D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        />
    </svg>
);

export default function Buy() {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language || "ru";

    const STATUS = {
        success: { label: t("transactions.status.success"), Icon: SuccessIcon },
        rejected: { label: t("transactions.status.rejected"), Icon: RejectedIcon },
        pending: { label: t("transactions.status.pending"), Icon: PendingIcon },
        SUCCESS: { label: t("transactions.status.success"), Icon: SuccessIcon },
        CANCELED: { label: t("transactions.status.rejected"), Icon: RejectedIcon },
        PENDING: { label: t("transactions.status.pending"), Icon: PendingIcon },
    };

    const perPage = 10;
    const [page, setPage] = useState(1);
    const [rows, setRows] = useState([]);
    const [totalPages, setTotalPages] = useState(null); // use if backend provides
    const [isLastPage, setIsLastPage] = useState(false); // fallback when totalPages unknown
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        let cancel = false;
        (async () => {
            setLoading(true);
            setErr("");
            try {
                const { data } = await api.get(`/v1/partner/info/orders?page=${page}&per_page=${perPage}`);
                const list = Array.isArray(data?.orders_history) ? data.orders_history : [];

                if (cancel) return;
                setRows(list);

                // If API returns total/total_pages, compute; else, fallback by length
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
    }, [page]);

    const formatDateTime = (dt) => {
        const d = new Date(dt);
        const date = d.toLocaleDateString("ru-RU", { year: "numeric", month: "short", day: "numeric" });
        const time = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
        return { date, time };
    };

    return (
        <div>
            <div className="transactions-container">
                <div className="search-table" style={{ marginBottom: 14 }}>
                    <p className="tb-head">{t("transactions.latest")}</p>
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
                            <p>{t("transactions.statusLabel")}</p>
                            <p>{t("transactions.amount")}</p>
                        </tr>

                        {loading && <div className="no-data"><p>{t("common.loading") || "Loading..."}</p></div>}
                        {err && <div className="no-data"><p>{err}</p></div>}

                        {!loading && !err && rows.length > 0 ? (
                            rows.map((tx, i) => {
                                const { date, time } = formatDateTime(tx.datetime);
                                const meta = STATUS[tx.status] || STATUS.pending;
                                const Icon = meta.Icon;
                                return (
                                    <tr key={tx.transaction_id || i} className="row-titles row-data">
                                        <p>{date}</p>
                                        <p>{time}</p>
                                        <p className="trans-overflow" style={{ color: "#2D85EA" }}>{tx.transaction_id}</p>
                                        <p className="trans-overflow" style={{ color: "#2D85EA" }}>{tx.operator}</p>
                                        <p>{tx.category}</p>
                                        <p className="trans-overflow">{tx.description}</p>
                                        <div className="status-block">
                                            <div className="status-cell">
                                                <Icon />
                                                <p className="trans-overflow">{meta.label}</p>
                                            </div>
                                        </div>
                                        <p>{tx.amount} TMT</p>
                                    </tr>
                                );
                            })
                        ) : (
                            !loading && !err && (
                                <div className="no-data">
                                    <p>{t("transactions.noData")}</p>
                                </div>
                            )
                        )}
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