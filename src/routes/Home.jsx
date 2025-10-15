import React, { useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useTranslation } from "react-i18next";

import Navbar from "../components/Navbar";
import BarChart from "../components/BarChart";

import "../styles/Home.css";

function Home() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "ru";

  // Translatable option arrays
  const periodOptions = [
    { value: "day", label: { ru: "День", tm: "Gün" } },
    { value: "month", label: { ru: "Месяц", tm: "Aý" } },
    { value: "year", label: { ru: "Год", tm: "Ýyl" } },
    { value: "all", label: { ru: "Всё", tm: "Ählisi" } },
  ];

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

  // Initials
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState(false);
  const [openCat, setOpenCat] = useState(false);
  const [openPay, setOpenPay] = useState(false);
  const [openDay, setOpenDay] = useState(false);

  const [category, setCategory] = useState("eSIM");
  const [payment, setPayment] = useState("card");
  const [period, setPeriod] = useState("day");

  const filterFunc = () => setFilter(!filter);

  // Chart data logic
  const getChartDataByPeriod = (p) => {
    const match = (ru, tm) => (currentLang === "ru" ? ru : tm);

    switch (p) {
      case "day":
        return {
          labels: ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00"],
          values: [5, 9, 12, 18, 24, 20, 16, 8],
          title: match("Оборот за день", "Bir günlik aýlanma"),
        };

      case "month":
        return {
          labels: match(
            ["Нед. 1", "Нед. 2", "Нед. 3", "Нед. 4"],
            ["1-nji hepde", "2-nji hepde", "3-nji hepde", "4-nji hepde"]
          ),
          values: [110, 140, 95, 160],
          title: match("Оборот за месяц", "Aýlyk aýlanma"),
        };

      case "year":
        return {
          labels: match(
            ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
            ["Ýan", "Few", "Mar", "Apr", "Maý", "Iýun", "Iýul", "Awg", "Sen", "Okt", "Noý", "Dek"]
          ),
          values: [300, 280, 360, 420, 500, 480, 510, 530, 490, 550, 600, 620],
          title: match("Оборот за год", "Ýyllyk aýlanma"),
        };

      case "all":
      default:
        return {
          labels: ["2021", "2022", "2023", "2024", "2025"],
          values: [2500, 3100, 4000, 5200, 6100],
          title: match("Оборот за всё время", "Ähli döwür boýunça aýlanma"),
        };
    }
  };

  const { labels, values } = getChartDataByPeriod(period);

  return (
    <div className='Home'>
      <Navbar />
      <div className="page-head">
        <h1>{t("home.title")}</h1>
        <form>
          <div className='nav-filter'>
            <button type='button' onClick={filterFunc}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.3335 5.83337H16.6668M5.83345 10H14.1668M9.16678 14.1667H10.8334" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span>{t("home.filter")}</span>
            </button>

            <div className={filter ? "filter-drop drop" : "filter-drop"}>
              <div className="prof-flex filter-flex">
                <span>{t("home.filter")}</span>
                <svg width="24" height="24" viewBox="0 0 72 75" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ cursor: "pointer" }} onClick={filterFunc}>
                  <g id="close">
                    <path id="Icon" d="M18 19.5L54 55.5M54 19.5L18 55.5" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </g>
                </svg>
              </div>

              <div className='filter-opts'>
                <div className='opts-head'>
                  <span>{t("home.category")}</span>
                  {category !== "eSIM" && (
                    <span className="reset-btn" onClick={() => setCategory("eSIM")}>
                      {t("home.reset")}
                    </span>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <div
                    className="filter-select"
                    onClick={() => { setOpenCat(v => !v); setOpenPay(false); }}
                    aria-expanded={openCat}
                  >
                    <p>
                      {
                        categoryOptions.find((opt) => opt.value === category)?.label[currentLang]
                      }
                    </p>
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


              {/* Метод оплаты */}
              <div className='filter-opts'>
                <div className='opts-head'>
                  <span>{t("home.paymentMethod")}</span>
                  {payment !== "card" && (
                    <span className="reset-btn" onClick={() => setPayment("card")}>
                      {t("home.reset")}
                    </span>
                  )}
                </div>

                <div style={{ position: "relative" }}>
                  <div
                    className="filter-select"
                    onClick={() => { setOpenPay(v => !v); setOpenCat(false); setOpenDay(false); }}
                    aria-expanded={openPay}
                    role="button"
                    tabIndex={0}
                  >
                    <p>
                      {
                        paymentOptions.find((opt) => opt.value === payment)?.label[currentLang]
                      }
                    </p>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.29289 5.29289L0.707107 1.70711C0.0771419 1.07714 0.523309 0 1.41421 0H8.58579C9.47669 0 9.92286 1.07714 9.29289 1.70711L5.70711 5.29289C5.31658 5.68342 4.68342 5.68342 4.29289 5.29289Z" fill="black" />
                    </svg>
                  </div>

                  {openPay && (
                    <div className="drop-options">
                      {paymentOptions.map((opt) => (
                        <p
                          key={opt.value}
                          className={opt.value === payment ? "opt-active" : ""}
                          onClick={() => {
                            setPayment(opt.value);
                            setOpenPay(false);
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
                <button>{t("home.apply")}</button>
              </div>
            </div>
          </div>
          <div className='nav-filter'>
            <button
              type='button'
              onClick={() => { setOpenDay(v => !v); setOpenCat(false); setOpenPay(false); }}
              aria-expanded={openDay}
              role="button"
              tabIndex={0}
            >
              <p>
                {
                  periodOptions.find((opt) => opt.value === period)?.label[currentLang]
                }
              </p>
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
      </div >
      {
        isLoading ? (
          <div className="grid-blocks" >
            {
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="g-block">
                  <Skeleton height={24} width={138} />
                  <div style={{ display: "flex", gap: "10px", margin: "10px 0px" }}>
                    <Skeleton height={24} width={138} />
                    <Skeleton height={24} width={54} />
                  </div>
                  <Skeleton height={24} width={54} />
                </div>
              ))
            }
          </div>
        ) : (
          <div className="grid-blocks">
            <div className="g-block">
              <div>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.74984 4.16667H14.9433C15.7111 4.16667 16.1925 4.99615 15.8116 5.66281L13.909 8.99228C13.5529 9.61543 12.8902 10 12.1725 10H6.6665M6.6665 10L5.53942 11.8033C5.12314 12.4694 5.60198 13.3333 6.38742 13.3333H14.9998M6.6665 10L3.46929 3.60557C3.13051 2.928 2.43798 2.5 1.68044 2.5H1.6665M6.6665 16.6667C6.6665 17.1269 6.29341 17.5 5.83317 17.5C5.37293 17.5 4.99984 17.1269 4.99984 16.6667C4.99984 16.2064 5.37293 15.8333 5.83317 15.8333C6.29341 15.8333 6.6665 16.2064 6.6665 16.6667ZM14.9998 16.6667C14.9998 17.1269 14.6267 17.5 14.1665 17.5C13.7063 17.5 13.3332 17.1269 13.3332 16.6667C13.3332 16.2064 13.7063 15.8333 14.1665 15.8333C14.6267 15.8333 14.9998 16.2064 14.9998 16.6667Z" stroke="#5682FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <p>{t("home.turnover")}</p>
              </div>
              <p className="g-block-num">8.672,20 ТМТ</p>
            </div>

            <div className="g-block">
              <div>
                <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.5 10V11.6667M10 4.16668H4.5C3.39543 4.16668 2.5 5.06211 2.5 6.16668V11.6667M2.5 11.6667V13.8333C2.5 14.9379 3.39543 15.8333 4.5 15.8333H15.5C16.6046 15.8333 17.5 14.9379 17.5 13.8333V11.6667M2.5 11.6667H17.5M19.1667 3.33334L15 7.50001L13.3333 5.83334" stroke="#2D85EA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <p>{t("home.transactions")}</p>
              </div>
              <p className="g-block-num">215 <span>{t("home.amountHome")}</span></p>
            </div>

            <div className="g-block">
              <div>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.8333 6.66668V5.33334C15.8333 4.22877 14.9379 3.33334 13.8333 3.33334H5.5C3.84315 3.33334 2.5 4.67649 2.5 6.33334V13.6667C2.5 15.3235 3.84315 16.6667 5.5 16.6667H15.5C16.6046 16.6667 17.5 15.7712 17.5 14.6667V8.33334C17.5 7.41287 16.7538 6.66668 15.8333 6.66668ZM15.8333 6.66668H5.83333M14.1667 11.6667H13.3333" stroke="#2D85EA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <p>{t("home.withdrawn")}</p>
              </div>
              <p className="g-block-num">8.672,20 ТМТ</p>
            </div>

            <div className="g-block">
              <div>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 15.8333H17.5M10 10V15.8333M15 10V15.8333M5 10V15.8333M10.4472 2.72361L16.59 5.79502C17.4395 6.21973 17.1372 7.5 16.1875 7.5H3.81246C2.86276 7.5 2.56053 6.21973 3.40997 5.79501L9.55279 2.72361C9.83431 2.58284 10.1657 2.58284 10.4472 2.72361Z" stroke="#2D85EA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <p>{t("home.earned")}</p>
              </div>
              <p className="g-block-num">8.672,20 ТМТ</p>
            </div>

            <div className="g-block">
              <div>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 4.16666H4.5C3.39543 4.16666 2.5 5.06209 2.5 6.16666V11.6667M17.5 2.5L13.3333 7.5M12.5 2.5L12.5 3.33333M18.3333 6.66666L18.3333 7.5M2.5 11.6667V13.8333C2.5 14.9379 3.39543 15.8333 4.5 15.8333H15.5C16.6046 15.8333 17.5 14.9379 17.5 13.8333V11.6667H2.5Z" stroke="#2D85EA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <p>{t("home.available")}</p>
                <div className="tooltip">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className='quest-i'>
                    <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="black" stroke-opacity="0.15" />
                    <path d="M16 20.1667H16.0083M16 17.6667C16.7422 16.0781 18.5 16.1953 18.5 14.3333C18.5 13.0833 17.6667 11.8333 16 11.8333C14.7101 11.8333 13.9194 12.582 13.6278 13.5M16 23.5C20.1421 23.5 23.5 20.1421 23.5 16C23.5 11.8579 20.1421 8.5 16 8.5C11.8579 8.5 8.5 11.8579 8.5 16C8.5 20.1421 11.8579 23.5 16 23.5Z" stroke="black" stroke-opacity="0.6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <span>{t("home.tooltip")}</span>
                </div>
              </div>
              <p className="g-block-num">8.672,20 ТМТ</p>
            </div>
          </div>
        )
      }

      <div className="chart-grid" id='home-charts'>
        <div className='chart-block'>
          <p className='chart-head'>{t("home.salesChart")}</p>
          <BarChart labels={labels} dataValues={values} />
        </div>
        <div className='chart-block'>
          <p className='chart-head'>{t("home.transactionChart")}</p>
          <BarChart labels={labels} dataValues={values} />
        </div>
      </div>
    </div >
  )
}

export default Home