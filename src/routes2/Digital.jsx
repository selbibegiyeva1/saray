import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../lib/api"; // axios instance with auth + refresh
import "../styles/Digital.css";

import { useTranslation } from "react-i18next";

const CATEGORIES = [
    { key: "business", labelKey: "digital.categoryBusiness" },
    { key: "games", labelKey: "digital.categoryGames" },
];

function Digital() {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const getValidCategory = (v) => (["business", "games"].includes(v) ? v : "business");
    const [category, setCategory] = useState(getValidCategory(searchParams.get("category")));

    const [query, setQuery] = useState("");
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    // Fetch groups by category (endpoint doesn't support query)
    useEffect(() => {
        let cancel = false;
        (async () => {
            setLoading(true);
            setErr(null);
            try {
                const { data } = await api.get("/v1/partner/catalog/product/groups", {
                    params: category === "ALL" ? {} : { category },
                });
                if (!cancel) setGroups(Array.isArray(data) ? data : []);
            } catch (e) {
                if (!cancel) setErr(e?.response?.data?.message || `${t("steam.errorLoading")}`);
            } finally {
                if (!cancel) setLoading(false);
            }
        })();
        return () => { cancel = true; };
    }, [category]);

    // Keep category in sync with URL
    useEffect(() => {
        const urlCat = getValidCategory(searchParams.get("category"));
        setCategory((curr) => (curr === urlCat ? curr : urlCat));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // Client-side filter as you type
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return groups;
        return groups.filter(g => (g.group_name || "").toLowerCase().includes(q));
    }, [groups, query]);

    // Submit handler just prevents reload (filtering is live)
    const handleSearchSubmit = (e) => {
        e.preventDefault();
    };

    const externalQuery = searchParams.get("query") || "";
    useEffect(() => {
        if (externalQuery) setQuery(externalQuery);
    }, [externalQuery]);

    return (
        <div className='Digital'>
            <h1>{t("digital.title")}</h1>

            <div className="digital-search">
                <p className='digital-search-h'>{t("digital.searchTitle")}</p>
                <form
                    onSubmit={handleSearchSubmit}
                    style={{ marginTop: 20, display: "flex", gap: 16 }}
                >
                    <div className="search-input">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M11.1524 11.1572L15.8281 15.833M7.91146 12.4997C10.4428 12.4997 12.4948 10.4476 12.4948 7.91634C12.4948 5.38504 10.4428 3.33301 7.91146 3.33301C5.38015 3.33301 3.32812 5.38504 3.32812 7.91634C3.32812 10.4476 5.38015 12.4997 7.91146 12.4997Z"
                                stroke="black"
                                strokeOpacity="0.6"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <input
                            type="text"
                            placeholder={t("digital.searchPlaceholder")}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <button className='dig-search-btn' type="submit">{t("digital.searchButton")}</button>
                </form>

                {/* Quick picks (optional shortcuts that just fill the input) */}
                <div className="dig-flex2">
                    {[
                        "Steam",
                        "Spotify",
                        "Netflix",
                        "APPLE ID",
                        "Playstation",
                        "PUBG Mobile",
                        "Roblox",
                        "Discord",
                    ].map((name) => {
                        const lower = name.toLowerCase();
                        const isSteam = lower === "steam";

                        return (
                            <Link
                                key={name}
                                to={isSteam ? "/steam" : "/product"}
                                state={isSteam ? undefined : { group_name: name }}
                                title={name}
                                className="dig-flex2-item"
                                style={{ textDecoration: "none", color: "inherit" }}
                            >
                                <img
                                    src={
                                        lower === "steam"
                                            ? "/digital/steam1.png"
                                            : lower === "spotify"
                                                ? "/digital/spotify1.png"
                                                : lower === "netflix"
                                                    ? "/digital/netflix1.png"
                                                    : lower === "apple id"
                                                        ? "/digital/appstore1.png"
                                                        : lower === "playstation"
                                                            ? "/digital/ps1.png"
                                                            : lower === "pubg mobile"
                                                                ? "/pubgmobile 1.png"
                                                                : lower === "roblox"
                                                                    ? "/digital/rob1.png"
                                                                    : "/digital/dis1.png"
                                    }
                                    alt={name}
                                    style={{ width: 23 }}
                                    onError={(e) => (e.currentTarget.src = "/image.png")}
                                />
                                <p style={{ fontSize: 14, fontWeight: 600 }}>{name}</p>
                            </Link>
                        );
                    })}
                </div>

            </div>

            <div style={{ marginTop: 24 }}>
                <p className="digital-search-h s2" style={{ marginTop: 16 }}>
                    {CATEGORIES.find(c => c.key === category)
                        ? t(CATEGORIES.find(c => c.key === category).labelKey)
                        : ""}
                </p>

                <div className="digital-btns">
                    {CATEGORIES.map(c => (
                        <button
                            key={c.key}
                            className={category === c.key ? "active" : ""}
                            onClick={() => {
                                setCategory(c.key);
                                setSearchParams({ category: c.key });
                            }}
                            aria-pressed={category === c.key}
                            title={c.label}
                        >
                            {c.key === "games" ? (
                                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8.08333 18.583H10.75M13.4167 18.583H10.75M10.75 18.583V15.958M10.75 15.958H16.75C17.8546 15.958 18.75 15.0626 18.75 13.958V6.58301C18.75 5.47844 17.8546 4.58301 16.75 4.58301H4.75C3.64543 4.58301 2.75 5.47844 2.75 6.58301V13.958C2.75 15.0626 3.64543 15.958 4.75 15.958H10.75Z" stroke={category === "games" ? "white" : "black"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ) : (
                                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.375 13.625V17.125M17.125 15.375H13.625M14.75 9.25H16C17.1046 9.25 18 8.35457 18 7.25V6C18 4.89543 17.1046 4 16 4H14.75C13.6454 4 12.75 4.89543 12.75 6V7.25C12.75 8.35457 13.6454 9.25 14.75 9.25ZM6 18H7.25C8.35457 18 9.25 17.1046 9.25 16V14.75C9.25 13.6454 8.35457 12.75 7.25 12.75H6C4.89543 12.75 4 13.6454 4 14.75V16C4 17.1046 4.89543 18 6 18ZM6 9.25H7.25C8.35457 9.25 9.25 8.35457 9.25 7.25V6C9.25 4.89543 8.35457 4 7.25 4H6C4.89543 4 4 4.89543 4 6V7.25C4 8.35457 4.89543 9.25 6 9.25Z" stroke={category === "business" ? "white" : "black"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                            <p>{t(c.labelKey)}</p>
                        </button>
                    ))}
                </div>

                {err && <div className="error" role="alert" style={{ marginTop: 24 }}>{err}</div>}
                {loading && <div className="loading" style={{ marginTop: 24 }}>Загрузка…</div>}

                {!loading && !err && (
                    <div className="digital-grid">
                        {filtered.map(item => {
                            const isSteam = item.group_name?.toLowerCase() === "steam";
                            return (
                                <Link
                                    to={isSteam ? "/steam" : "/product"}
                                    state={!isSteam ? { group_id: item.group_id, group_name: item.group_name } : undefined}
                                    key={item.group_id}
                                    className="digital-card"
                                    title={item.group_name}
                                    style={{ color: "black" }}
                                >
                                    <img
                                        src={item.icon_url || "/image.png"}
                                        alt={item.group_name}
                                        onError={(e) => { e.currentTarget.src = "/image.png"; }}
                                    />
                                    <center><b>{item.group_name}</b></center>
                                </Link>
                            );
                        })}
                        {filtered.length === 0 && (
                            <div style={{ opacity: 0.7, padding: 16 }}>{t("steam.nothingFound")}</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Digital;