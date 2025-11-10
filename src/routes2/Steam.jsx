import React, { useEffect, useState } from "react";
import api from "../lib/api"; // axios instance with auth attached

import "../styles/Steam.css";

function Steam() {
    const [activeTab, setActiveTab] = useState("topup"); // 'topup' or 'voucher'
    const [activeVoucher, setActiveVoucher] = useState(null);

    // inside Steam component, add state
    const [voucherRegions, setVoucherRegions] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState("");
    const [loadingRegions, setLoadingRegions] = useState(false);
    const [fetchErr, setFetchErr] = useState(null);

    // new
    const [topupRegions, setTopupRegions] = useState([]);
    const [selectedTopupRegion, setSelectedTopupRegion] = useState("");
    const [loadingForms, setLoadingForms] = useState(false);

    // after your existing states
    const [voucherProducts, setVoucherProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [confirmed, setConfirmed] = useState(false);

    const [selectedVoucher, setSelectedVoucher] = useState(null);  // full object

    const [modalConfirmed, setModalConfirmed] = useState(false);

    const [userEmail, setUserEmail] = useState("");

    const [steamMinAmount, setSteamMinAmount] = useState(null);
    const [steamMaxAmount, setSteamMaxAmount] = useState(null);

    const [topupAmountTmt, setTopupAmountTmt] = useState("");
    const [topupAmountUsd, setTopupAmountUsd] = useState("");
    const [calcLoading, setCalcLoading] = useState(false);

    const [topupLogin, setTopupLogin] = useState("");

    useEffect(() => {
        const loadForms = async () => {
            setLoadingForms(true);
            setFetchErr(null);
            try {
                const { data } = await api.get("/v1/partner/catalog/product/group/form", {
                    params: { group: "Steam" }
                });

                const root = data?.data ?? data ?? {};

                // voucher fields
                const voucherFieldsObj = Array.isArray(root?.forms?.voucher_fields)
                    ? root.forms.voucher_fields : null;
                const voucherFieldsArr = Array.isArray(root?.forms)
                    ? root.forms.flatMap(f => Array.isArray(f?.voucher_fields) ? f.voucher_fields : [])
                    : null;
                const voucherFields = voucherFieldsObj ?? voucherFieldsArr ?? [];

                const regionField = voucherFields.find(f => f.name === "region");
                const productField = voucherFields.find(f => f.name === "product_id");

                setVoucherRegions(Array.isArray(regionField?.options) ? regionField.options : []);
                setVoucherProducts(Array.isArray(productField?.options) ? productField.options : []);

                // topup fields
                const topupFieldsObj = Array.isArray(root?.forms?.topup_fields)
                    ? root.forms.topup_fields : null;
                const topupFieldsArr = Array.isArray(root?.forms)
                    ? root.forms.flatMap(f => Array.isArray(f?.topup_fields) ? f.topup_fields : [])
                    : null;
                const topupFields = topupFieldsObj ?? topupFieldsArr ?? [];

                const topupRegionField = topupFields.find(f => f.name === "region");
                setTopupRegions(Array.isArray(topupRegionField?.options) ? topupRegionField.options : []);
            } catch (e) {
                setFetchErr("Не удалось загрузить формы");
            } finally {
                setLoadingForms(false);
            }
        };

        loadForms();
    }, []);

    useEffect(() => {
        if (!selectedRegion) {
            setFilteredProducts([]);
            return;
        }

        const filtered = voucherProducts.filter(
            (p) => p.region?.toLowerCase() === selectedRegion.toLowerCase() ||
                p.region?.toLowerCase() ===
                voucherRegions.find(r => r.value === selectedRegion)?.name?.toLowerCase()
        );

        setFilteredProducts(filtered);
    }, [selectedRegion, voucherProducts]);

    const [pay, setPay] = useState(false);
    const payFunc = () => {
        setPay(prev => {
            const next = !prev;
            if (next) setModalConfirmed(false); // reset on open
            return next;
        });
    };

    useEffect(() => {
        const loadSteamLimits = async () => {
            try {
                const { data } = await api.get("/v1/partner/steam/info");
                // adjust endpoint if the real one differs
                const root = data?.data ?? data ?? {};
                setSteamMinAmount(root.steam_min_amount_tmt ?? null);
                setSteamMaxAmount(root.steam_max_amount_tmt ?? null);
            } catch (err) {
                console.error("Failed to fetch Steam limits", err);
            }
        };

        loadSteamLimits();
    }, []);

    useEffect(() => {
        const raw = String(topupAmountTmt);
        if (!raw.trim()) {            // empty -> clear preview
            setTopupAmountUsd("");
            return;
        }

        const v = Number(raw.replace(",", "."));
        if (!Number.isFinite(v) || v <= 0) { // invalid number -> clear preview
            setTopupAmountUsd("");
            return;
        }

        setCalcLoading(true);

        const tid = setTimeout(async () => {
            try {
                const { data } = await api.get("/v1/partner/steam/rate", { params: { amount_tmt: v } });
                const root = data?.data ?? data ?? {};
                setTopupAmountUsd(root.topup_amount_usd != null ? String(root.topup_amount_usd) : "");
            } catch (e) {
                console.error("calc usd error", e?.response || e);
                setTopupAmountUsd("");
            } finally {
                setCalcLoading(false);
            }
        }, 400); // debounce ms

        return () => clearTimeout(tid);
    }, [topupAmountTmt]);

    const selectedRegionName =
        activeTab === "voucher"
            ? voucherRegions.find(r => r.value === selectedRegion)?.name || "—"
            : topupRegions.find(r => r.value === selectedTopupRegion)?.name || "—";

    const canPayVoucher =
        confirmed &&
        selectedVoucher &&
        selectedRegion &&
        userEmail.trim() !== "";

    const parsedAmount = Number(String(topupAmountTmt).replace(",", "."));
    const amountWithinLimits =
        Number.isFinite(parsedAmount) &&
        (steamMinAmount == null || parsedAmount >= steamMinAmount) &&
        (steamMaxAmount == null || parsedAmount <= steamMaxAmount);

    const canPayTopup =
        confirmed &&
        selectedTopupRegion &&
        topupLogin.trim() !== "" &&
        String(topupAmountTmt).trim() !== "" &&
        amountWithinLimits;

    const contactLabel = activeTab === "voucher" ? "Почта" : "Логин в Steam";
    const contactValue = activeTab === "voucher" ? userEmail : topupLogin;

    // inside Steam() in Steam.jsx

    const [paying, setPaying] = useState(false);
    const [payError, setPayError] = useState("");

    const [appAlert, setAppAlert] = useState({ type: null, message: "" });
    const closeAlert = () => setAppAlert({ type: null, message: "" });

    async function handlePayTopup() {
        setPayError("");
        setAppAlert({ type: null, message: "" });

        if (!modalConfirmed) return;
        const amount = Number(String(topupAmountTmt).replace(",", "."));
        if (!selectedTopupRegion || !topupLogin.trim() || !Number.isFinite(amount)) {
            setPayError("Заполните все поля корректно");
            return;
        }
        if (steamMinAmount != null && amount < steamMinAmount) {
            setPayError(`Минимальная сумма ${steamMinAmount} ТМТ`);
            return;
        }
        if (steamMaxAmount != null && amount > steamMaxAmount) {
            setPayError(`Максимальная сумма ${steamMaxAmount} ТМТ`);
            return;
        }

        setPaying(true);
        try {
            const { data } = await api.post("/v1/products/steam/pay", {
                steam_username: topupLogin.trim(),
                amount_tmt: amount,
            });

            if (data?.status && data?.voucher) {
                // deduct balance locally
                window.dispatchEvent(new CustomEvent("balance:decrement", { detail: { amount } }));
                // redirect to backend link
                window.location.href = data.voucher;
                return;
            }

            // ❌ backend responded but with error -> show alert
            const msg = data?.comment || "Не удалось выполнить оплату";
            setAppAlert({ type: "red", message: msg });
        } catch (e) {
            // ❌ network / backend crash -> show alert
            const msg = e?.response?.data?.comment || e?.response?.data?.message || "Ошибка оплаты";
            setAppAlert({ type: "red", message: msg });
        } finally {
            setPaying(false);
        }
    }

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
                                    <select
                                        value={selectedTopupRegion}
                                        onChange={(e) => setSelectedTopupRegion(e.target.value)}
                                        disabled={loadingForms || !!fetchErr}
                                    >
                                        <option value="" disabled>
                                            {loadingForms ? "Загрузка..." : fetchErr ? "Ошибка загрузки" : "Выберите регион"}
                                        </option>
                                        {topupRegions.map(opt => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.name ?? opt.value}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="steam-block" style={{ marginTop: 16 }} id='topup'>
                                <p className='s-block-h'>Пополнение аккаунта</p>
                                <div style={{ position: "relative", marginTop: 16 }}>
                                    <input
                                        type="text"
                                        placeholder="Введите логин в Steam"
                                        value={topupLogin}
                                        onChange={(e) => setTopupLogin(e.target.value)}
                                    />
                                </div>
                                <div className="block-grid">
                                    <div>
                                        <span>Сумма пополнения в ТМТ</span>
                                        <input
                                            type="text"
                                            value={topupAmountTmt}
                                            onChange={(e) => setTopupAmountTmt(e.target.value)}
                                            placeholder={steamMinAmount ? `от ${steamMinAmount} ТМТ` : "Сумма пополнения в ТМТ"}
                                        />

                                        <div className='block-flex'>
                                            <p>Минимальная сумма {steamMinAmount ?? "—"} ТМТ</p>
                                            <p>Максимальная сумма {steamMaxAmount ?? "—"} ТМТ</p>
                                        </div>
                                    </div>

                                    <div>
                                        <span>К зачислению в Steam</span>
                                        <input
                                            type="text"
                                            value={calcLoading ? "Рассчитываем…" : (topupAmountUsd ? `~${topupAmountUsd} USD` : "")}
                                            readOnly
                                            placeholder="К зачислению в Steam"
                                        />
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
                                        xmlns="http://www.w3.org/2000/svg" className="slct-arr">
                                        <path d="M3.33854 6.66699L10.0052 13.3337L16.6719 6.66699"
                                            stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>

                                    <select
                                        value={selectedRegion}
                                        onChange={(e) => {
                                            setSelectedRegion(e.target.value);
                                            setActiveVoucher(null);
                                            setSelectedVoucher(null);
                                        }}
                                        disabled={loadingRegions || !!fetchErr}
                                    >
                                        <option value="" disabled>
                                            {loadingRegions ? "Загрузка..." : fetchErr ? "Ошибка загрузки" : "Выберите регион"}
                                        </option>

                                        {voucherRegions.map(opt => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.name ?? opt.value}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedRegion && filteredProducts.length > 0 && (
                                    <div style={{ marginTop: 20 }}>
                                        <b>Выберите номинал</b>
                                        <div className="voucher-options">
                                            {filteredProducts.map((p) => (
                                                <button
                                                    key={p.value}
                                                    type="button"
                                                    className={`voucher-btn ${activeVoucher === p.value ? "active" : ""}`}
                                                    onClick={() => {
                                                        setActiveVoucher(p.value);
                                                        setSelectedVoucher(p);
                                                    }}
                                                >
                                                    {p.product}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="steam-block" style={{ marginTop: 16 }} id="voucher">
                                <p className="s-block-h">Пополнение аккаунта</p>
                                <div style={{ marginTop: 20 }}>
                                    <span style={{ marginBottom: 16, fontSize: 14, display: "flex" }}>Куда отправить ваучер</span>
                                    <input
                                        type="email"
                                        placeholder="Напишите свою почту"
                                        value={userEmail}
                                        onChange={(e) => setUserEmail(e.target.value)}
                                    />
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
                            {activeTab === "voucher" ? (
                                <p>{selectedVoucher ? selectedVoucher.product : "—"}</p>
                            ) : (
                                // USD here
                                <p>{topupAmountUsd ? `~${topupAmountUsd} USD` : "—"}</p>
                            )}
                        </div>

                        <div className='bal-flex'>
                            <p>Итого к списанию</p>
                            {activeTab === "voucher" ? (
                                <p>{selectedVoucher ? `${selectedVoucher.price} ТМТ` : "—"}</p>
                            ) : (
                                // TMT here
                                <p>{topupAmountTmt ? `${topupAmountTmt} ТМТ` : "—"}</p>
                            )}
                        </div>
                        <label className="checkbox" style={{ marginTop: 20 }}>
                            <input
                                type="checkbox"
                                checked={confirmed}
                                onChange={(e) => setConfirmed(e.target.checked)}
                            />
                            <span className="checkmark"></span>
                            <span className="label">Я подтверждаю, что правильно указал все данные</span>
                        </label>
                        <div>
                            <button
                                type="button"
                                className="pay-btn"
                                onClick={payFunc}
                                disabled={activeTab === "voucher" ? !canPayVoucher : !canPayTopup}
                            >
                                Оплатить
                            </button>
                        </div>
                    </div>
                </div>
                <div className={pay ? "steam-pay showpay" : "steam-pay"}>
                    <div className="payform">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <p className="formhead">Пополнение баланса Steam</p>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={payFunc} style={{ cursor: "pointer" }}>
                                <path d="M6 6L18 18M18 6L6 18" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </div>
                        <div className="paydata">
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <p>Регион</p>
                                <p>{selectedRegionName}</p>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <p>{contactLabel}</p>
                                <p>{contactValue || "—"}</p>
                            </div>
                            <div className='bal-flex'>
                                <p>К зачислению в Steam</p>
                                {activeTab === "voucher" ? (
                                    <p>{selectedVoucher ? selectedVoucher.product : "—"}</p>
                                ) : (
                                    // USD here
                                    <p>{topupAmountUsd ? `~${topupAmountUsd} USD` : "—"}</p>
                                )}
                            </div>

                            <div className='bal-flex'>
                                <p>Итого к списанию</p>
                                {activeTab === "voucher" ? (
                                    <p>{selectedVoucher ? `${selectedVoucher.price} ТМТ` : "—"}</p>
                                ) : (
                                    // TMT here
                                    <p>{topupAmountTmt ? `${topupAmountTmt} ТМТ` : "—"}</p>
                                )}
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "16px 0px" }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 16H12.01M12 8V12M9 4H15L20 9V15L15 20H9L4 15V9L9 4Z" stroke="#F50100" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <p style={{ fontSize: 14, fontWeight: 500, color: "#F50100" }}>Товар возврату не подлежит</p>
                        </div>

                        <div className="paydata">
                            <div className='bal-flex'>
                                <p>К зачислению в Steam</p>
                                {activeTab === "voucher" ? (
                                    <p>{selectedVoucher ? selectedVoucher.product : "—"}</p>
                                ) : (
                                    // USD here
                                    <p>{topupAmountUsd ? `~${topupAmountUsd} USD` : "—"}</p>
                                )}
                            </div>

                            <div className='bal-flex'>
                                <p>Итого к списанию</p>
                                {activeTab === "voucher" ? (
                                    <p>{selectedVoucher ? `${selectedVoucher.price} ТМТ` : "—"}</p>
                                ) : (
                                    // TMT here
                                    <p>{topupAmountTmt ? `${topupAmountTmt} ТМТ` : "—"}</p>
                                )}
                            </div>
                        </div>

                        <label className="checkbox" style={{ marginTop: 20 }}>
                            <input
                                type="checkbox"
                                checked={modalConfirmed}
                                onChange={(e) => setModalConfirmed(e.target.checked)}
                            />
                            <span className="checkmark"></span>
                            <span className="label">Я подтверждаю, что правильно указал все данные</span>
                        </label>
                        <div>
                            <button
                                type="button"
                                className="pay-btn"
                                disabled={!modalConfirmed || paying}
                                onClick={handlePayTopup}
                            >
                                {paying ? "Оплачиваем…" : "Оплатить"}
                            </button>
                            {payError ? <div style={{ marginTop: 8, color: "#F50100" }}>{payError}</div> : null}
                            <button type="button" className="pay-btn cancel" onClick={payFunc}>Отмена</button>
                        </div>

                        {appAlert.type && (
                            <div className="alerts">
                                {appAlert.type === "red" && (
                                    <div className="alt red" role="alert">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M16 12H8M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#ED2428" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span>{appAlert.message}</span>
                                        <svg width="20" height="20" viewBox="0 0 20 20" className="alt-close" onClick={closeAlert} xmlns="http://www.w3.org/2000/svg">
                                            <path d="M5 5L15 15M15 5L5 15" stroke="black" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}

export default Steam;