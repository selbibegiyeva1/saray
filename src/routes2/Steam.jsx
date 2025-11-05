import React, { useState } from 'react';
import "../styles/Steam.css";

function Steam() {
    const [activeTab, setActiveTab] = useState("topup"); // 'topup' or 'voucher'
    const [activeVoucher, setActiveVoucher] = useState("100 ТМТ");

    return (
        <div className='Steam'>
            <h1>Steam</h1>

            <form className="steam-grid">
                <div>
                    <div className="steam-block">
                        <div className="s-block-f">
                            <img src="/steamsmall.png" alt="img" />
                            <div>
                                <p className='s-block-h'>Пополнение баланса Steam</p>
                                <span>
                                    Ваучер для пополнения баланса аккаунта <br />
                                    (При регистрации нового аккаунта используйте почту от gmail.com)
                                </span>
                                <div className="s-block-btns">
                                    <button
                                        type="button"
                                        className={activeTab === "topup" ? "active" : ""}
                                        onClick={() => setActiveTab("topup")}
                                    >
                                        Пополнение
                                    </button>
                                    <button
                                        type="button"
                                        className={activeTab === "voucher" ? "active" : ""}
                                        onClick={() => setActiveTab("voucher")}
                                    >
                                        Ваучер
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Topup section --- */}
                    {activeTab === "topup" && (
                        <>
                            <div className="steam-block" style={{ marginTop: 16 }} id='topup'>
                                <p className='s-block-h'>Выберите регион</p>
                                <div style={{ position: "relative", marginTop: 16 }}>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                        xmlns="http://www.w3.org/2000/svg" className='slct-arr'>
                                        <path d="M3.33854 6.66699L10.0052 13.3337L16.6719 6.66699"
                                            stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <select>
                                        <option>Турция</option>
                                    </select>
                                </div>
                            </div>

                            <div className="steam-block" style={{ marginTop: 16 }} id='topup'>
                                <p className='s-block-h'>Пополнение аккаунта</p>
                                <div style={{ position: "relative", marginTop: 16 }}>
                                    <input type="text" placeholder='Введите логин в Steam' />
                                </div>
                                <div className="block-grid">
                                    <div>
                                        <span>Сумма пополнения в ТМТ</span>
                                        <input type="text" placeholder='Сумма пополнения в ТМТ' />
                                        <div className='block-flex'>
                                            <p>Максимальная сумма 1000 ТМТ</p>
                                            <p>Максимальная сумма 1000 ТМТ</p>
                                        </div>
                                    </div>
                                    <div>
                                        <span>К зачислению в Steam</span>
                                        <input type="text" placeholder='К зачислению в Steam' />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* --- Voucher section --- */}
                    {activeTab === "voucher" && (
                        <div>
                            <div className="steam-block" style={{ marginTop: 16 }} id="voucher">
                                <p className="s-block-h">Выберите регион</p>
                                <div style={{ position: "relative", marginTop: 16 }}>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                        xmlns="http://www.w3.org/2000/svg" className='slct-arr'>
                                        <path d="M3.33854 6.66699L10.0052 13.3337L16.6719 6.66699"
                                            stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <select>
                                        <option>Турция</option>
                                    </select>
                                </div>

                                <div style={{ marginTop: 20 }}>
                                    <b>Выберите номинал</b>
                                    <div className="voucher-options">
                                        {["100 ТМТ", "250 ТМТ", "500 ТМТ", "1000 ТМТ"].map((value, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                className={`voucher-btn ${activeVoucher === value ? "active" : ""}`}
                                                onClick={() => setActiveVoucher(value)}
                                            >
                                                {value}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="steam-block" style={{ marginTop: 16 }} id="voucher">
                                <p className="s-block-h">Пополнение аккаунта</p>
                                <div style={{ marginTop: 20 }}>
                                    <span style={{ marginBottom: 16, fontSize: 14, display: "flex" }}>Куда отправить ваучер</span>
                                    <input type="text" placeholder='Напишите свою почту' />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <div className="steam-block">
                        <p className='steam-bal-h'>Оплата</p>
                        <div className='bal-flex'>
                            <p>К зачислению в Steam</p>
                            <p>~20.5$</p>
                        </div>
                        <div className='bal-flex'>
                            <p>Итого к списанию</p>
                            <p>105 ТМТ</p>
                        </div>
                        <label className="checkbox" style={{ marginTop: 20 }}>
                            <input type="checkbox" />
                            <span className="checkmark"></span>
                            <span className="label">Я подтверждаю, что правильно указал все данные</span>
                        </label>
                        <div>
                            <button className="pay-btn">Оплатить</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default Steam;