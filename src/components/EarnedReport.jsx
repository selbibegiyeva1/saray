import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

function EarnedReport() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "ru";

  // === CATEGORY OPTIONS ===
  const categoryOptions = [
    { value: "eSIM", label: { ru: "eSIM", tm: "eSIM" } },
    { value: "digitalGoods", label: { ru: "Цифровые товары", tm: "Sanly harytlar" } },
    { value: "all", label: { ru: "Всё", tm: "Hemmesi" } },
  ];

  const catLabel = (key) => {
    const opt = categoryOptions.find((o) => o.value === key);
    return opt ? opt.label[currentLang] : key;
  };

  // === MOCK DATA ===
  // time === localized category label
  const transactions = useMemo(
    () => [
      { date: "01.11.2025  - 30.11.2025", time: catLabel("eSIM"), txId: "58.451,32 ТМТ", orderId: "25 шт", category: "58.451,32 ТМТ" },
      { date: "01.11.2025  - 30.11.2025", time: catLabel("digitalGoods"), txId: "12.300,00 ТМТ", orderId: "10 шт", category: "12.300,00 ТМТ" },
      { date: "01.11.2025  - 30.11.2025", time: catLabel("all"), txId: "8.000,00 ТМТ", orderId: "7 шт", category: "8.000,00 ТМТ" },
      { date: "01.11.2025  - 30.11.2025", time: catLabel("eSIM"), txId: "21.110,50 ТМТ", orderId: "18 шт", category: "21.110,50 ТМТ" },
      { date: "01.11.2025  - 30.11.2025", time: catLabel("digitalGoods"), txId: "3.950,00 ТМТ", orderId: "4 шт", category: "3.950,00 ТМТ" },
      { date: "01.11.2025  - 30.11.2025", time: catLabel("all"), txId: "17.250,00 ТМТ", orderId: "13 шт", category: "17.250,00 ТМТ" },
      { date: "01.11.2025  - 30.11.2025", time: catLabel("eSIM"), txId: "9.999,99 ТМТ", orderId: "9 шт", category: "9.999,99 ТМТ" },
      { date: "01.11.2025  - 30.11.2025", time: catLabel("digitalGoods"), txId: "44.000,00 ТМТ", orderId: "30 шт", category: "44.000,00 ТМТ" },
      { date: "01.11.2025  - 30.11.2025", time: catLabel("all"), txId: "2.100,00 ТМТ", orderId: "3 шт", category: "2.100,00 ТМТ" },
      { date: "01.11.2025  - 30.11.2025", time: catLabel("eSIM"), txId: "6.400,00 ТМТ", orderId: "6 шт", category: "6.400,00 ТМТ" },
      { date: "01.11.2025  - 30.11.2025", time: catLabel("digitalGoods"), txId: "27.777,77 ТМТ", orderId: "22 шт", category: "27.777,77 ТМТ" },
      { date: "01.11.2025  - 30.11.2025", time: catLabel("all"), txId: "11.000,00 ТМТ", orderId: "8 шт", category: "11.000,00 ТМТ" },
    ],
    [currentLang] // re-localize when language switches
  );

  // === STATE ===
  const [hasTransactions] = useState(true);

  // Draft value (UI) vs Applied value (affects table)
  const DEFAULT_CAT = "eSIM";
  const [categoryDraft, setCategoryDraft] = useState(DEFAULT_CAT);
  const [categoryApplied, setCategoryApplied] = useState(DEFAULT_CAT);

  const [filterOpen, setFilterOpen] = useState(false);
  const [openCat, setOpenCat] = useState(false);

  const toggleFilter = () => setFilterOpen((v) => !v);

  // === APPLY / RESET ===
  const onApply = () => {
    setCategoryApplied(categoryDraft);
    setFilterOpen(false);
    setOpenCat(false);
  };

  const onReset = () => {
    setCategoryDraft(DEFAULT_CAT);
    setCategoryApplied(DEFAULT_CAT);
    setFilterOpen(false);
    setOpenCat(false);
  };

  // === FILTER LOGIC (uses APPLIED value only) ===
  const selectedAppliedLabel = catLabel(categoryApplied);
  const filteredTransactions = useMemo(() => {
    if (categoryApplied === "all") return transactions;
    return transactions.filter(
      (tx) => String(tx.time).toLowerCase() === String(selectedAppliedLabel).toLowerCase()
    );
  }, [categoryApplied, selectedAppliedLabel, transactions]);

  const currentDraftLabel =
    categoryOptions.find((o) => o.value === categoryDraft)?.label[currentLang] ?? categoryDraft;

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

          {/* FILTER */}
          <div className="nav-filter">
            <button type="button" onClick={toggleFilter} aria-expanded={filterOpen}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.3335 5.83337H16.6668M5.83345 10H14.1668M9.16678 14.1667H10.8334" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{t("home.filter")}</span>
            </button>

            <div className={filterOpen ? "filter-drop drop filter-earn" : "filter-drop"}>
              <div className="prof-flex filter-flex">
                <span>{t("home.filter")}</span>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 72 75"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ cursor: "pointer" }}
                  onClick={toggleFilter}
                >
                  <g id="close">
                    <path id="Icon" d="M18 19.5L54 55.5M54 19.5L18 55.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                </svg>
              </div>

              {/* Category (DRAFT) */}
              <div className="filter-opts">
                <div className="opts-head">
                  <span>{t("home.category")}</span>
                  {categoryDraft !== DEFAULT_CAT && (
                    <span className="reset-btn" onClick={onReset}>
                      {t("home.reset")}
                    </span>
                  )}
                </div>

                <div style={{ position: "relative" }}>
                  <div
                    className="filter-select"
                    onClick={() => setOpenCat((v) => !v)}
                    aria-expanded={openCat}
                  >
                    <p>{currentDraftLabel}</p>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.29289 5.29289L0.707107 1.70711C0.0771419 1.07714 0.523309 0 1.41421 0H8.58579C9.47669 0 9.92286 1.07714 9.29289 1.70711L5.70711 5.29289C5.31658 5.68342 4.68342 5.68342 4.29289 5.29289Z" fill="black" />
                    </svg>
                  </div>

                  {openCat && (
                    <div className="drop-options">
                      {categoryOptions.map((opt) => (
                        <p
                          key={opt.value}
                          className={opt.value === categoryDraft ? "opt-active" : ""}
                          onClick={() => {
                            setCategoryDraft(opt.value); // only draft is updated
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
                <button onClick={onApply}>{t("home.apply")}</button>
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
              (filteredTransactions.length > 0 ? filteredTransactions : []).map((tx, i) => (
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