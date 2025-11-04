import React, { useCallback, useEffect, useMemo, useState } from "react";
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

    // ------- load tariffs (country) -------
    const loadTariffsFor = useCallback(async (c) => {
        setSelectedRegion(null);
        setRegionCoverage(null); // NEW: ensure we don’t show region coverage in country mode
        setSelectedCountry(c);
        setTErr(null);
        setTLoading(true);
        setTariffs([]);
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
    const loadTariffsForRegion = useCallback(async (r) => {
        setSelectedCountry(null);
        setSelectedRegion(r);
        setTErr(null);
        setTLoading(true);
        setTariffs([]);
        try {
            const regionParam = r?.region_name?.en;
            const { data } = await api.get("/v1/partner/esim/countries/tarrifs", {
                params: { region: regionParam },
            });
            const root = Array.isArray(data) ? (data[0] || {}) : (data || {});
            const list = root.tariffs || root.tarrifs || [];
            setTariffs(Array.isArray(list) ? list : []);

            // NEW: count how many countries this region covers
            const codes = root.country_code;
            setRegionCoverage(Array.isArray(codes) ? codes.length : null);
        } catch (e) {
            setTErr("Не удалось загрузить тарифы.");
            console.error("Region tariffs error", e?.response || e);
        } finally {
            setTLoading(false);
        }
    }, []);

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

                // auto-select first country and show tariffs
                if (arr.length > 0) {
                    loadTariffsFor(arr[0]);
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
    const formFunc = () => setPayform(!payform);

    const [tariff, setTarrif] = useState(false);
    const tariffFunc = () => setTarrif(!tariff);

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
                        <ul>
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
                                            onClick={() => loadTariffsFor(item)}
                                            onKeyDown={(e) => (e.key === "Enter" ? loadTariffsFor(item) : null)}
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
                                            onClick={() => loadTariffsForRegion(item)}
                                            onKeyDown={(e) => (e.key === "Enter" ? loadTariffsForRegion(item) : null)}
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

            <div className="esim-grid">
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
                                    <img
                                        src={selectedCountry?.flag_url || selectedRegion?.region_url}
                                        alt={
                                            selectedCountry
                                                ? (selectedCountry?.country_name?.ru || selectedCountry?.country_code)
                                                : (selectedRegion?.region_name?.ru || selectedRegion?.region_name?.en)
                                        }
                                        width={56}
                                        height={56}
                                        style={{ borderRadius: 12, objectFit: "cover" }}
                                    />
                                )}
                            </div>

                            <div className="data-flex">
                                <div className="d-flex-div" style={{ borderBottom: "1px solid #00000026" }}>
                                    <p>{selectedCountry ? "Страна" : "Покрытие"}</p>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={tariffFunc}>
                                        <p>
                                            {selectedCountry
                                                ? (selectedCountry?.country_name?.ru ||
                                                    selectedCountry?.country_name?.en ||
                                                    selectedCountry?.country_code || "—")
                                                : (`${regionCoverage} стран` ?? "—")}
                                        </p>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M11.9999 11.9999H20.9999M20.9999 11.9999L17 8M20.9999 11.9999L17 15.9999M9 12H9.01M6 12H6.01M3 12H3.01" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
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

                            <button onClick={formFunc}>Купить</button>
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
                                <p>Австралия</p>
                            </div>
                            <div style={{ borderBottom: "1.5px solid #00000026" }}>
                                <p>Трафик</p>
                                <p>3GB</p>
                            </div>
                            <div>
                                <p>Срок действия</p>
                                <p>3 дней</p>
                            </div>
                            <div style={{ marginTop: 30 }}>
                                <p>Сумма</p>
                                <p>150 ТМТ</p>
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
                            <input type="text" placeholder="Введите ФИО" />
                        </div>
                        <div className="pay-inputs" style={{ marginTop: 20 }}>
                            <p className="pay-label">Электронный адрес</p>
                            <input type="text" placeholder="Введите почту клиента" />
                        </div>
                        <div className="pay-inputs" style={{ marginTop: 20 }}>
                            <p className="pay-label">Номер телефона</p>
                            <input type="text" placeholder="Введите номер телефона клиента" />
                        </div>
                        <div className="pay-data">
                            <div style={{ borderBottom: "1.5px solid #00000026" }}>
                                <p>Покрытие</p>
                                <p>Австралия</p>
                            </div>
                            <div>
                                <p>Итого</p>
                                <p>221 ТМТ</p>
                            </div>
                        </div>
                        <label class="checkbox" style={{ marginTop: 20 }}>
                            <input type="checkbox" />
                            <span class="checkmark"></span>
                            <span class="label">Я подтверждаю, что правильно указал все данные</span>
                        </label>
                        <div>
                            <button className="pay-btn">Оплатить</button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Сервис доступен в следующих странах */}
            <div className={tariff ? "conts-list showtariff" : "conts-list"}>
                <ul>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                        <span>Сервис доступен в следующих странах</span>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={tariffFunc}>
                            <path d="M6 6L18 18M18 6L6 18" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>
                </ul>
            </div>
        </div>
    );
}

export default Esim;