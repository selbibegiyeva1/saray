import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../lib/api";
import "../styles/eSim.css";

function Esim() {

    // tabs
    const [mode, setMode] = useState("countries"); // "countries" | "regions"

    // data
    const [countries, setCountries] = useState([]);
    const [regions, setRegions] = useState([]);
    const [regionCoverage, setRegionCoverage] = useState(null); // count of countries for selected region

    // search
    const [q, setQ] = useState("");

    // loading/errors for lists
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    // selection + tariffs
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [tariffs, setTariffs] = useState([]);
    const [tLoading, setTLoading] = useState(false);
    const [tErr, setTErr] = useState(null);

    const [regionCodes, setRegionCodes] = useState([]);
    const [coverageCountries, setCoverageCountries] = useState([]);
    const [covLoading, setCovLoading] = useState(false);
    const [covErr, setCovErr] = useState(null);
    const [coverageSearch, setCoverageSearch] = useState("");

    const [selectedTariff, setSelectedTariff] = useState(null);

    const [formConfirmed, setFormConfirmed] = useState(false);

    const [fieldErrors, setFieldErrors] = useState({
        name: false,
        email: false,
        phone: false,
    });

    // utils
    const norm = (s = "") => s.toString().toLowerCase().replace(/\s|-/g, "");
    const formatTraffic = (traffic) => {
        if (traffic == null) return "—";
        const mb = Number(traffic);
        if (!Number.isFinite(mb)) return "—";
        if (mb >= 1024) {
            const gb = mb / 1024;
            return gb % 1 === 0 ? `${gb}GB` : `${gb.toFixed(1)}GB`;
        }
        return `${mb}MB`;
    };

    const gridRef = useRef(null);

    const scrollToGrid = useCallback(() => {
        const el = gridRef.current;
        if (!el) return;
        const y = el.getBoundingClientRect().top + window.pageYOffset - 80; // adjust 80px if header height differs
        window.scrollTo({ top: y, behavior: "smooth" });
    }, []);

    // ------- load tariffs (country) -------
    const loadTariffsFor = useCallback(async (c, shouldScroll = false) => {
        setSelectedRegion(null);
        setRegionCoverage(null);
        setSelectedCountry(c);
        setTErr(null);
        setTLoading(true);
        setTariffs([]);

        if (shouldScroll) {
            scrollToGrid();
        }

        try {
            const { data } = await api.get("/v1/partner/esim/countries/tarrifs", {
                params: { country_code: c.country_code },
            });
            const root = Array.isArray(data) ? (data[0] || {}) : (data || {});
            const list = root.tariffs || root.tarrifs || [];
            setTariffs(Array.isArray(list) ? list : []);
        } catch (e) {
            setTErr("Не удалось загрузить тарифы.");
            console.error("Tariffs error", e?.response || e);
        } finally {
            setTLoading(false);
        }
    }, []);

    // ------- load tariffs (region) -------
    const loadTariffsForRegion = useCallback(async (r, shouldScroll = false) => {
        setSelectedCountry(null);
        setSelectedRegion(r);
        setTErr(null);
        setTLoading(true);
        setTariffs([]);

        if (shouldScroll) {
            scrollToGrid();
        }

        try {
            const regionParam = r?.region_name?.en;
            const { data } = await api.get("/v1/partner/esim/countries/tarrifs", {
                params: { region: regionParam },
            });
            const root = Array.isArray(data) ? (data[0] || {}) : (data || {});
            const list = root.tariffs || root.tarrifs || [];
            setTariffs(Array.isArray(list) ? list : []);

            const codes = root.country_code;
            setRegionCoverage(Array.isArray(codes) ? codes.length : null);
            setRegionCodes(Array.isArray(codes) ? codes : []);
        } catch (e) {
            setTErr("Не удалось загрузить тарифы.");
            console.error("Region tariffs error", e?.response || e);
        } finally {
            setTLoading(false);
        }
    }, []);

    const filterCoverageCountries = useCallback(() => {
        if (!regionCodes.length || !countries.length) return [];
        const codesSet = new Set(regionCodes.map((c) => c.toUpperCase()));
        return countries.filter((c) => codesSet.has(c.country_code?.toUpperCase()));
    }, [regionCodes, countries]);

    // ------- fetch countries on mount (+ auto-select first) -------
    useEffect(() => {
        let isMounted = true;
        (async () => {
            setLoading(true);
            setErr(null);
            try {
                const { data } = await api.get("/v1/partner/esim/countries");
                if (!isMounted) return;
                const arr = Array.isArray(data) ? data : [];
                setCountries(arr);

                // auto-select first country, but do NOT scroll
                if (arr.length > 0) {
                    loadTariffsFor(arr[0], false);
                }
            } catch {
                if (!isMounted) return;
                setErr("Не удалось загрузить страны.");
            } finally {
                if (isMounted) setLoading(false);
            }
        })();
        return () => { isMounted = false; };
    }, [loadTariffsFor]);

    // ------- lazy fetch regions when tab is opened -------
    useEffect(() => {
        let isMounted = true;

        async function fetchRegions() {
            setLoading(true);
            setErr(null);
            try {
                const { data } = await api.get("/v1/partner/esim/regions");
                if (!isMounted) return;
                setRegions(Array.isArray(data) ? data : []);
            } catch {
                if (!isMounted) return;
                setErr("Не удалось загрузить регионы.");
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        if (mode === "regions" && regions.length === 0) {
            fetchRegions();
        }
        if (mode === "countries") {
            setSelectedRegion(null);
            // keep current country tariffs (feels nicer)
        }

        return () => { isMounted = false; };
    }, [mode, regions.length]);

    // ------- active list (for search) -------
    const list = mode === "countries" ? countries : regions;

    // ------- search filter -------
    const filtered = useMemo(() => {
        const term = norm(q);
        if (!term) return list;

        if (mode === "countries") {
            return list.filter((c) => {
                const ru = norm(c?.country_name?.ru);
                const en = norm(c?.country_name?.en);
                const tm = norm(c?.country_name?.tm);
                const code = norm(c?.country_code);
                return ru.includes(term) || en.includes(term) || tm.includes(term) || code.includes(term);
            });
        }
        return list.filter((r) => {
            const ru = norm(r?.region_name?.ru);
            const en = norm(r?.region_name?.en);
            const tm = norm(r?.region_name?.tm);
            return ru.includes(term) || en.includes(term) || tm.includes(term);
        });
    }, [list, q, mode]);

    const [payform, setPayform] = useState(false);
    const formFunc = () => {
        setFormConfirmed(false);       // reset checkbox each time
        setPayform(prev => !prev);     // <-- use the correct state
    };

    const [tariff, setTarrif] = useState(false);

    const tariffFunc = () => {
        const newState = !tariff;
        setTarrif(newState);

        if (newState && selectedRegion && regionCodes.length) {
            setCovLoading(true);
            setCovErr(null);
            try {
                const filtered = filterCoverageCountries();
                setCoverageCountries(filtered);
            } catch (e) {
                console.error(e);
                setCovErr("Не удалось загрузить список стран региона.");
            } finally {
                setCovLoading(false);
            }
        }
    };

    const filteredCoverage = useMemo(() => {
        const term = norm(coverageSearch);
        if (!term) return coverageCountries;
        return coverageCountries.filter((c) => {
            const ru = norm(c?.country_name?.ru);
            const en = norm(c?.country_name?.en);
            const code = norm(c?.country_code);
            return ru.includes(term) || en.includes(term) || code.includes(term);
        });
    }, [coverageSearch, coverageCountries]);

    const coverageLabel = selectedCountry
        ? (selectedCountry?.country_name?.ru || selectedCountry?.country_name?.en || selectedCountry?.country_code || "—")
        : (selectedRegion?.region_name?.ru || selectedRegion?.region_name?.en || "—");

    const trafficLabel = selectedTariff
        ? (selectedTariff.is_unlimited ? "Безлимит" : formatTraffic(selectedTariff.traffic))
        : "—";

    const daysLabel = selectedTariff?.days != null ? `${selectedTariff.days} дней` : "—";
    const priceLabel = selectedTariff?.price_tmt != null ? `${selectedTariff.price_tmt} ТМТ` : "—";

    // client data
    const [clientName, setClientName] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [clientPhone, setClientPhone] = useState("");

    // pay flow
    const [paying, setPaying] = useState(false);

    // alerts
    const [appAlert, setAppAlert] = useState({ type: null, message: "" });
    const closeAlert = () => setAppAlert({ type: null, message: "" });

    // auto-close modal and auto-dismiss alert after 5s
    useEffect(() => {
        if (appAlert.type) {
            setPayform(false);
            const t = setTimeout(() => setAppAlert({ type: null, message: "" }), 5000);
            return () => clearTimeout(t);
        }
    }, [appAlert]);

    async function handleBuyEsim() {
        if (!formConfirmed) return;

        if (!selectedTariff) {
            setAppAlert({ type: "red", message: "Выберите тариф" });
            return;
        }
        if (!clientEmail.trim() || !clientPhone.trim()) {
            setAppAlert({ type: "red", message: "Укажите электронный адрес и номер телефона" });
            return;
        }

        const payload = {
            client_email: clientEmail.trim(),
            client_phone: clientPhone.trim(),
            tariff_name: selectedTariff.name, // from tariffs list (1.2)
        };

        setPaying(true);
        try {
            const { data } = await api.post("/v1/products/esim/buy", payload);

            if (data?.status) {
                // balance down by tariff price (if provided)
                const dec = Number(selectedTariff?.price_tmt) || 0;
                if (dec > 0) {
                    window.dispatchEvent(new CustomEvent("balance:decrement", { detail: { amount: dec } }));
                }

                // open backend link in a new tab (as per your examples)
                if (data.voucher) {
                    window.open(data.voucher, "_blank", "noopener,noreferrer");
                }

                // reset
                setClientName("");
                setClientEmail("");
                setClientPhone("");
                setFormConfirmed(false);
                setSelectedTariff(null);
                setPayform(false);

                const ok = data?.comment || data?.message || "Заказ eSIM создан. Продолжите в новой вкладке.";
                setAppAlert({ type: "green", message: ok });
                window.scrollTo({ top: 0, behavior: "smooth" });
                return;
            }

            const err = data?.comment || data?.message || "Не удалось оформить eSIM";
            setAppAlert({ type: "red", message: err });
        } catch (e) {
            const err = e?.response?.data?.comment || e?.response?.data?.message || "Ошибка оформления eSIM";
            setAppAlert({ type: "red", message: err });
        } finally {
            setPaying(false);
        }
    }

    useEffect(() => {
        if (!tLoading && (selectedCountry || selectedRegion)) {
            scrollToGrid();
        }
    }, [tLoading, selectedCountry, selectedRegion, scrollToGrid]);

    return (
        <div className="Esim">
            <h1 className="e-head">e-SIM</h1>

            <div className="esim-search">
                <b>{mode === "countries" ? "Страны" : "Регионы"}</b>

                <div className="esim-btns">
                    <button
                        type="button"
                        className={mode === "countries" ? "active" : ""}
                        onClick={() => setMode("countries")}
                    >
                        Страны
                    </button>
                    <button
                        type="button"
                        className={mode === "regions" ? "active" : ""}
                        onClick={() => setMode("regions")}
                    >
                        Регионы
                    </button>
                </div>

                <div className="esim-inpt">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M17.2491 10.4991C17.2491 11.3855 17.0745 12.2633 16.7352 13.0822C16.3961 13.9012 15.8988 14.6453 15.2721 15.2721C14.6453 15.8988 13.9012 16.3961 13.0822 16.7354C12.2633 17.0745 11.3855 17.2491 10.4991 17.2491C9.6127 17.2491 8.73496 17.0745 7.916 16.7354C7.09706 16.3961 6.35294 15.8988 5.72615 15.2721C5.09935 14.6453 4.60216 13.9012 4.26293 13.0822C3.92371 12.2633 3.74912 11.3855 3.74912 10.4991C3.74912 8.7089 4.46027 6.99202 5.72615 5.72615C6.99202 4.46027 8.7089 3.74912 10.4991 3.74912C12.2893 3.74912 14.0062 4.46027 15.2721 5.72615C16.538 6.99202 17.2491 8.7089 17.2491 10.4991ZM16.0191 17.6091C14.2107 19.0131 11.9352 19.6751 9.65582 19.4603C7.37647 19.2456 5.26463 18.1703 3.75025 16.4532C2.23585 14.7362 1.43275 12.5066 1.50442 10.2182C1.5761 7.92992 2.51717 5.75492 4.13605 4.13605C5.75494 2.51717 7.92992 1.5761 10.2182 1.50442C12.5066 1.43274 14.7362 2.23585 16.4532 3.75025C18.1703 5.26463 19.2456 7.37647 19.4603 9.65582C19.6751 11.9352 19.0131 14.2107 17.6091 16.0191L22.1691 20.5791C22.2797 20.6822 22.3683 20.8064 22.4298 20.9444C22.4913 21.0824 22.5243 21.2313 22.527 21.3824C22.5297 21.5334 22.5018 21.6834 22.4453 21.8235C22.3887 21.9636 22.3044 22.0908 22.1976 22.1976C22.0908 22.3046 21.9636 22.3887 21.8235 22.4453C21.6834 22.5018 21.5334 22.5297 21.3824 22.527C21.2313 22.5243 21.0822 22.4913 20.9444 22.4298C20.8064 22.3683 20.6822 22.2797 20.5791 22.1691L16.0191 17.6091Z"
                            fill="black"
                            fillOpacity="0.6"
                        />
                    </svg>

                    <input
                        type="text"
                        placeholder={mode === "countries" ? "Название страны" : "Название региона"}
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />

                    {q && (
                        <button
                            type="button"
                            aria-label="Сбросить поиск"
                            onClick={() => setQ("")}
                            style={{ marginLeft: 8 }}
                        >
                            ✕
                        </button>
                    )}
                </div>

                {loading && <div style={{ padding: 12, opacity: 0.7 }}>Загрузка…</div>}
                {err && !loading && <div style={{ padding: 12, color: "#ED2428" }}>{err}</div>}

                {!loading && !err && (
                    filtered.length ? (
                        <ul style={{ paddingRight: 15 }}>
                            {filtered.map((item, i) => {
                                if (mode === "countries") {
                                    const name = item?.country_name?.ru || item?.country_name?.en || item?.country_code;
                                    const key = item.country_code || name || i;
                                    const isSel = selectedCountry?.country_code === item.country_code;
                                    return (
                                        <li
                                            key={key}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => loadTariffsFor(item, true)}
                                            onKeyDown={(e) => (e.key === "Enter" ? loadTariffsFor(item, true) : null)}
                                            className={isSel ? "selected" : ""}
                                            style={{ cursor: "pointer" }}
                                            title="Показать тарифы"
                                        >
                                            {item.flag_url ? (
                                                <img
                                                    src={item.flag_url}
                                                    alt={name}
                                                    width={38}
                                                    height={28}
                                                    style={{ borderRadius: 6, objectFit: "cover" }}
                                                />
                                            ) : (
                                                <div style={{ width: 38, height: 28, borderRadius: 6, background: "#eee" }} />
                                            )}
                                            <span>{name}</span>
                                            <span style={{ marginLeft: "auto", fontSize: 14 }}>
                                                {item.tariff_count} тарифов
                                            </span>
                                        </li>
                                    );
                                } else {
                                    const name = item?.region_name?.ru || item?.region_name?.en;
                                    const isSel = selectedRegion?.region_name?.en === item?.region_name?.en;
                                    return (
                                        <li
                                            key={name || i}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => loadTariffsForRegion(item, true)}
                                            onKeyDown={(e) => (e.key === "Enter" ? loadTariffsForRegion(item, true) : null)}
                                            className={isSel ? "selected" : ""}
                                            style={{ cursor: "pointer" }}
                                            title="Показать тарифы"
                                        >
                                            {item.region_url ? (
                                                <img
                                                    src={item.region_url}
                                                    alt={name}
                                                    width={38}
                                                    height={28}
                                                    style={{ borderRadius: 6, objectFit: "cover" }}
                                                />
                                            ) : (
                                                <div style={{ width: 38, height: 28, borderRadius: 6, background: "#eee" }} />
                                            )}
                                            <span>{name}</span>
                                            <span style={{ marginLeft: "auto", fontSize: 14 }}>
                                                {item.tariff_count} тарифов
                                            </span>
                                        </li>
                                    );
                                }
                            })}
                        </ul>
                    ) : (
                        <div style={{ padding: 12, opacity: 0.7 }}>Ничего не найдено</div>
                    )
                )}
            </div>

            <div className="esim-grid" ref={gridRef}>
                <h1 className="e-head e2">Тарифы</h1>

                <div className="blocks">
                    {tLoading && <div style={{ padding: 12, opacity: 0.7 }}>Загружаем тарифы…</div>}
                    {tErr && !tLoading && <div style={{ padding: 12, color: "#ED2428" }}>{tErr}</div>}

                    {!tLoading && !tErr && tariffs.length === 0 && (
                        <div style={{ padding: 12, opacity: 0.7 }}>Тарифы не найдены.</div>
                    )}

                    {!tLoading && !tErr && tariffs.map((t, i) => (
                        <div className="esim" key={`${t.name || "tariff"}-${i}`}>
                            <div className="esim-flex">
                                <b>{t.is_unlimited ? "Безлимит" : formatTraffic(t.traffic)}</b>
                                {(selectedCountry?.flag_url || selectedRegion?.region_url) && (
                                    <div className="trf-img">
                                        <img
                                            src={selectedCountry?.flag_url || selectedRegion?.region_url}
                                            alt={
                                                selectedCountry
                                                    ? (selectedCountry?.country_name?.ru || selectedCountry?.country_code)
                                                    : (selectedRegion?.region_name?.ru || selectedRegion?.region_name?.en)
                                            }
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="data-flex">
                                <div className="d-flex-div" style={{ borderBottom: "1px solid #00000026" }}>
                                    <p>{selectedCountry ? "Страна" : "Покрытие"}</p>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            cursor: mode === "regions" ? "pointer" : "default",
                                            opacity: mode === "regions" ? 1 : 0.6, // optional: gray out when disabled
                                        }}
                                        onClick={mode === "regions" ? tariffFunc : undefined}
                                    >
                                        <p>
                                            {selectedCountry
                                                ? (selectedCountry?.country_name?.ru ||
                                                    selectedCountry?.country_name?.en ||
                                                    selectedCountry?.country_code || "—")
                                                : (`${regionCoverage} стран` ?? "—")}
                                        </p>
                                        {selectedRegion && (
                                            <svg
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                style={{ opacity: mode === "regions" ? 1 : 0.4 }} // visually muted if disabled
                                            >
                                                <path
                                                    d="M11.9999 11.9999H20.9999M20.9999 11.9999L17 8M20.9999 11.9999L17 15.9999M9 12H9.01M6 12H6.01M3 12H3.01"
                                                    stroke="black"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <div className="d-flex-div">
                                    <p>Срок действия</p>
                                    <p>{t.days ?? "—"} дней</p>
                                </div>
                            </div>

                            <div className="esim-price">
                                <b>Сумма</b>
                                <b>{t.price_tmt != null ? `${t.price_tmt} ТМТ` : "—"}</b>
                            </div>

                            <button
                                type="button"
                                onClick={() => { setSelectedTariff(t); formFunc(); }}
                            >
                                Купить
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment form */}
            <div className={payform ? "payment-form showform" : "payment-form"}>
                <form>
                    <div>
                        <p className="pay-h">Покупка тарифа</p>
                        <div className="pay-data">
                            <div style={{ borderBottom: "1.5px solid #00000026" }}>
                                <p>Покрытие</p>
                                <p>{coverageLabel}</p>
                            </div>
                            <div style={{ borderBottom: "1.5px solid #00000026" }}>
                                <p>Трафик</p>
                                <p>{trafficLabel}</p>
                            </div>
                            <div>
                                <p>Срок действия</p>
                                <p>{daysLabel}</p>
                            </div>
                            <div style={{ marginTop: 30 }}>
                                <p>Сумма</p>
                                <p>{priceLabel}</p>
                            </div>
                        </div>
                        <span className="pay-desc">После оплаты вы получите письмо со ссылкой QR/ для установки eSIM</span>
                    </div>
                    <div className="pay-data2">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <p className="pay-h">Данные клиента</p>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={formFunc} className="close-payment">
                                <path d="M6 6L18 18M18 6L6 18" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </div>
                        <div className="pay-inputs">
                            <p className="pay-label">ФИО</p>
                            <input
                                type="text"
                                placeholder="Введите ФИО"
                                value={clientName}
                                onChange={(e) => {
                                    setClientName(e.target.value);
                                    setFieldErrors((f) => ({ ...f, name: false }));
                                }}
                                style={fieldErrors.name ? { border: "1px solid #F50100" } : {}}
                            />
                        </div>

                        <div className="pay-inputs" style={{ marginTop: 20 }}>
                            <p className="pay-label">Электронный адрес</p>
                            <input
                                type="email"
                                placeholder="Введите почту клиента"
                                value={clientEmail}
                                onChange={(e) => {
                                    setClientEmail(e.target.value);
                                    setFieldErrors((f) => ({ ...f, email: false }));
                                }}
                                style={fieldErrors.email ? { border: "1px solid #F50100" } : {}}
                            />
                        </div>

                        <div className="pay-inputs" style={{ marginTop: 20 }}>
                            <p className="pay-label">Номер телефона</p>
                            <input
                                type="tel"
                                placeholder="Введите номер телефона клиента"
                                value={clientPhone}
                                onChange={(e) => {
                                    setClientPhone(e.target.value);
                                    setFieldErrors((f) => ({ ...f, phone: false }));
                                }}
                                style={fieldErrors.phone ? { border: "1px solid #F50100" } : {}}
                            />
                        </div>
                        <div className="pay-data">
                            <div style={{ borderBottom: "1.5px solid #00000026" }}>
                                <p>Покрытие</p>
                                <p>{coverageLabel}</p>
                            </div>
                            <div>
                                <p>Итого</p>
                                <p>{priceLabel}</p>
                            </div>
                        </div>
                        <label className="checkbox" style={{ marginTop: 20 }}>
                            <input
                                type="checkbox"
                                checked={formConfirmed}
                                onChange={(e) => {
                                    const checked = e.target.checked;

                                    if (checked) {
                                        const nameErr = !clientName.trim();   // include name; remove if truly optional
                                        const emailErr = !clientEmail.trim();
                                        const phoneErr = !clientPhone.trim();

                                        setFieldErrors({
                                            name: nameErr,
                                            email: emailErr,
                                            phone: phoneErr,
                                        });

                                        if (nameErr || emailErr || phoneErr) {
                                            setFormConfirmed(false);
                                            return;
                                        }
                                    }

                                    setFormConfirmed(checked);
                                }}
                            />
                            <span className="checkmark"></span>
                            <span className="label">Я подтверждаю, что правильно указал все данные</span>
                        </label>
                        <div>
                            <button
                                type="button"
                                className="pay-btn"
                                disabled={!formConfirmed || !selectedTariff || paying}
                                onClick={handleBuyEsim}
                            >
                                {paying ? <div className="spinner"></div> : "Оплатить"}
                            </button>
                        </div>
                    </div>
                </form>
                {appAlert.type && (
                    <div className="alerts">
                        {appAlert.type === "green" && (
                            <div className="alt green" role="alert">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16 3.93552C14.795 3.33671 13.4368 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 11.662 20.9814 11.3283 20.9451 11M21 5L12 14L9 11" stroke="#50A66A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>{appAlert.message}</span>
                                <svg width="20" height="20" viewBox="0 0 20 20" className="alt-close" onClick={closeAlert} xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 5L15 15M15 5L5 15" stroke="black" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        )}
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

            {/* Сервис доступен в следующих странах */}
            <div className={tariff ? "conts-list showtariff" : "conts-list"}>
                <ul>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            cursor: "pointer",
                        }}
                    >
                        <span>Сервис доступен в следующих странах</span>
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            onClick={tariffFunc}
                        >
                            <path
                                d="M6 6L18 18M18 6L6 18"
                                stroke="black"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>

                    <div className="esim-inpt" style={{ marginTop: 26 }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M17.2491 10.4991C17.2491 11.3855 17.0745 12.2633 16.7352 13.0822C16.3961 13.9012 15.8988 14.6453 15.2721 15.2721C14.6453 15.8988 13.9012 16.3961 13.0822 16.7354C12.2633 17.0745 11.3855 17.2491 10.4991 17.2491C9.6127 17.2491 8.73496 17.0745 7.916 16.7354C7.09706 16.3961 6.35294 15.8988 5.72615 15.2721C5.09935 14.6453 4.60216 13.9012 4.26293 13.0822C3.92371 12.2633 3.74912 11.3855 3.74912 10.4991C3.74912 8.7089 4.46027 6.99202 5.72615 5.72615C6.99202 4.46027 8.7089 3.74912 10.4991 3.74912C12.2893 3.74912 14.0062 4.46027 15.2721 5.72615C16.538 6.99202 17.2491 8.7089 17.2491 10.4991ZM16.0191 17.6091C14.2107 19.0131 11.9352 19.6751 9.65582 19.4603C7.37647 19.2456 5.26463 18.1703 3.75025 16.4532C2.23585 14.7362 1.43275 12.5066 1.50442 10.2182C1.5761 7.92992 2.51717 5.75492 4.13605 4.13605C5.75494 2.51717 7.92992 1.5761 10.2182 1.50442C12.5066 1.43274 14.7362 2.23585 16.4532 3.75025C18.1703 5.26463 19.2456 7.37647 19.4603 9.65582C19.6751 11.9352 19.0131 14.2107 17.6091 16.0191L22.1691 20.5791C22.2797 20.6822 22.3683 20.8064 22.4298 20.9444C22.4913 21.0824 22.5243 21.2313 22.527 21.3824C22.5297 21.5334 22.5018 21.6834 22.4453 21.8235C22.3887 21.9636 22.3044 22.0908 22.1976 22.1976C22.0908 22.3046 21.9636 22.3887 21.8235 22.4453C21.6834 22.5018 21.5334 22.5297 21.3824 22.527C21.2313 22.5243 21.0822 22.4913 20.9444 22.4298C20.8064 22.3683 20.6822 22.2797 20.5791 22.1691L16.0191 17.6091Z"
                                fill="black"
                                fillOpacity="0.6"
                            />
                        </svg>
                        <input
                            type="text"
                            placeholder="Название страны"
                            value={coverageSearch}
                            onChange={(e) => setCoverageSearch(e.target.value)}
                        />

                        {coverageSearch && (
                            <button
                                type="button"
                                aria-label="Сбросить поиск"
                                onClick={() => setCoverageSearch("")}
                                style={{ marginLeft: 8 }}
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <div className="list-auto" style={{ paddingRight: 15 }}>
                        {covLoading && (
                            <li style={{ padding: 12, opacity: 0.7 }}>Загрузка стран...</li>
                        )}
                        {covErr && !covLoading && (
                            <li style={{ padding: 12, color: "#ED2428" }}>{covErr}</li>
                        )}

                        {!covLoading && !covErr && selectedRegion && filteredCoverage.map((c) => (
                            <li
                                key={c.country_code}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    padding: "10px 0",
                                }}
                            >
                                {c.flag_url ? (
                                    <img
                                        src={c.flag_url}
                                        alt={c.country_name?.ru || c.country_name?.en || c.country_code}
                                        width={28}
                                        height={20}
                                        style={{ borderRadius: 6, objectFit: "cover" }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: 28,
                                            height: 20,
                                            borderRadius: 6,
                                            background: "#eee",
                                        }}
                                    />
                                )}

                                <p style={{ fontWeight: 500 }}>
                                    {c.country_name?.ru || c.country_name?.en || c.country_code}
                                </p>

                                <p style={{ marginLeft: "auto", fontSize: 14 }}>
                                    {(c.tariff_count ?? "—")} тарифов
                                </p>
                            </li>
                        ))}

                        {!covLoading && !covErr && selectedRegion && filteredCoverage.length === 0 && (
                            <li style={{ padding: 12, opacity: 0.7 }}>
                                {coverageSearch ? "Ничего не найдено" : "Нет стран с совпадающим кодом."}
                            </li>
                        )}
                    </div>
                </ul>
            </div>
        </div>
    );
}

export default Esim;