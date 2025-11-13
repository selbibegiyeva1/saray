import React, { useEffect, useState } from "react";
import api from "../lib/api"; // axios instance with auth attached

import "../styles/Steam.css";
import "../styles/Login.css";

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
    const [topupEmail, setTopupEmail] = useState("");   // ← move it here


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

    const isValidEmail = (value) => {
        const v = String(value || "").trim();
        if (!v) return false;
        // simple but good-enough pattern
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    };

    const canPayVoucher =
        confirmed &&
        selectedVoucher &&
        selectedRegion &&
        isValidEmail(userEmail);

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
        amountWithinLimits &&
        isValidEmail(topupEmail);

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
                email: topupEmail.trim() || undefined, // <— add this
            });

            if (data?.status && data?.voucher) {
                // 1) update balance right away
                window.dispatchEvent(new CustomEvent("balance:decrement", { detail: { amount } }));

                // 2) open backend page in new tab
                window.open(data.voucher, "_blank", "noopener,noreferrer");

                // 3) reset fields
                setSelectedTopupRegion("");
                setTopupLogin("");
                setTopupAmountTmt("");
                setTopupAmountUsd("");
                setConfirmed(false);
                setModalConfirmed(false);
                setFieldErrors({ region: false, login: false, amount: false, usd: false });
                setLimitError("");
                setActiveVoucher(null);
                setSelectedRegion("");
                setSelectedVoucher(null);
                setPay(false); // close modal

                // 4) show success alert with backend message if available
                const successMsg =
                    data?.comment || data?.message || "Оплата успешно создана. Продолжите в новой вкладке.";
                setAppAlert({ type: "green", message: successMsg });

                // optional smooth scroll to top
                window.scrollTo({ top: 0, behavior: "smooth" });

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

    async function handlePayVoucher() {
        if (!modalConfirmed) return;

        // basic guard: must have region, product and email
        if (!selectedRegion || !selectedVoucher || !userEmail.trim()) {
            setAppAlert({ type: "red", message: "Заполните все поля корректно" });
            return;
        }

        const payload = {
            product_id: selectedVoucher.value,   // option.value from voucher list
            email: String(userEmail).trim(),
        };

        setPaying(true);
        try {
            const { data } = await api.post("/v1/products/voucher/buy", payload);

            if (data?.status && data?.voucher) {
                // 1) decrease balance by voucher price
                const dec = Number(selectedVoucher.price) || 0;
                if (dec > 0) {
                    window.dispatchEvent(new CustomEvent("balance:decrement", { detail: { amount: dec } }));
                }

                // 2) open backend link in a NEW TAB
                window.open(data.voucher, "_blank", "noopener,noreferrer");

                // 3) reset voucher UI + close modal
                setSelectedRegion("");
                setActiveVoucher(null);
                setSelectedVoucher(null);
                setUserEmail("");
                setConfirmed(false);
                setModalConfirmed(false);
                setPay(false);

                // 4) success alert with backend text
                const successMsg = data?.comment || data?.message || "Покупка успешно создана. Продолжите в новой вкладке.";
                setAppAlert({ type: "green", message: successMsg });
                window.scrollTo({ top: 0, behavior: "smooth" });
                return;
            }

            const errMsg = data?.comment || data?.message || "Не удалось купить ваучер";
            setAppAlert({ type: "red", message: errMsg });
        } catch (e) {
            const errMsg = e?.response?.data?.comment || e?.response?.data?.message || "Ошибка покупки ваучера";
            setAppAlert({ type: "red", message: errMsg });
        } finally {
            setPaying(false);
        }
    }

    useEffect(() => {
        if (appAlert.type) {
            // close modal only on success (green), stay open on errors
            if (appAlert.type === "green") {
                setPay(false);
            }

            const timer = setTimeout(() => {
                setAppAlert({ type: null, message: "" });
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [appAlert]);

    const [fieldErrors, setFieldErrors] = useState({
        region: false,
        login: false,
        amount: false,
        usd: false, // 👈 new
        email: false, // ✅ add this
    });

    const [limitError, setLimitError] = useState("");

    function validateAmountLimits() {
        const amount = Number(String(topupAmountTmt).replace(",", "."));
        if (!Number.isFinite(amount) || amount <= 0) {
            setLimitError("");
            return false;
        }
        if (steamMaxAmount != null && amount > steamMaxAmount) {
            setLimitError(`Максимальная сумма ${steamMaxAmount} ТМТ`);
            return true;
        }
        if (steamMinAmount != null && amount < steamMinAmount) {
            setLimitError(`Минимальная сумма ${steamMinAmount} ТМТ`);
            return true;
        }
        setLimitError("");
        return false;
    }

    const selectedTopup = topupRegions.find(r => r.value === selectedTopupRegion);
    const isSNG =
        !!selectedTopup &&
        (
            /снг/i.test(String(selectedTopup.name || "")) ||                   // name contains "СНГ"
            ["CIS", "SNG", "CIS_COUNTRIES"].includes(String(selectedTopup.value || "").toUpperCase()) // or value is CIS-ish
        );

    const handleTopupAmountTmtChange = (e) => {
        const raw = e.target.value.replace(",", ".");

        if (raw === "") {
            setTopupAmountTmt("");
            setFieldErrors((f) => ({ ...f, amount: false, usd: false }));
            return;
        }

        // allow only digits + optional dot + max 2 decimals
        if (!/^\d+(\.\d{0,2})?$/.test(raw)) {
            return; // block invalid input
        }

        setTopupAmountTmt(raw);
        setFieldErrors((f) => ({ ...f, amount: false, usd: false }));
    };

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
                                <span className="s-d">
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
                                    <div className="v-tool">
                                        <button
                                            type="button"
                                            className={activeTab === "voucher" ? "active" : ""}
                                            onClick={() => setActiveTab("voucher")}
                                        >
                                            Ваучер
                                            <div className="icon-wrap">
                                                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <rect width="28" height="28" rx="10" fill="#F5F5F9" />
                                                    <rect x="0.5" y="0.5" width="27" height="27" rx="9.5" stroke="black" stroke-opacity="0.15" />
                                                    <path d="M14.0026 20.6663C15.8435 20.6663 17.5102 19.9201 18.7166 18.7137C19.9231 17.5073 20.6693 15.8406 20.6693 13.9997C20.6693 12.1587 19.9231 10.4921 18.7166 9.28563C17.5102 8.0792 15.8435 7.33301 14.0026 7.33301C12.1617 7.33301 10.495 8.0792 9.28856 9.28563C8.08213 10.4921 7.33594 12.1587 7.33594 13.9997C7.33594 15.8406 8.08213 17.5073 9.28856 18.7137C10.495 19.9201 12.1617 20.6663 14.0026 20.6663Z" stroke="black" stroke-opacity="0.8" stroke-width="1.3" stroke-linejoin="round" />
                                                    <path d="M14 15.5413V14.208C15.1046 14.208 16 13.3126 16 12.208C16 11.1034 15.1046 10.208 14 10.208C12.8954 10.208 12 11.1034 12 12.208" stroke="black" stroke-opacity="0.8" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M13.9974 18.5417C14.4576 18.5417 14.8307 18.1686 14.8307 17.7083C14.8307 17.2481 14.4576 16.875 13.9974 16.875C13.5372 16.875 13.1641 17.2481 13.1641 17.7083C13.1641 18.1686 13.5372 18.5417 13.9974 18.5417Z" fill="black" fill-opacity="0.8" />
                                                    <path d="M13.9971 17.125C14.3191 17.125 14.5809 17.386 14.5811 17.708C14.5811 18.0302 14.3192 18.292 13.9971 18.292C13.6751 18.2918 13.4141 18.0301 13.4141 17.708C13.4142 17.3861 13.6752 17.1252 13.9971 17.125Z" stroke="black" stroke-opacity="0.8" stroke-width="0.5" />
                                                </svg>
                                                <span>Ваучер — уникальная комбинация из цифр и букв. У ваучера есть денежный номинал, который зачисляется на игровой кошелёк при активации.</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Topup section --- */}
                    {activeTab === "topup" && (
                        <>
                            <div className="steam-block" style={{ marginTop: 16 }} id='topup'>
                                <p className='s-block-h' style={{ marginBottom: 16 }}>Выберите регион</p>
                                <div style={{ position: "relative" }}>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                        xmlns="http://www.w3.org/2000/svg" className='slct-arr'>
                                        <path d="M3.33854 6.66699L10.0052 13.3337L16.6719 6.66699"
                                            stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <select
                                        value={selectedTopupRegion}
                                        onChange={(e) => {
                                            setSelectedTopupRegion(e.target.value);
                                            setFieldErrors((f) => ({ ...f, region: false }));
                                        }}
                                        disabled={loadingForms || !!fetchErr}
                                        style={fieldErrors.region ? { border: "1px solid #F50100" } : {}}
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
                                    <div
                                        className="sng"
                                        style={{ display: isSNG ? "block" : "none" }}

                                    >
                                        <div style={{ position: "relative" }}>
                                            <svg
                                                width="28"
                                                height="28"
                                                viewBox="0 0 28 28"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="sng-icon"
                                            >
                                                <rect width="28" height="28" rx="10" fill="#F5F5F9" />
                                                <rect
                                                    x="0.5"
                                                    y="0.5"
                                                    width="27"
                                                    height="27"
                                                    rx="9.5"
                                                    stroke="black"
                                                    strokeOpacity="0.15"
                                                />
                                                <path
                                                    d="M14.0026 20.6663C15.8435 20.6663 17.5102 19.9201 18.7166 18.7137C19.9231 17.5073 20.6693 15.8406 20.6693 13.9997C20.6693 12.1587 19.9231 10.4921 18.7166 9.28563C17.5102 8.0792 15.8435 7.33301 14.0026 7.33301C12.1617 7.33301 10.495 8.0792 9.28856 9.28563C8.08213 10.4921 7.33594 12.1587 7.33594 13.9997C7.33594 15.8406 8.08213 17.5073 9.28856 18.7137C10.495 19.9201 12.1617 20.6663 14.0026 20.6663Z"
                                                    stroke="black"
                                                    strokeOpacity="0.8"
                                                    strokeWidth="1.3"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M14 15.5413V14.208C15.1046 14.208 16 13.3126 16 12.208C16 11.1034 15.1046 10.208 14 10.208C12.8954 10.208 12 11.1034 12 12.208"
                                                    stroke="black"
                                                    strokeOpacity="0.8"
                                                    strokeWidth="1.3"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    fillRule="evenodd"
                                                    clipRule="evenodd"
                                                    d="M13.9974 18.5417C14.4576 18.5417 14.8307 18.1686 14.8307 17.7083C14.8307 17.2481 14.4576 16.875 13.9974 16.875C13.5372 16.875 13.1641 17.2481 13.1641 17.7083C13.1641 18.1686 13.5372 18.5417 13.9974 18.5417Z"
                                                    fill="black"
                                                    fillOpacity="0.8"
                                                />
                                                <path
                                                    d="M13.9971 17.125C14.3191 17.125 14.5809 17.386 14.5811 17.708C14.5811 18.0302 14.3192 18.292 13.9971 18.292C13.6751 18.2918 13.4141 18.0301 13.4141 17.708C13.4142 17.3861 13.6752 17.1252 13.9971 17.125Z"
                                                    stroke="black"
                                                    strokeOpacity="0.8"
                                                    strokeWidth="0.5"
                                                />
                                            </svg>

                                            <span>
                                                Азербайджан, Армения, Беларусь, Казахстан, Киргизия, Молдова, Таджикистан,
                                                Туркменистан, Узбекистан
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="steam-block" style={{ marginTop: 16 }} id='topup'>
                                <p className='s-block-h'>Пополнение аккаунта</p>
                                <div className="block-grid" style={{ marginTop: 20 }}>
                                    <div>
                                        <div style={{ position: "relative" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                                                <span style={{ marginBottom: 0 }}>Где искать</span>
                                                <div style={{ position: "relative" }}>
                                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="acc-svg">
                                                        <rect width="32" height="32" rx="10" fill="#F5F5F9" />
                                                        <rect x="0.5" y="0.5" width="31" height="31" rx="9.5" stroke="black" stroke-opacity="0.15" />
                                                        <path d="M16.0026 22.6663C17.8435 22.6663 19.5102 21.9201 20.7166 20.7137C21.9231 19.5073 22.6693 17.8406 22.6693 15.9997C22.6693 14.1587 21.9231 12.4921 20.7166 11.2856C19.5102 10.0792 17.8435 9.33301 16.0026 9.33301C14.1617 9.33301 12.495 10.0792 11.2886 11.2856C10.0821 12.4921 9.33594 14.1587 9.33594 15.9997C9.33594 17.8406 10.0821 19.5073 11.2886 20.7137C12.495 21.9201 14.1617 22.6663 16.0026 22.6663Z" stroke="black" stroke-opacity="0.8" stroke-width="1.3" stroke-linejoin="round" />
                                                        <path d="M16 17.5413V16.208C17.1046 16.208 18 15.3126 18 14.208C18 13.1034 17.1046 12.208 16 12.208C14.8954 12.208 14 13.1034 14 14.208" stroke="black" stroke-opacity="0.8" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
                                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M15.9974 20.5417C16.4576 20.5417 16.8307 20.1686 16.8307 19.7083C16.8307 19.2481 16.4576 18.875 15.9974 18.875C15.5372 18.875 15.1641 19.2481 15.1641 19.7083C15.1641 20.1686 15.5372 20.5417 15.9974 20.5417Z" fill="black" fill-opacity="0.8" />
                                                        <path d="M15.9971 19.125C16.3191 19.125 16.5809 19.386 16.5811 19.708C16.5811 20.0302 16.3192 20.292 15.9971 20.292C15.6751 20.2918 15.4141 20.0301 15.4141 19.708C15.4142 19.3861 15.6752 19.1252 15.9971 19.125Z" stroke="black" stroke-opacity="0.8" stroke-width="0.5" />
                                                    </svg>

                                                    <div className="acc-tl">
                                                        <p>Как найти свой логин в Steam?</p>
                                                        <ul>
                                                            <li style={{ marginBottom: 16 }}>
                                                                <div style={{ minWidth: 8, minHeight: 8, background: "#2D85EA", borderRadius: "50%" }} />
                                                                Откройте клиент Steam.Нажмите на имя пользователя в правом углу главной страницы
                                                            </li>
                                                            <li>
                                                                <div style={{ minWidth: 8, minHeight: 8, background: "#2D85EA", borderRadius: "50%" }} />
                                                                В выпадающем меню выберите пункт “Об аккаунте”
                                                            </li>
                                                        </ul>
                                                        <img src="/steam-tool.png" alt="" />
                                                    </div>
                                                </div>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Введите логин в Steam"
                                                value={topupLogin}
                                                onChange={(e) => {
                                                    setTopupLogin(e.target.value);
                                                    setFieldErrors((f) => ({ ...f, login: false }));
                                                }}
                                                style={fieldErrors.login ? { border: "1px solid #F50100" } : {}}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <span>Email</span>
                                        <input
                                            type="email"
                                            placeholder="Введите свою почту"
                                            value={topupEmail}
                                            onChange={(e) => {
                                                setTopupEmail(e.target.value);
                                                setFieldErrors((f) => ({ ...f, email: false }));
                                            }}
                                            style={fieldErrors.email ? { border: "1px solid #F50100" } : {}}
                                        />
                                    </div>
                                </div>
                                <div className="block-grid">
                                    <div>
                                        <span>Сумма пополнения в ТМТ</span>
                                        <div style={{ position: "relative" }}>
                                            <input
                                                type="text"
                                                value={topupAmountTmt}
                                                onChange={handleTopupAmountTmtChange}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        validateAmountLimits();
                                                    }
                                                }}
                                                onBlur={validateAmountLimits}
                                                placeholder={steamMinAmount ? `от ${steamMinAmount} ТМТ` : "Сумма пополнения в ТМТ"}
                                                style={fieldErrors.amount ? { border: "1px solid #F50100" } : {}}
                                            />
                                            <div
                                                className="tmt-svg"
                                                style={{ display: limitError ? "flex" : "none" }}  // 👈 show only on error
                                            >
                                                {/* Cross: clear input + USD + error */}
                                                <svg
                                                    width="24" height="24" viewBox="0 0 24 24" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg" style={{ cursor: "pointer" }}
                                                    onClick={() => {
                                                        setTopupAmountTmt("");
                                                        setTopupAmountUsd("");
                                                        setLimitError("");
                                                    }}
                                                >
                                                    <path
                                                        d="M6 6L18 18M18 6L6 18"
                                                        stroke="black" strokeOpacity="0.6" strokeWidth="2"
                                                        strokeLinecap="round" strokeLinejoin="round"
                                                    />
                                                </svg>

                                                {/* Lock icon (left as-is) */}
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg" className="int-lock">
                                                    <path
                                                        d="M12 14V16M8 9V6C8 3.79086 9.79086 2 12 2C14.2091 2 16 3.79086 16 6V9M7 21H17C18.1046 21 19 20.1046 19 19V11C19 9.89543 18.1046 9 17 9H7C5.89543 9 5 9.89543 5 11V19C5 20.1046 5.89543 21 7 21Z"
                                                        stroke="black" strokeOpacity="0.6" strokeWidth="2"
                                                        strokeLinecap="round" strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </div>
                                        </div>

                                        {limitError && (
                                            <div className='block-flex' style={{ color: "#F50100", marginTop: 6, fontSize: 14 }}>
                                                <p>{limitError}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <span>К зачислению в Steam</span>
                                        <input
                                            type="text"
                                            value={calcLoading ? "Рассчитываем…" : (topupAmountUsd ? `~${topupAmountUsd} USD` : "")}
                                            readOnly
                                            placeholder="К зачислению в Steam"
                                            style={fieldErrors.usd ? { border: "1px solid #F50100" } : {}}
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
                                        onChange={(e) => {
                                            setUserEmail(e.target.value);
                                            setFieldErrors((f) => ({ ...f, email: false }));
                                        }}
                                        style={fieldErrors.email ? { border: "1px solid #F50100" } : {}}
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
                                onChange={(e) => {
                                    const checked = e.target.checked;

                                    if (checked) {
                                        if (activeTab === "topup") {
                                            const regionErr = !selectedTopupRegion;
                                            const loginErr = !topupLogin.trim();
                                            const amt = Number(String(topupAmountTmt).replace(",", "."));
                                            const amountErr = !Number.isFinite(amt) || amt <= 0;
                                            const usdErr = !topupAmountUsd || topupAmountUsd === "";
                                            const emailErr = !isValidEmail(topupEmail);

                                            setFieldErrors({
                                                region: regionErr,
                                                login: loginErr,
                                                amount: amountErr,
                                                usd: usdErr,
                                                email: emailErr,
                                            });

                                            if (regionErr || loginErr || amountErr || usdErr || emailErr) {
                                                setConfirmed(false);
                                                return;
                                            }
                                        } else {
                                            const vRegionErr = !selectedRegion;
                                            const vEmailErr = !isValidEmail(userEmail);

                                            setFieldErrors({
                                                region: vRegionErr,
                                                email: vEmailErr,
                                            });

                                            if (vRegionErr || vEmailErr || !selectedVoucher) {
                                                setConfirmed(false);
                                                return;
                                            }
                                        }
                                    }

                                    setConfirmed(checked);
                                }}
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
                                onClick={activeTab === "voucher" ? handlePayVoucher : handlePayTopup}
                            >
                                {paying ? <div className="spinner"></div> : "Оплатить"}
                            </button>
                            {payError ? <div style={{ marginTop: 8, color: "#F50100" }}>{payError}</div> : null}
                            <button type="button" className="pay-btn cancel" onClick={payFunc}>Отмена</button>
                        </div>
                    </div>

                    {appAlert.type && (
                        <div className="alerts">
                            {appAlert.type === "green" && (
                                <div className="alt green" role="alert">
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M16 3.93552C14.795 3.33671 13.4368 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 11.662 20.9814 11.3283 20.9451 11M21 5L12 14L9 11"
                                            stroke="#50A66A"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <span>{appAlert.message}</span>
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        className="alt-close"
                                        onClick={closeAlert}
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M5 5L15 15M15 5L5 15"
                                            stroke="black"
                                            strokeOpacity="0.6"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            )}

                            {appAlert.type === "red" && (
                                <div className="alt red" role="alert">
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M16 12H8M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                                            stroke="#ED2428"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <span>{appAlert.message}</span>
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        className="alt-close"
                                        onClick={closeAlert}
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M5 5L15 15M15 5L5 15"
                                            stroke="black"
                                            strokeOpacity="0.6"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </form>

        </div>
    );
}

export default Steam;