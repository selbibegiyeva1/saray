import React, { useEffect, useRef, useState } from "react";

import api from "../lib/api";
import "../styles/Home.css";
import "../styles/OperatorHome.css";

// --- status icons (same style as Buy.jsx) ---
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

const STATUS = {
    SUCCESS: { label: "Успешно", Icon: SuccessIcon },
    PAID: { label: "Успешно", Icon: SuccessIcon },
    CANCELED: { label: "Отклонено", Icon: RejectedIcon },
    PENDING: { label: "В процессе", Icon: PendingIcon },
};

const normalizeStatus = (s) => {
    const v = (s || "").toString().trim().toUpperCase();
    if (["PAID", "SUCCESS", "SUCCEEDED"].includes(v)) return "SUCCESS";
    if (["PENDING", "IN_PROGRESS", "PROCESSING", "В ПРОЦЕССЕ"].includes(v)) return "PENDING";
    if (["CANCELED", "CANCELLED", "REJECTED", "FAILED", "ОТКЛОНЕНО"].includes(v)) return "CANCELED";
    return v;
};

const formatDateTime = (iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return { date: "-", time: "-" };
    return {
        date: d.toLocaleDateString("ru-RU", { year: "numeric", month: "short", day: "numeric" }),
        time: d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
    };
};

