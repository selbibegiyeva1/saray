import React, { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import "../styles/eSim.css";

function Esim() {
    const [mode, setMode] = useState("countries"); // "countries" | "regions"
    const [countries, setCountries] = useState([]);
    const [regions, setRegions] = useState([]);
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    // selection + tariffs
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [tariffs, setTariffs] = useState([]);
    const [tLoading, setTLoading] = useState(false);
    const [tErr, setTErr] = useState(null);

    // tiny normalizer for search
    const norm = (s = "") => s.toString().toLowerCase().replace(/\s|-/g, "");

    // pretty traffic label
    const formatTraffic = (traffic) => {
        if (traffic == null) return "—";
        // API gives traffic in MB (1024 => 1GB in your screenshot)
        const mb = Number(traffic);
        if (!Number.isFinite(mb)) return "—";
        if (mb >= 1024) {
            const gb = mb / 1024;
            // avoid ugly 1.00GB
            return gb % 1 === 0 ? `${gb}GB` : `${gb.toFixed(1)}GB`;
        }
        return `${mb}MB`;
    };

    // fetch countries on mount
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

                // auto-select first country and load tariffs
                if (arr.length > 0 && !selectedCountry) {
                    await loadTariffsFor(arr[0]);
                }
            } catch {
                if (!isMounted) return;
                setErr("Не удалось загрузить страны.");
            } finally {
                if (isMounted) setLoading(false);
            }
        })();
        return () => { isMounted = false; };
    }, []);

    // lazy fetch regions
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
        } else {
            // switching back to countries
            setErr(null);
            setLoading(false);
        }

        return () => { isMounted = false; };
    }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

    // click a country → load tariffs
    const loadTariffsFor = async (c) => {
        setSelectedCountry(c);
        setTErr(null);
        setTLoading(true);
        setTariffs([]);

        try {
            const { data } = await api.get("/v1/partner/esim/countries/tarrifs", {
                params: { country_code: c.country_code },
            });

            // Handle both shapes:
            // 1) { country_name, country_code, flag_url, tariffs: [...] }
            // 2) [ { country_name, country_code, flag_url, tariffs: [...] } ]
            const root = Array.isArray(data) ? (data[0] || {}) : (data || {});
            const list = root.tariffs || root.tarrifs || [];

            setTariffs(Array.isArray(list) ? list : []);
        } catch (e) {
            setTErr("Не удалось загрузить тарифы.");
            console.error("Tariffs error", e?.response || e);
        } finally {
            setTLoading(false);
        }
    };

    // decide current list (countries or regions)
    const list = mode === "countries" ? countries : regions;

    // search filter
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
                                    const name =
                                        item?.country_name?.ru || item?.country_name?.en || item?.country_code;
                                    const key = item.country_code || name || i;
                                    return (
                                        <li
                                            key={key}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => loadTariffsFor(item)}
                                            onKeyDown={(e) => (e.key === "Enter" ? loadTariffsFor(item) : null)}
                                            className={selectedCountry?.country_code === item.country_code ? "selected" : ""}
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
                                    return (
                                        <li key={name || i}>
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
                        <div style={{ padding: 12, opacity: 0.7 }}>
                            {selectedCountry
                                ? "Тарифы не найдены."
                                : ""}
                        </div>
                    )}

                    {!tLoading && !tErr && tariffs.map((t, i) => (
                        <div className="esim" key={`${t.name || "tariff"}-${i}`}>
                            <div className="esim-flex">
                                <b>{t.is_unlimited ? "Безлимит" : formatTraffic(t.traffic)}</b>
                                {selectedCountry?.flag_url && (
                                    <img
                                        src={selectedCountry.flag_url}
                                        alt={selectedCountry?.country_name?.ru || selectedCountry?.country_code}
                                        width={56}
                                        height={56}
                                        style={{ borderRadius: 12, objectFit: "cover" }}
                                    />
                                )}
                            </div>

                            <div className="data-flex">
                                <div style={{ borderBottom: "1px solid #00000026" }}>
                                    <p>Страна</p>
                                    <p>
                                        {selectedCountry?.country_name?.ru ||
                                            selectedCountry?.country_name?.en ||
                                            selectedCountry?.country_code ||
                                            "—"}
                                    </p>
                                </div>
                                <div>
                                    <p>Срок действия</p>
                                    <p>{t.days ?? "—"} дней</p>
                                </div>
                            </div>

                            <div className="esim-price">
                                <b>Сумма</b>
                                <b>{t.price_tmt != null ? `${t.price_tmt} ТМТ` : "—"}</b>
                            </div>

                            <button>Купить</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Esim;