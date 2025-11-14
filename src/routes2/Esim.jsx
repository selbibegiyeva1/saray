import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../lib/api";
import "../styles/eSim.css";

import { useTranslation } from "react-i18next";

function Esim() {
    const { t } = useTranslation();

    // tabs
    const [mode, setMode] = useState("countries"); // "countries" | "regions"

    const [openFaq, setOpenFaq] = useState(null);

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
        email: false,
        phone: false,
    });

    const isValidEmail = (value) => {
        const v = String(value || "").trim();
        if (!v) return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    };

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
    const loadTariffsFor = useCallback(
        async (c, shouldScroll = false) => {
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
                const root = Array.isArray(data) ? data[0] || {} : data || {};
                const list = root.tariffs || root.tarrifs || [];
                setTariffs(Array.isArray(list) ? list : []);
            } catch (e) {
                setTErr(t("esim.tariffs.loadError"));
                console.error("Tariffs error", e?.response || e);
            } finally {
                setTLoading(false);
            }
        },
        [scrollToGrid, t]
    );

    // ------- load tariffs (region) -------
    const loadTariffsForRegion = useCallback(
        async (r, shouldScroll = false) => {
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
                const root = Array.isArray(data) ? data[0] || {} : data || {};
                const list = root.tariffs || root.tarrifs || [];
                setTariffs(Array.isArray(list) ? list : []);

                const codes = root.country_code;
                setRegionCoverage(Array.isArray(codes) ? codes.length : null);
                setRegionCodes(Array.isArray(codes) ? codes : []);
            } catch (e) {
                setTErr(t("esim.tariffs.loadError"));
                console.error("Region tariffs error", e?.response || e);
            } finally {
                setTLoading(false);
            }
        },
        [scrollToGrid, t]
    );

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
            } catch {
                if (!isMounted) return;
                setErr(t("esim.list.countriesLoadError"));
            } finally {
                if (isMounted) setLoading(false);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, [loadTariffsFor, t]);

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
                setErr(t("esim.list.regionsLoadError"));
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

        return () => {
            isMounted = false;
        };
    }, [mode, regions.length, t]);

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
        setFormConfirmed(false); // reset checkbox each time
        setPayform((prev) => !prev);
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
                setCovErr(t("esim.coverage.loadError"));
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
        ? selectedCountry?.country_name?.ru ||
        selectedCountry?.country_name?.en ||
        selectedCountry?.country_name?.tm ||
        selectedCountry?.country_code ||
        "—"
        : selectedRegion?.region_name?.ru ||
        selectedRegion?.region_name?.en ||
        selectedRegion?.region_name?.tm ||
        "—";

    const trafficLabel = selectedTariff
        ? selectedTariff.is_unlimited
            ? t("esim.tariffs.unlimited")
            : formatTraffic(selectedTariff.traffic)
        : "—";

    const daysLabel =
        selectedTariff?.days != null
            ? t("esim.tariffs.daysSuffix", { count: selectedTariff.days })
            : "—";
    const priceLabel =
        selectedTariff?.price_tmt != null ? `${selectedTariff.price_tmt} TMT` : "—";

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
            if (appAlert.type === "green") {
                setPayform(false); // close only on success
            }
            const tmr = setTimeout(() => setAppAlert({ type: null, message: "" }), 5000);
            return () => clearTimeout(tmr);
        }
    }, [appAlert]);

    async function handleBuyEsim() {
        if (!formConfirmed) return;

        if (!selectedTariff) {
            setAppAlert({ type: "red", message: t("esim.purchase.selectTariffError") });
            return;
        }
        if (!isValidEmail(clientEmail) || !clientPhone.trim()) {
            // safety check
            setAppAlert({
                type: "red",
                message: t("esim.purchase.invalidClientData"),
            });
            return;
        }

        const payload = {
            client_email: clientEmail.trim(),
            client_phone: clientPhone.trim(),
            tariff_name: selectedTariff.name,
        };

        setPaying(true);
        try {
            const { data } = await api.post("/v1/products/esim/buy", payload);

            if (data?.status) {
                // balance down by tariff price (if provided)
                const dec = Number(selectedTariff?.price_tmt) || 0;
                if (dec > 0) {
                    window.dispatchEvent(
                        new CustomEvent("balance:decrement", { detail: { amount: dec } })
                    );
                }

                // open backend link in a new tab
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

                const ok =
                    data?.comment ||
                    data?.message ||
                    t("esim.purchase.orderSuccess");
                setAppAlert({ type: "green", message: ok });
                window.scrollTo({ top: 0, behavior: "smooth" });
                return;
            }

            const errMsg =
                data?.comment ||
                data?.message ||
                t("esim.purchase.orderFailed");
            setAppAlert({ type: "red", message: errMsg });
        } catch (e) {
            const errMsg =
                e?.response?.data?.comment ||
                e?.response?.data?.message ||
                t("esim.purchase.orderError");
            setAppAlert({ type: "red", message: errMsg });
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
            <h1 className="e-head">{t("esim.title")}</h1>

            <div className="esim-search">
                <b>
                    {mode === "countries"
                        ? t("esim.tabs.countries")
                        : t("esim.tabs.regions")}
                </b>

                <div className="esim-btns">
                    <button
                        type="button"
                        className={mode === "countries" ? "active" : ""}
                        onClick={() => setMode("countries")}
                    >
                        {t("esim.tabs.countries")}
                    </button>
                    <button
                        type="button"
                        className={mode === "regions" ? "active" : ""}
                        onClick={() => setMode("regions")}
                    >
                        {t("esim.tabs.regions")}
                    </button>
                </div>

                <div className="esim-inpt">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
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
                        placeholder={
                            mode === "countries"
                                ? t("esim.search.placeholderCountry")
                                : t("esim.search.placeholderRegion")
                        }
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />

                    {q && (
                        <button
                            type="button"
                            aria-label={t("esim.search.clear")}
                            onClick={() => setQ("")}
                            style={{ marginLeft: 8 }}
                        >
                            ✕
                        </button>
                    )}
                </div>

                {loading && (
                    <div style={{ padding: 12, opacity: 0.7 }}>
                        {t("esim.search.loading")}
                    </div>
                )}
                {err && !loading && (
                    <div style={{ padding: 12, color: "#ED2428" }}>{err}</div>
                )}

                {!loading && !err && (
                    filtered.length ? (
                        <ul style={{ paddingRight: 15 }}>
                            {filtered.map((item, i) => {
                                if (mode === "countries") {
                                    const name =
                                        item?.country_name?.ru ||
                                        item?.country_name?.en ||
                                        item?.country_name?.tm ||
                                        item?.country_code;
                                    const key = item.country_code || name || i;
                                    const isSel =
                                        selectedCountry?.country_code === item.country_code;
                                    return (
                                        <li
                                            key={key}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => loadTariffsFor(item, true)}
                                            onKeyDown={(e) =>
                                                e.key === "Enter"
                                                    ? loadTariffsFor(item, true)
                                                    : null
                                            }
                                            className={isSel ? "selected" : ""}
                                            style={{ cursor: "pointer" }}
                                            title={t("esim.list.showTariffs")}
                                        >
                                            {item.flag_url ? (
                                                <img
                                                    src={item.flag_url}
                                                    alt={name}
                                                    width={38}
                                                    height={28}
                                                    style={{
                                                        borderRadius: 6,
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    style={{
                                                        width: 38,
                                                        height: 28,
                                                        borderRadius: 6,
                                                        background: "#eee",
                                                    }}
                                                />
                                            )}
                                            <span>{name}</span>
                                            <span
                                                style={{
                                                    marginLeft: "auto",
                                                    fontSize: 14,
                                                }}
                                            >
                                                {t("esim.list.tariffsCount", {
                                                    count: item.tariff_count ?? 0,
                                                })}
                                            </span>
                                        </li>
                                    );
                                } else {
                                    const name =
                                        item?.region_name?.ru || item?.region_name?.en;
                                    const isSel =
                                        selectedRegion?.region_name?.en ===
                                        item?.region_name?.en;
                                    return (
                                        <li
                                            key={name || i}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => loadTariffsForRegion(item, true)}
                                            onKeyDown={(e) =>
                                                e.key === "Enter"
                                                    ? loadTariffsForRegion(item, true)
                                                    : null
                                            }
                                            className={isSel ? "selected" : ""}
                                            style={{ cursor: "pointer" }}
                                            title={t("esim.list.showTariffs")}
                                        >
                                            {item.region_url ? (
                                                <img
                                                    src={item.region_url}
                                                    alt={name}
                                                    width={38}
                                                    height={28}
                                                    style={{
                                                        borderRadius: 6,
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    style={{
                                                        width: 38,
                                                        height: 28,
                                                        borderRadius: 6,
                                                        background: "#eee",
                                                    }}
                                                />
                                            )}
                                            <span>{name}</span>
                                            <span
                                                style={{
                                                    marginLeft: "auto",
                                                    fontSize: 14,
                                                }}
                                            >
                                                {t("esim.list.tariffsCount", {
                                                    count: item.tariff_count ?? 0,
                                                })}
                                            </span>
                                        </li>
                                    );
                                }
                            })}
                        </ul>
                    ) : (
                        <div style={{ padding: 12, opacity: 0.7 }}>
                            {t("esim.search.nothingFound")}
                        </div>
                    )
                )}
            </div>

            <div className="esim-grid" ref={gridRef}>
                <h1 className="e-head e2">{t("esim.tariffs.title")}</h1>

                <div className="blocks">
                    {tLoading && (
                        <div style={{ padding: 12, opacity: 0.7 }}>
                            {t("esim.tariffs.loading")}
                        </div>
                    )}
                    {tErr && !tLoading && (
                        <div style={{ padding: 12, color: "#ED2428" }}>{tErr}</div>
                    )}

                    {!tLoading && !tErr && (
                        tariffs.length === 0 ? (
                            selectedCountry || selectedRegion ? (
                                <div style={{ padding: 12, opacity: 0.7 }}>
                                    {t("esim.tariffs.notFound")}
                                </div>
                            ) : (
                                <div style={{ padding: 12, opacity: 0.7 }}>
                                    {t("esim.tariffs.selectCountry")}
                                </div>
                            )
                        ) : null
                    )}

                    {!tLoading &&
                        !tErr &&
                        tariffs.map((tariffItem, i) => (
                            <div className="esim" key={`${tariffItem.name || "tariff"}-${i}`}>
                                <div className="esim-flex">
                                    <b>
                                        {tariffItem.is_unlimited
                                            ? t("esim.tariffs.unlimited")
                                            : formatTraffic(tariffItem.traffic)}
                                    </b>
                                    {(selectedCountry?.flag_url ||
                                        selectedRegion?.region_url) && (
                                            <div className="trf-img">
                                                <img
                                                    src={
                                                        selectedCountry?.flag_url ||
                                                        selectedRegion?.region_url
                                                    }
                                                    alt={
                                                        selectedCountry
                                                            ? selectedCountry?.country_name?.ru ||
                                                            selectedCountry?.country_code
                                                            : selectedRegion?.region_name?.ru ||
                                                            selectedRegion?.region_name?.en
                                                    }
                                                />
                                            </div>
                                        )}
                                </div>

                                <div className="data-flex">
                                    <div
                                        className="d-flex-div"
                                        style={{ borderBottom: "1px solid #00000026" }}
                                    >
                                        <p>
                                            {selectedCountry
                                                ? t("esim.tariffs.country")
                                                : t("esim.tariffs.coverage")}
                                        </p>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                                cursor:
                                                    mode === "regions"
                                                        ? "pointer"
                                                        : "default",
                                                opacity:
                                                    mode === "regions" ? 1 : 0.6,
                                            }}
                                            onClick={
                                                mode === "regions"
                                                    ? tariffFunc
                                                    : undefined
                                            }
                                        >
                                            <p>
                                                {selectedCountry
                                                    ? selectedCountry?.country_name?.ru ||
                                                    selectedCountry?.country_name?.en ||
                                                    selectedCountry?.country_name?.tm ||
                                                    selectedCountry?.country_code ||
                                                    "—"
                                                    : regionCoverage != null
                                                        ? t(
                                                            "esim.tariffs.coverageCountriesShort",
                                                            {
                                                                count: regionCoverage,
                                                            }
                                                        )
                                                        : "—"}
                                            </p>
                                            {selectedRegion && (
                                                <svg
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    style={{
                                                        opacity:
                                                            mode === "regions"
                                                                ? 1
                                                                : 0.4,
                                                    }}
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
                                        <p>{t("esim.tariffs.days")}</p>
                                        <p>
                                            {tariffItem.days != null
                                                ? t("esim.tariffs.daysSuffix", {
                                                    count: tariffItem.days,
                                                })
                                                : "—"}
                                        </p>
                                    </div>
                                </div>

                                <div className="esim-price">
                                    <b>{t("esim.tariffs.price")}</b>
                                    <b>
                                        {tariffItem.price_tmt != null
                                            ? `${tariffItem.price_tmt} TMT`
                                            : "—"}
                                    </b>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedTariff(tariffItem);
                                        formFunc();
                                    }}
                                >
                                    {t("esim.tariffs.buy")}
                                </button>
                            </div>
                        ))}
                </div>
            </div>

            {/* Put FAQ HERE */}
            {/* FAQ */}
            <div style={{ marginTop: 40, marginBottom: 200 }}>
                <h1 style={{ fontSize: 32, marginBottom: 24 }}>FAQ</h1>

                <div className="quests">
                    {/* 1 */}
                    <div
                        className="quest"
                        onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                        style={{ cursor: "pointer" }}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <p>Что такое eSIM?</p>
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{
                                    transform: openFaq === 1 ? "rotate(180deg)" : "rotate(0deg)",
                                    transition: "0.2s",
                                }}
                            >
                                <path
                                    d="M18.9882 9C19.8882 9 20.3382 10.077 19.7022 10.706L16.5722 13.802C14.4182 15.934 13.3402 17 12.0002 17C10.6602 17 9.58319 15.934 7.42719 13.802L4.29819 10.706C3.66119 10.076 4.11219 9 5.01319 9C5.28019 9 5.53719 9.105 5.72719 9.293L8.85719 12.388C9.97519 13.494 10.6722 14.178 11.2462 14.611C11.7632 15.001 11.9432 15.001 11.9972 15.001H12.0032C12.0562 15.001 12.2372 15.001 12.7542 14.611C13.3282 14.179 14.0262 13.494 15.1442 12.388L18.2732 9.293C18.4636 9.10498 18.7206 8.99969 18.9882 9Z"
                                    fill="#626C77"
                                />
                            </svg>
                        </div>

                        {openFaq === 1 && (
                            <span
                                style={{
                                    marginTop: 10,
                                    fontSize: 14,
                                    color: "#00000099",
                                    display: "flex",
                                }}
                            >
                                Это цифровой QR-код для установки профиля eSIM иностранного оператора только за
                                рубежом. Оператор предоставляет мобильный интернет-доступ в поездке, но не включает
                                голос/звонки и SMS, не выдаёт местный номер и не работает внутри Туркменистана.
                            </span>
                        )}
                    </div>

                    {/* 2 */}
                    <div
                        className="quest"
                        onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                        style={{ cursor: "pointer" }}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <p>С какими устройствами работает eSIM?</p>
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{
                                    transform: openFaq === 2 ? "rotate(180deg)" : "rotate(0deg)",
                                    transition: "0.2s",
                                }}
                            >
                                <path
                                    d="M18.9882 9C19.8882 9 20.3382 10.077 19.7022 10.706L16.5722 13.802C14.4182 15.934 13.3402 17 12.0002 17C10.6602 17 9.58319 15.934 7.42719 13.802L4.29819 10.706C3.66119 10.076 4.11219 9 5.01319 9C5.28019 9 5.53719 9.105 5.72719 9.293L8.85719 12.388C9.97519 13.494 10.6722 14.178 11.2462 14.611C11.7632 15.001 11.9432 15.001 11.9972 15.001H12.0032C12.0562 15.001 12.2372 15.001 12.7542 14.611C13.3282 14.179 14.0262 13.494 15.1442 12.388L18.2732 9.293C18.4636 9.10498 18.7206 8.99969 18.9882 9Z"
                                    fill="#626C77"
                                />
                            </svg>
                        </div>

                        {openFaq === 2 && (
                            <div>
                                <span
                                    style={{
                                        marginTop: 10,
                                        fontSize: 14,
                                        color: "#00000099",
                                        display: "flex",
                                    }}
                                >
                                    eSIM поддерживается на современных устройствах iPhone, iPad и Android.
                                </span>
                                <ul
                                    style={{
                                        marginLeft: 50,
                                        fontSize: 14,
                                        color: "#00000099",
                                        marginTop: 8,
                                    }}
                                >
                                    <li>
                                        Проверить, поддерживает ли ваше устройство eSIM, можно в настройках или набором
                                        команды <b>*#06#</b> — если видите номер EID, eSIM можно установить.
                                    </li>
                                    <li>
                                        Перед покупкой обязательно убедитесь, что модель телефона работает с eSIM.
                                        Ответственность за эту проверку лежит на покупателе и продавце.
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* 3 */}
                    <div
                        className="quest"
                        onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                        style={{ cursor: "pointer" }}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <p>Можно ли вернуть деньги за eSIM после покупки?</p>
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{
                                    transform: openFaq === 3 ? "rotate(180deg)" : "rotate(0deg)",
                                    transition: "0.2s",
                                }}
                            >
                                <path
                                    d="M18.9882 9C19.8882 9 20.3382 10.077 19.7022 10.706L16.5722 13.802C14.4182 15.934 13.3402 17 12.0002 17C10.6602 17 9.58319 15.934 7.42719 13.802L4.29819 10.706C3.66119 10.076 4.11219 9 5.01319 9C5.28019 9 5.53719 9.105 5.72719 9.293L8.85719 12.388C9.97519 13.494 10.6722 14.178 11.2462 14.611C11.7632 15.001 11.9432 15.001 11.9972 15.001H12.0032C12.0562 15.001 12.2372 15.001 12.7542 14.611C13.3282 14.179 14.0262 13.494 15.1442 12.388L18.2732 9.293C18.4636 9.10498 18.7206 8.99969 18.9882 9Z"
                                    fill="#626C77"
                                />
                            </svg>
                        </div>

                        {openFaq === 3 && (
                            <span
                                style={{
                                    marginTop: 10,
                                    fontSize: 14,
                                    color: "#00000099",
                                    display: "flex",
                                }}
                            >
                                К сожалению, нет. eSIM невозвратный.
                            </span>
                        )}
                    </div>

                    {/* 4 */}
                    <div
                        className="quest"
                        onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}
                        style={{ cursor: "pointer" }}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <p>Как я получу eSIM после оплаты?</p>
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{
                                    transform: openFaq === 4 ? "rotate(180deg)" : "rotate(0deg)",
                                    transition: "0.2s",
                                }}
                            >
                                <path
                                    d="M18.9882 9C19.8882 9 20.3382 10.077 19.7022 10.706L16.5722 13.802C14.4182 15.934 13.3402 17 12.0002 17C10.6602 17 9.58319 15.934 7.42719 13.802L4.29819 10.706C3.66119 10.076 4.11219 9 5.01319 9C5.28019 9 5.53719 9.105 5.72719 9.293L8.85719 12.388C9.97519 13.494 10.6722 14.178 11.2462 14.611C11.7632 15.001 11.9432 15.001 11.9972 15.001H12.0032C12.0562 15.001 12.2372 15.001 12.7542 14.611C13.3282 14.179 14.0262 13.494 15.1442 12.388L18.2732 9.293C18.4636 9.10498 18.7206 8.99969 18.9882 9Z"
                                    fill="#626C77"
                                />
                            </svg>
                        </div>

                        {openFaq === 4 && (
                            <div>
                                <span
                                    style={{
                                        marginTop: 10,
                                        fontSize: 14,
                                        color: "#00000099",
                                        display: "flex",
                                    }}
                                >
                                    После успешной оплаты QR-код и инструкция по установке eSIM придут в течение
                                    3–15&nbsp;минут на e-mail, указанный при оформлении.
                                </span>
                                <br />
                                <b
                                    style={{
                                        fontSize: 14,
                                        color: "#00000099",
                                        display: "flex",
                                    }}
                                >
                                    Важно: точка продаж и клиент несут ответственность за корректность указания e-mail.
                                    Если была допущена ошибка в адресе, система отправит код на неверную почту, и это не
                                    является техническим сбоем.
                                </b>
                            </div>
                        )}
                    </div>

                    {/* 5 */}
                    <div
                        className="quest"
                        onClick={() => setOpenFaq(openFaq === 5 ? null : 5)}
                        style={{ cursor: "pointer" }}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <p>Что делать, если не пришло письмо с QR-кодом?</p>
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{
                                    transform: openFaq === 5 ? "rotate(180deg)" : "rotate(0deg)",
                                    transition: "0.2s",
                                }}
                            >
                                <path
                                    d="M18.9882 9C19.8882 9 20.3382 10.077 19.7022 10.706L16.5722 13.802C14.4182 15.934 13.3402 17 12.0002 17C10.6602 17 9.58319 15.934 7.42719 13.802L4.29819 10.706C3.66119 10.076 4.11219 9 5.01319 9C5.28019 9 5.53719 9.105 5.72719 9.293L8.85719 12.388C9.97519 13.494 10.6722 14.178 11.2462 14.611C11.7632 15.001 11.9432 15.001 11.9972 15.001H12.0032C12.0562 15.001 12.2372 15.001 12.7542 14.611C13.3282 14.179 14.0262 13.494 15.1442 12.388L18.2732 9.293C18.4636 9.10498 18.7206 8.99969 18.9882 9Z"
                                    fill="#626C77"
                                />
                            </svg>
                        </div>

                        {openFaq === 5 && (
                            <div>
                                <span
                                    style={{
                                        marginTop: 10,
                                        fontSize: 14,
                                        color: "#00000099",
                                        display: "flex",
                                    }}
                                >
                                    Первым делом проверьте папки «Спам», «Промоакции» и «Рассылки».
                                </span>
                                <br />
                                <span
                                    style={{
                                        fontSize: 14,
                                        color: "#00000099",
                                        display: "flex",
                                    }}
                                >
                                    Убедитесь, что адрес почты был указан без ошибок.
                                </span>
                                <br />
                                <b
                                    style={{
                                        fontSize: 14,
                                        color: "#00000099",
                                        display: "flex",
                                    }}
                                >
                                    Если при оформлении e-mail был указан неверно, точка продаж может вручить eSIM
                                    клиенту лично и передать QR-код вручную. В истории транзакции доступна отдельная
                                    ссылка «QR/Инструкция», по которой продавец может получить код активации и выдать
                                    его клиенту.
                                </b>
                            </div>
                        )}
                    </div>

                    {/* 6 */}
                    <div
                        className="quest"
                        onClick={() => setOpenFaq(openFaq === 6 ? null : 6)}
                        style={{ cursor: "pointer" }}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <p>С какого момента отсчитывается срок действия eSIM?</p>
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{
                                    transform: openFaq === 6 ? "rotate(180deg)" : "rotate(0deg)",
                                    transition: "0.2s",
                                }}
                            >
                                <path
                                    d="M18.9882 9C19.8882 9 20.3382 10.077 19.7022 10.706L16.5722 13.802C14.4182 15.934 13.3402 17 12.0002 17C10.6602 17 9.58319 15.934 7.42719 13.802L4.29819 10.706C3.66119 10.076 4.11219 9 5.01319 9C5.28019 9 5.53719 9.105 5.72719 9.293L8.85719 12.388C9.97519 13.494 10.6722 14.178 11.2462 14.611C11.7632 15.001 11.9432 15.001 11.9972 15.001H12.0032C12.0562 15.001 12.2372 15.001 12.7542 14.611C13.3282 14.179 14.0262 13.494 15.1442 12.388L18.2732 9.293C18.4636 9.10498 18.7206 8.99969 18.9882 9Z"
                                    fill="#626C77"
                                />
                            </svg>
                        </div>

                        {openFaq === 6 && (
                            <span
                                style={{
                                    marginTop: 10,
                                    fontSize: 14,
                                    color: "#00000099",
                                    display: "flex",
                                }}
                            >
                                eSIM начинает действовать с момента подключения и подтверждения активации у
                                оператора — как только вы отсканировали QR-код и профиль успешно установился на
                                устройстве.
                            </span>
                        )}
                    </div>

                    {/* 7 */}
                    <div
                        className="quest"
                        onClick={() => setOpenFaq(openFaq === 7 ? null : 7)}
                        style={{ cursor: "pointer" }}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <p>Что делать, если система пишет, что код уже активирован?</p>
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{
                                    transform: openFaq === 7 ? "rotate(180deg)" : "rotate(0deg)",
                                    transition: "0.2s",
                                }}
                            >
                                <path
                                    d="M18.9882 9C19.8882 9 20.3382 10.077 19.7022 10.706L16.5722 13.802C14.4182 15.934 13.3402 17 12.0002 17C10.6602 17 9.58319 15.934 7.42719 13.802L4.29819 10.706C3.66119 10.076 4.11219 9 5.01319 9C5.28019 9 5.53719 9.105 5.72719 9.293L8.85719 12.388C9.97519 13.494 10.6722 14.178 11.2462 14.611C11.7632 15.001 11.9432 15.001 11.9972 15.001H12.0032C12.0562 15.001 12.2372 15.001 12.7542 14.611C13.3282 14.179 14.0262 13.494 15.1442 12.388L18.2732 9.293C18.4636 9.10498 18.7206 8.99969 18.9882 9Z"
                                    fill="#626C77"
                                />
                            </svg>
                        </div>

                        {openFaq === 7 && (
                            <span
                                style={{
                                    marginTop: 10,
                                    fontSize: 14,
                                    color: "#00000099",
                                    display: "flex",
                                }}
                            >
                                Обратитесь в поддержку, указанную в письме с QR-кодом. Мы проверим код у поставщика и,
                                если подтвердится техническая проблема, заменим его на новый.
                            </span>
                        )}
                    </div>

                    {/* 8 */}
                    <div
                        className="quest"
                        onClick={() => setOpenFaq(openFaq === 8 ? null : 8)}
                        style={{ cursor: "pointer" }}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <p>В Туркменистане я могу использовать eSIM?</p>
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{
                                    transform: openFaq === 8 ? "rotate(180deg)" : "rotate(0deg)",
                                    transition: "0.2s",
                                }}
                            >
                                <path
                                    d="M18.9882 9C19.8882 9 20.3382 10.077 19.7022 10.706L16.5722 13.802C14.4182 15.934 13.3402 17 12.0002 17C10.6602 17 9.58319 15.934 7.42719 13.802L4.29819 10.706C3.66119 10.076 4.11219 9 5.01319 9C5.28019 9 5.53719 9.105 5.72719 9.293L8.85719 12.388C9.97519 13.494 10.6722 14.178 11.2462 14.611C11.7632 15.001 11.9432 15.001 11.9972 15.001H12.0032C12.0562 15.001 12.2372 15.001 12.7542 14.611C13.3282 14.179 14.0262 13.494 15.1442 12.388L18.2732 9.293C18.4636 9.10498 18.7206 8.99969 18.9882 9Z"
                                    fill="#626C77"
                                />
                            </svg>
                        </div>

                        {openFaq === 8 && (
                            <span
                                style={{
                                    marginTop: 10,
                                    fontSize: 14,
                                    color: "#00000099",
                                    display: "flex",
                                }}
                            >
                                Нет, это невозможно. eSIM работает только в той стране, для которой она была выпущена, и
                                не активируется в Туркменистане.
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment form */}
            <div className={payform ? "payment-form showform" : "payment-form"}>
                <form>
                    <div>
                        <p className="pay-h">{t("esim.purchase.title")}</p>
                        <div className="pay-data">
                            <div
                                style={{
                                    borderBottom: "1.5px solid #00000026",
                                }}
                            >
                                <p>{t("esim.purchase.coverage")}</p>
                                <p>{coverageLabel}</p>
                            </div>
                            <div
                                style={{
                                    borderBottom: "1.5px solid #00000026",
                                }}
                            >
                                <p>{t("esim.purchase.traffic")}</p>
                                <p>{trafficLabel}</p>
                            </div>
                            <div>
                                <p>{t("esim.purchase.days")}</p>
                                <p>{daysLabel}</p>
                            </div>
                            <div style={{ marginTop: 30 }}>
                                <p>{t("esim.purchase.price")}</p>
                                <p>{priceLabel}</p>
                            </div>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "16px",
                                margin: "16px 0px",
                            }}
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M12 16H12.01M12 8V12M9 4H15L20 9V15L15 20H9L4 15V9L9 4Z"
                                    stroke="#F50100"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <p
                                style={{
                                    fontSize: 14,
                                    fontWeight: 500,
                                    color: "#F50100",
                                }}
                            >
                                {t("esim.purchase.nonRefundableNotice")}
                            </p>
                        </div>
                        <span className="pay-desc">
                            {t("esim.purchase.emailNotice")}
                        </span>
                    </div>
                    <div className="pay-data2">
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <p className="pay-h">
                                {t("esim.purchase.clientData")}
                            </p>
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                onClick={formFunc}
                                className="close-payment"
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

                        <div
                            className="pay-inputs"
                            style={{ marginTop: 20 }}
                        >
                            <p className="pay-label">
                                {t("esim.purchase.email")}
                            </p>
                            <input
                                type="email"
                                placeholder={t(
                                    "esim.purchase.emailPlaceholder"
                                )}
                                value={clientEmail}
                                onChange={(e) => {
                                    setClientEmail(e.target.value);
                                    setFieldErrors((f) => ({
                                        ...f,
                                        email: false,
                                    }));
                                }}
                                style={
                                    fieldErrors.email
                                        ? { border: "1px solid #F50100" }
                                        : {}
                                }
                            />
                        </div>

                        <div
                            className="pay-inputs"
                            style={{ marginTop: 20 }}
                        >
                            <p className="pay-label">
                                {t("esim.purchase.phone")}
                            </p>
                            <input
                                type="tel"
                                inputMode="tel"
                                placeholder={t(
                                    "esim.purchase.phonePlaceholder"
                                )}
                                value={clientPhone}
                                onChange={(e) => {
                                    let v = e.target.value.replace(
                                        /[^0-9+]/g,
                                        ""
                                    );
                                    // allow + only at the first position and only once
                                    v = v.replace(
                                        /\+/g,
                                        (m, offset) =>
                                            offset === 0 ? m : ""
                                    );
                                    v = v.replace(
                                        /(.)(?=.*\+)/g,
                                        (ch) => (ch === "+" ? "" : ch)
                                    );

                                    v = v.slice(0, 12);

                                    setClientPhone(v);
                                    setFieldErrors((f) => ({
                                        ...f,
                                        phone: false,
                                    }));
                                }}
                                style={
                                    fieldErrors.phone
                                        ? { border: "1px solid #F50100" }
                                        : {}
                                }
                            />
                        </div>
                        <div className="pay-data">
                            <div
                                style={{
                                    borderBottom: "1.5px solid #00000026",
                                }}
                            >
                                <p>{t("esim.purchase.coverage")}</p>
                                <p>{coverageLabel}</p>
                            </div>
                            <div>
                                <p>{t("esim.purchase.total")}</p>
                                <p>{priceLabel}</p>
                            </div>
                        </div>
                        <label
                            className="checkbox"
                            style={{ marginTop: 20 }}
                        >
                            <input
                                type="checkbox"
                                checked={formConfirmed}
                                onChange={(e) => {
                                    const checked = e.target.checked;

                                    if (checked) {
                                        const emailErr =
                                            !isValidEmail(clientEmail);
                                        const phoneErr =
                                            !clientPhone.trim();

                                        setFieldErrors({
                                            email: emailErr,
                                            phone: phoneErr,
                                        });

                                        if (emailErr || phoneErr) {
                                            setFormConfirmed(false);
                                            return;
                                        }
                                    }

                                    setFormConfirmed(checked);
                                }}
                            />
                            <span className="checkmark"></span>
                            <span className="label">
                                {t("esim.purchase.confirmation")}
                            </span>
                        </label>
                        <div>
                            <button
                                type="button"
                                className="pay-btn"
                                disabled={
                                    !formConfirmed ||
                                    !selectedTariff ||
                                    paying
                                }
                                onClick={handleBuyEsim}
                            >
                                {paying ? (
                                    <div className="spinner"></div>
                                ) : (
                                    t("esim.purchase.submit")
                                )}
                            </button>
                        </div>
                    </div>
                </form>
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
                        <span>{t("esim.coverage.modalTitle")}</span>
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
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
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
                            placeholder={t("esim.coverage.searchPlaceholder")}
                            value={coverageSearch}
                            onChange={(e) => setCoverageSearch(e.target.value)}
                        />

                        {coverageSearch && (
                            <button
                                type="button"
                                aria-label={t("esim.search.clear")}
                                onClick={() => setCoverageSearch("")}
                                style={{ marginLeft: 8 }}
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <div className="list-auto" style={{ paddingRight: 15 }}>
                        {covLoading && (
                            <li style={{ padding: 12, opacity: 0.7 }}>
                                {t("esim.coverage.loading")}
                            </li>
                        )}
                        {covErr && !covLoading && (
                            <li style={{ padding: 12, color: "#ED2428" }}>{covErr}</li>
                        )}

                        {!covLoading &&
                            !covErr &&
                            selectedRegion &&
                            filteredCoverage.map((c) => (
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
                                            alt={
                                                c.country_name?.ru ||
                                                c.country_name?.en ||
                                                c.country_code
                                            }
                                            width={28}
                                            height={20}
                                            style={{
                                                borderRadius: 6,
                                                objectFit: "cover",
                                            }}
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
                                        {c.country_name?.ru ||
                                            c.country_name?.en ||
                                            c.country_code}
                                    </p>

                                    <p
                                        style={{
                                            marginLeft: "auto",
                                            fontSize: 14,
                                        }}
                                    >
                                        {t("esim.coverage.tariffsCount", {
                                            count: c.tariff_count ?? 0,
                                        })}
                                    </p>
                                </li>
                            ))}

                        {!covLoading &&
                            !covErr &&
                            selectedRegion &&
                            filteredCoverage.length === 0 && (
                                <li style={{ padding: 12, opacity: 0.7 }}>
                                    {coverageSearch
                                        ? t("esim.coverage.notFoundQuery")
                                        : t("esim.coverage.notFound")}
                                </li>
                            )}
                    </div>
                </ul>
            </div>
        </div>
    );
}

export default Esim;