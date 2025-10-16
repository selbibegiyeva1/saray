import { useState } from "react";
import { useTranslation } from "react-i18next";

function EarnedReport() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "ru";

  // === DATA (demo) ===
  const [hasTransactions] = useState(true);
  const transactions = [
    { date: "01.11.2025  - 30.11.2025", time: "eSIM", txId: "58.451,32 ТМТ", orderId: "25 шт", category: "58.451,32 ТМТ" },
    { date: "01.11.2025  - 30.11.2025", time: "eSIM", txId: "58.451,32 ТМТ", orderId: "25 шт", category: "58.451,32 ТМТ" },
    { date: "01.11.2025  - 30.11.2025", time: "eSIM", txId: "58.451,32 ТМТ", orderId: "25 шт", category: "58.451,32 ТМТ" },
    { date: "01.11.2025  - 30.11.2025", time: "eSIM", txId: "58.451,32 ТМТ", orderId: "25 шт", category: "58.451,32 ТМТ" },
    { date: "01.11.2025  - 30.11.2025", time: "eSIM", txId: "58.451,32 ТМТ", orderId: "25 шт", category: "58.451,32 ТМТ" },
    { date: "01.11.2025  - 30.11.2025", time: "eSIM", txId: "58.451,32 ТМТ", orderId: "25 шт", category: "58.451,32 ТМТ" },
    { date: "01.11.2025  - 30.11.2025", time: "eSIM", txId: "58.451,32 ТМТ", orderId: "25 шт", category: "58.451,32 ТМТ" },
    { date: "01.11.2025  - 30.11.2025", time: "eSIM", txId: "58.451,32 ТМТ", orderId: "25 шт", category: "58.451,32 ТМТ" },
    { date: "01.11.2025  - 30.11.2025", time: "eSIM", txId: "58.451,32 ТМТ", orderId: "25 шт", category: "58.451,32 ТМТ" },
    { date: "01.11.2025  - 30.11.2025", time: "eSIM", txId: "58.451,32 ТМТ", orderId: "25 шт", category: "58.451,32 ТМТ" },
    { date: "01.11.2025  - 30.11.2025", time: "eSIM", txId: "58.451,32 ТМТ", orderId: "25 шт", category: "58.451,32 ТМТ" },
    { date: "01.11.2025  - 30.11.2025", time: "eSIM", txId: "58.451,32 ТМТ", orderId: "25 шт", category: "58.451,32 ТМТ" },

  ];

  // === OPTIONS (mirror Home) ===
  const categoryOptions = [
    { value: "eSIM", label: { ru: "eSIM", tm: "eSIM" } },
    { value: "digital", label: { ru: "Цифровые товары", tm: "Sanly harytlar" } },
    { value: "all", label: { ru: "Всё", tm: "Ählisi" } },
  ];

  const paymentOptions = [
    { value: "card", label: { ru: "Карта", tm: "Bank kart" } },
    { value: "cash", label: { ru: "Наличные", tm: "Nagt pul" } },
    { value: "all", label: { ru: "Всё", tm: "Ählisi" } },
  ];

  // === STATE (mirror Home) ===
  const [filter, setFilter] = useState(false);
  const [openCat, setOpenCat] = useState(false);
  const [openPay, setOpenPay] = useState(false);

  const [category, setCategory] = useState("eSIM");
  const [payment, setPayment] = useState("card");

  const filterFunc = () => setFilter((v) => !v);

  return (
    <div>
      <div className="grid-blocks">
        <div className="g-block">
          <div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 15.8333H17.5M10 10V15.8333M15 10V15.8333M5 10V15.8333M10.4472 2.72361L16.59 5.79502C17.4395 6.21973 17.1372 7.5 16.1875 7.5H3.81246C2.86276 7.5 2.56053 6.21973 3.40997 5.79501L9.55279 2.72361C9.83431 2.58284 10.1657 2.58284 10.4472 2.72361Z" stroke="#2D85EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>{t("home.earned")}</p>
          </div>
          <p className="g-block-num">8.672,20 ТМТ</p>
        </div>

        <div className="g-block">
          <div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.8333 6.66634V5.33301C15.8333 4.22844 14.9379 3.33301 13.8333 3.33301H5.5C3.84315 3.33301 2.5 4.67615 2.5 6.33301V13.6663C2.5 15.3232 3.84315 16.6663 5.5 16.6663H15.5C16.6046 16.6663 17.5 15.7709 17.5 14.6663V8.33301C17.5 7.41253 16.7538 6.66634 15.8333 6.66634ZM15.8333 6.66634H5.83333M14.1667 11.6663H13.3333" stroke="#2D85EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>{t("reports.lastWithdrawal")}</p>
          </div>
          <p className="g-block-num">8.672,20 ТМТ </p>
          <span style={{ fontWeight: 500 }}>12 окт 2025</span>
        </div>
      </div>

      <div className="transactions-container with">
        <div className="search-table search-earn">
          <p className="tb-head">{t("reports.periodSummary")}</p>

          {/* === FILTER (same as Home) === */}
          <div className="nav-filter">
            <button type="button" onClick={filterFunc} aria-expanded={filter}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.3335 5.83337H16.6668M5.83345 10H14.1668M9.16678 14.1667H10.8334" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{t("home.filter")}</span>
            </button>

            <div className={filter ? "filter-drop drop filter-earn" : "filter-drop"}>
              <div className="prof-flex filter-flex">
                <span>{t("home.filter")}</span>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 72 75"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ cursor: "pointer" }}
                  onClick={filterFunc}
                >
                  <g id="close">
                    <path id="Icon" d="M18 19.5L54 55.5M54 19.5L18 55.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                </svg>
              </div>

              {/* Category */}
              <div className="filter-opts">
                <div className="opts-head">
                  <span>{t("home.category")}</span>
                  {category !== "eSIM" && (
                    <span className="reset-btn" onClick={() => setCategory("eSIM")}>
                      {t("home.reset")}
                    </span>
                  )}
                </div>

                <div style={{ position: "relative" }}>
                  <div
                    className="filter-select"
                    onClick={() => { setOpenCat((v) => !v); setOpenPay(false); }}
                    aria-expanded={openCat}
                  >
                    <p>{categoryOptions.find((o) => o.value === category)?.label[currentLang]}</p>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.29289 5.29289L0.707107 1.70711C0.0771419 1.07714 0.523309 0 1.41421 0H8.58579C9.47669 0 9.92286 1.07714 9.29289 1.70711L5.70711 5.29289C5.31658 5.68342 4.68342 5.68342 4.29289 5.29289Z" fill="black" />
                    </svg>
                  </div>

                  {openCat && (
                    <div className="drop-options">
                      {categoryOptions.map((opt) => (
                        <p
                          key={opt.value}
                          className={opt.value === category ? "opt-active" : ""}
                          onClick={() => {
                            setCategory(opt.value);
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

              <div id="filter-btn">
                <button>{t("home.apply")}</button>
              </div>
            </div>
          </div>
        </div>
        <div className="table-viewport">
          <table>

            <tr className="row-titles withdrawn" style={{ marginBottom: 16, marginTop: 14 }}>
              <p>{t("reports.period")}</p>
              <p>{t("reports.category")}</p>
              <p>{t("reports.turnoverReports")}</p>
              <p>{t("reports.transactionsReports")}</p>
              <p>{t("reports.reward")}</p>
            </tr>

            {hasTransactions ? (
              transactions.map((tx, i) => (
                <tr key={i} className="row-titles row-data withdrawn">
                  <p>{tx.date}</p>
                  <p>{tx.time}</p>
                  <p className="trans-overflow">{tx.txId}</p>
                  <p className="trans-overflow">{tx.orderId}</p>
                  <p>{tx.category}</p>
                </tr>
              ))
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
  );
}

export default EarnedReport;