import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../lib/api";

function TopUp() {
    const { t } = useTranslation();

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    // format incoming ISO to separate date/time
    const splitDateTime = (iso) => {
        const d = new Date(iso);
        const date = d.toLocaleDateString("ru-RU", { year: "numeric", month: "short", day: "numeric" });
        const time = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
        return { date, time };
    };

    const fmtMoney = (n) =>
        typeof n === "number" ? `${n.toLocaleString("ru-RU")} TMT` : n;

    useEffect(() => {
        (async () => {
            setLoading(true);
            setErr("");
            try {
                // You can later wire real pagination via ?page=&per_page=
                const { data } = await api.get("/v1/partner/info/topup_history?page=1&per_page=10");
                setRows(Array.isArray(data?.topup_history) ? data.topup_history : []);
            } catch (e) {
                setErr(e?.response?.data?.message || "Failed to load topup history");
                console.error("TopUp history error:", e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

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

                        {!loading &&
                            !err &&
                            rows.map((tx, i) => {
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
    );
}

export default TopUp;