function Home2() {
    // --- table state ---
    const perPage = 10;
    const [page, setPage] = useState(1);
    const [rows, setRows] = useState([]);
    const [totalPages, setTotalPages] = useState(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [refreshTick, setRefreshTick] = useState(0);

    // default like your Postman: category=ALL, period=week
    const apiPeriod = "all_time"; // day|week|month|year|all_time
    const apiCategory = null; // null => ALL (don’t send category param)

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
                if (cancel) return;

                const list = Array.isArray(data?.orders_history) ? data.orders_history : [];
                setRows(list);

                const apiTotalPages =
                    typeof data?.total_pages === "number" && data.total_pages > 0
                        ? data.total_pages
                        : list.length < perPage
                            ? page // crude fallback
                            : page + 1;
                setTotalPages(apiTotalPages);
            } catch (e) {
                if (!cancel) setErr(e?.response?.data?.message || "Не удалось загрузить операции");
            } finally {
                if (!cancel) setLoading(false);
            }
        })();
        return () => { cancel = true; };
    }, [page, refreshTick]);

    return (
        <div className='Home'>
            <div className="operator-top">
                <h1>Основные разделы</h1>

                <div className="oper-flex-block">
                    <div className="operator-flex">
                        <div>
                            <img src="/steam.png" alt="box" />
                            <center><b>Steam</b></center>
                        </div>
                        <div>
                            <img src="/games.png" alt="box" />
                            <center><b>Игры</b></center>
                        </div>
                        <div>
                            <img src="/services.png" alt="box" />
                            <center><b>Сервисы</b></center>
                        </div>
                        <div>
                            <img src="/esim.png" alt="box" />
                            <center><b>eSIM</b></center>
                        </div>
                    </div>

                    <div className="oper-balance">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: 18, fontWeight: 500 }}>
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.9974 6.66667H24.9409C25.7087 6.66667 26.1901 7.49615 25.8091 8.16281L21.9066 14.9923C21.5505 15.6154 20.8878 16 20.1701 16H10.6641M10.6641 16L8.28698 19.8033C7.8707 20.4694 8.34954 21.3333 9.13498 21.3333H23.9974M10.6641 16L5.21685 5.10557C4.87806 4.428 4.18554 4 3.42799 4H2.66406M10.6641 26.6667C10.6641 27.403 10.0671 28 9.33073 28C8.59435 28 7.9974 27.403 7.9974 26.6667C7.9974 25.9303 8.59435 25.3333 9.33073 25.3333C10.0671 25.3333 10.6641 25.9303 10.6641 26.6667ZM23.9974 26.6667C23.9974 27.403 23.4004 28 22.6641 28C21.9277 28 21.3307 27.403 21.3307 26.6667C21.3307 25.9303 21.9277 25.3333 22.6641 25.3333C23.4004 25.3333 23.9974 25.9303 23.9974 26.6667Z" stroke="#5682FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <p>Баланс</p>
                        </div>
                        <div style={{ display: "flex", marginTop: 24, alignItems: "center", justifyContent: "space-between", fontSize: 20, fontWeight: 500 }}>
                            <p>Доступно</p>
                            <p>45,12 ТМТ</p>
                        </div>
                        <div style={{ display: "flex", marginTop: 16, alignItems: "center", justifyContent: "space-between", fontSize: 20, fontWeight: 500 }}>
                            <p>Режим</p>
                            <p>Депозит</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="oper-head">
                <h1>Сегодня по операциям</h1>
            </div>

            <div className="transactions-container" style={{ width: "100%", marginTop: 24, marginBottom: 100 }}>
                <div className="search-table">
                    <p className="tb-head">История транзакции</p>
                    <svg
                        width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"
                        className={`refresh-table ${loading ? "spinning" : ""}`}
                        role="button" aria-label="Обновить" tabIndex={0}
                        onClick={() => { if (!loading) setRefreshTick(v => v + 1); }}
                        style={{ cursor: loading ? "not-allowed" : "pointer", outline: "none" }}
                    >
                        <rect width="40" height="40" rx="8" fill="#2D85EA" />
                        <path d="M12 18H15.7535M12 18V14M12 18L15.1347 14.3431C18.0778 11.219 22.8495 11.219 25.7927 14.3431C28.7358 17.4673 28.7358 22.5327 25.7927 25.6569C22.8495 28.781 18.0778 28.781 15.1347 25.6569C14.3963 24.873 13.8431 23.9669 13.4752 23" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                <div className="table-viewport table-oper" style={{ position: "relative" }}>
                    {(err || (!err && rows.length === 0)) && (
                        <div className="table-message"><p>{err || "Нет данных за выбранный период"}</p></div>
                    )}

                    <table style={{ opacity: err || (!err && rows.length === 0) ? 0.3 : 1 }}>
                        <tr className="row-titles oper-row" style={{ marginBottom: 16, marginTop: 14 }}>
                            <p>Дата</p><p>Время</p><p>ID Транзакции</p><p>Оператор</p>
                            <p>Категория</p><p>Описание</p><p>Сумма</p><p>Статус</p><p>Ссылка</p>
                        </tr>

                        {!err && rows.map((tx, i) => {
                            const { date, time } = formatDateTime(tx.datetime);
                            const key = normalizeStatus(tx.status);
                            const StatusDef = STATUS[key] || {};
                            const Icon = StatusDef.Icon;

                            return (
                                <tr key={tx.transaction_id || i} className="row-titles row-data oper-row">
                                    <p>{date}</p>
                                    <p>{time}</p>
                                    <p className="trans-overflow" style={{ color: "#2D85EA", cursor: "pointer", textDecoration: "underline" }}>
                                        {tx.transaction_id}
                                    </p>
                                    <p className="trans-overflow" style={{ color: "#2D85EA" }}>{tx.operator}</p>
                                    <p>{tx.category}</p>
                                    <p>{tx.description}</p>
                                    <p>{tx.amount} TMT</p>
                                    <div className="status-block">
                                        <div className="status-cell" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            {Icon && <Icon />}
                                            <p className="trans-overflow">{StatusDef.label || tx.status}</p>
                                        </div>
                                    </div>
                                    <p>
                                        {tx.instruction_url
                                            ? <a href={tx.instruction_url} target="_blank" rel="noreferrer" style={{ color: "#2D85EA" }}>QR/Инструкция</a>
                                            : "—"}
                                    </p>
                                </tr>
                            );
                        })}
                    </table>
                </div>

                {/* simple prev/next */}
                {totalPages && totalPages > 1 && (
                    <div className="pags" style={{ marginTop: 12 }}>
                        <button className="inactive-btn" disabled={loading || page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Назад</button>
                        <button className="inactive-btn" disabled={loading} onClick={() => setPage(p => p + 1)}>Далее</button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Home2