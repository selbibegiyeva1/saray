import { useState } from "react";
import { useTranslation } from "react-i18next";

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

function TopUp() {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language || "ru";

    const STATUS = {
        success: { label: t("transactions.status.success"), Icon: SuccessIcon },
        rejected: { label: t("transactions.status.rejected"), Icon: RejectedIcon },
        pending: { label: t("transactions.status.pending"), Icon: PendingIcon },
    };

    const [hasTransactions] = useState(true);

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

    return (
        <div>
            <div className="transactions-container">
                <div className="search-table" style={{ marginBottom: 14 }}>
                    <p className="tb-head">{t("transactions.latest")}</p>
                    <button className={`filter-btn blue-nav`} type="button">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.0156 10H6.99999M3.0156 10V6M3.0156 10L6.34315 6.34315C9.46734 3.21895 14.5327 3.21895 17.6569 6.34315C20.781 9.46734 20.781 14.5327 17.6569 17.6569C14.5327 20.781 9.46734 20.781 6.34315 17.6569C5.55928 16.873 4.97209 15.9669 4.58158 15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
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
    )
}

export default TopUp