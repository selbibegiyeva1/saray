// routes/TopUp.jsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../lib/api";

function TopUp() {
    const { t } = useTranslation();

    const perPage = 10;
    const [page, setPage] = useState(1);
    const [rows, setRows] = useState([]);
    const [totalPages, setTotalPages] = useState(null);
    const [isLastPage, setIsLastPage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

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

    return (
        <div>
            <div className="transactions-container">
                <div className="search-table" style={{ marginBottom: 14 }}>
                    <p className="tb-head">{t("transactions.latest")}</p>
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
                                    <p className="trans-overflow" style={{ color: "#2D85EA" }}>
                                        {tx.transaction_id}
                                    </p>
                                    <p className="trans-overflow">{fmtMoney(tx.balance_before)}</p>
                                    <p>{fmtMoney(tx.balance_after)}</p>
                                    <p className="trans-overflow">{fmtMoney(tx.amount)}</p>
                                </tr>
                            );
                        })}
                    </table>
                </div>
            </div>

            {/* Real pagination (numbered), preserving original styles */}
            {totalPages && totalPages > 1 && (
                <div className="pags">
                    {/* Prev */}
                    <button
                        className="inactive-btn"
                        disabled={page === 1 || loading}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        aria-label="Previous page"
                    >
                        {t("common.prev") || "Prev"}
                    </button>

                    {/* 1 .. totalPages */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            className={p === page ? "active-btn" : "inactive-btn"}
                            disabled={loading}
                            onClick={() => setPage(p)}
                        >
                            {p}
                        </button>
                    ))}

                    {/* Next */}
                    <button
                        className="inactive-btn"
                        disabled={loading || page >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        aria-label="Next page"
                    >
                        {t("common.next") || "Next"}
                    </button>
                </div>
            )}
        </div>
    );
}

export default TopUp;