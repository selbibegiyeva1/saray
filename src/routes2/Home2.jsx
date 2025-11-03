import React from 'react';

import "../styles/Home.css";
import "../styles/OperatorHome.css";

function Home2() {
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

            <div className="transactions-container" style={{ width: "100%", marginTop: 24 }}>
                <div className="table-viewport table-oper" style={{ position: "relative" }}>
                    <table>
                        <tr className="row-titles oper-row" style={{ marginBottom: 16, marginTop: 14 }}>
                            <p>Дата</p>
                            <p>Время</p>
                            <p>ID Транзакции</p>
                            <p>Оператор</p>
                            <p>Категория</p>
                            <p>Описание</p>
                            <p>Сумма</p>
                            <p>Статус</p>
                            <p>Ссылка</p>
                        </tr>
                        <tr className="row-titles row-data oper-row">
                            <p>Авг 6, 2024</p>
                            <p>15:56</p>
                            <p
                                className="trans-overflow"
                                style={{
                                    color: "#2D85EA",
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                }}
                            >
                                x0565847856584785
                            </p>

                            <p className="trans-overflow" style={{ color: "#2D85EA" }}>
                                Гуванч
                            </p>
                            <p>eSIM</p>
                            <p>Merhaba 10gb, 3 day</p>
                            <p>+325 ТМТ</p>

                            <div className="status-block">
                                <div
                                    className="status-cell"
                                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13.3333 3.2796C12.3292 2.78059 11.1974 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 9.71833 17.4845 9.44028 17.4542 9.16667M17.5 4.16667L10 11.6667L7.5 9.16667" stroke="#14C57A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    <p className="trans-overflow">Успешно</p>
                                </div>
                            </div>

                            <p>QR/Инструкция</p>
                        </tr>
                        <tr className="row-titles row-data oper-row">
                            <p>Авг 6, 2024</p>
                            <p>15:56</p>
                            <p
                                className="trans-overflow"
                                style={{
                                    color: "#2D85EA",
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                }}
                            >
                                x0565847856584785
                            </p>

                            <p className="trans-overflow" style={{ color: "#2D85EA" }}>
                                Гуванч
                            </p>
                            <p>eSIM</p>
                            <p>Merhaba 10gb, 3 day</p>
                            <p>+325 ТМТ</p>

                            <div className="status-block">
                                <div
                                    className="status-cell"
                                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.4896 8.33325H14.1693M17.4896 8.33325V4.99992M17.4896 8.33325L14.7166 5.28587C12.1132 2.68238 7.89205 2.68238 5.28856 5.28587C2.68506 7.88937 2.68506 12.1105 5.28856 14.714C7.89205 17.3175 12.1132 17.3175 14.7166 14.714C15.3699 14.0607 15.8592 13.3057 16.1846 12.4999M10.0026 7.49992V10.8333L12.5026 12.0833" stroke="#FFB01D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    <p className="trans-overflow">В процессе</p>
                                </div>
                            </div>

                            <p>QR/Инструкция</p>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Home2