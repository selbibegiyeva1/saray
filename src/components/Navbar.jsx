// top of file
import React, { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../styles/Navbar.css";

import Sidebar from "./Sidebar";
import { logout } from "../lib/logout";
import { clearAccessToken } from "../lib/api";

import api from "../lib/api";

function Navbar() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "ru";
  const [searchValue, setSearchValue] = useState("");

  const [activeNavId, setActiveNavId] = useState(null);
  const navbarRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    function handleDocClick(e) {
      if (!navbarRef.current) return;

      // Did we click on something that has data-nav-id and is inside Navbar?
      const targetNavItem = e.target.closest("[data-nav-id]");

      if (targetNavItem && navbarRef.current.contains(targetNavItem)) {
        const id = targetNavItem.getAttribute("data-nav-id");
        setActiveNavId(id);
      } else {
        // Clicked somewhere that is NOT one of our nav items
        setActiveNavId(null);
      }
    }

    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, []);

  const TOKEN = localStorage.getItem("accessToken") || "";

  const [profile, setProfile] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  const [openLang, setOpenLang] = useState(false);

  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileErr, setProfileErr] = useState("");

  const [balance, setBalance] = useState(null);
  const [balanceErr, setBalanceErr] = useState("");

  const [productsOpen, setProductsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // 'digital' | 'esim' | 'steam'

  const [prodDrop, setProdDrop] = useState(false);
  const prodFunc = () => setProdDrop(!prodDrop);

  // Language options
  const languages = [
    { code: "ru", label: { ru: "Русский", tm: "Rus dili" } },
    { code: "tm", label: { ru: "Туркменский", tm: "Türkmen dili" } },
  ];

  const currentLabel =
    languages.find((l) => l.code === currentLang)?.label[currentLang] || "Русский";

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem("lang", langCode);
    setOpenLang(false);
  };

  const profileFunc = () => {
    const newState = !profile;
    setProfile(newState);
    if (newState && TOKEN) {
      console.log("Done");
    }
  };

  const sidebarFunc = () => setSidebar(!sidebar);

  useEffect(() => {
    if (!TOKEN) return; // not logged in
    let cancelled = false;
    (async () => {
      setLoadingProfile(true);
      setProfileErr("");
      try {
        const { data } = await api.get("/v1/user/info");
        if (!cancelled) {
          setUser(data?.user || null);
          setCompany(data?.company || null);
        }
      } catch (e) {
        if (!cancelled) setProfileErr(e?.response?.data?.message || "Failed to load profile");
        console.error("Profile load failed:", e);
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    })();
    return () => { cancelled = true; };
  }, [TOKEN]);

  useEffect(() => {
    if (!user?.role) return;
    const fetchBalance = async () => {
      try {
        const url =
          user.role === "DIRECTOR"
            ? "/v1/partner/info/main?category=ALL&period=all_time"
            : "/v1/partner/info/main";
        const { data } = await api.get(url);
        setBalance(typeof data?.balance === "number" ? data.balance : null);
      } catch (e) {
        console.error("Failed to fetch balance:", e);
        setBalanceErr("—");
      }
    };
    fetchBalance();
  }, [user]);

  // inside Navbar() in Navbar.jsx
  useEffect(() => {
    function onDecrement(ev) {
      const dec = Number(ev?.detail?.amount);
      if (!Number.isFinite(dec) || dec <= 0) return;
      setBalance((b) => (typeof b === "number" ? Math.max(0, b - dec) : b));
    }
    window.addEventListener("balance:decrement", onDecrement);
    return () => window.removeEventListener("balance:decrement", onDecrement);
  }, []);

  // inside Navbar()
  const langRef = useRef(null);
  const prodRef = useRef(null);

  useEffect(() => {
    function handleDocClick(e) {
      // close language if click is outside its container
      if (openLang && langRef.current && !langRef.current.contains(e.target)) {
        setOpenLang(false);
      }
      // close products if click is outside its container
      if (prodDrop && prodRef.current && !prodRef.current.contains(e.target)) {
        setProdDrop(false);
      }
    }

    function handleEsc(e) {
      if (e.key === "Escape") {
        setOpenLang(false);
        setProdDrop(false);
      }
    }

    document.addEventListener("mousedown", handleDocClick, true);
    document.addEventListener("touchstart", handleDocClick, true);
    document.addEventListener("keydown", handleEsc, true);
    return () => {
      document.removeEventListener("mousedown", handleDocClick, true);
      document.removeEventListener("touchstart", handleDocClick, true);
      document.removeEventListener("keydown", handleEsc, true);
    };
  }, [openLang, prodDrop]);

  return (
    <div className="Navbar" ref={navbarRef}>
      {/* Logo */}
      <NavLink
        to={user?.role === "OPERATOR" ? "/operator" : "/home"}
        style={{ display: "flex" }}
      >
        <div style={{ display: "flex" }}>
          {company?.logo ? (
            <img src={company.logo} alt={company?.display_name || "logo"} style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover" }} />
          ) : null}
        </div>
      </NavLink>

      {/* Navigation links */}
      <ul className="nav-ul">
        <li>
          <NavLink
            to={user?.role === "OPERATOR" ? "/operator" : "/home"}
            data-nav-id="home"
            className={activeNavId === "home" ? "nav-manual-active" : ""}
          >
            {t("navbar.home")}
          </NavLink>
        </li>
        <li>
          <NavLink
            to={user?.role === "OPERATOR" ? "/operator_transactions" : "/transactions"}
            data-nav-id="transactions"
            className={activeNavId === "transactions" ? "nav-manual-active" : ""}
          >
            {t("navbar.transactions")}
          </NavLink>
        </li>
        {user?.role === "OPERATOR" ? (
          <li style={{ position: "relative" }} ref={prodRef}>
            <button
              type="button"
              onClick={prodFunc}
              data-nav-id="products"
              className={activeNavId === "products" ? "nav-manual-active" : ""}
            >
              <span>{t("navbar.product")}</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.29289 12.2929L5.70711 8.70711C5.07714 8.07714 5.52331 7 6.41421 7H13.5858C14.4767 7 14.9229 8.07714 14.2929 8.70711L10.7071 12.2929C10.3166 12.6834 9.68342 12.6834 9.29289 12.2929Z"
                  fill="black"
                />
              </svg>
            </button>
            <div
              className="drop-options days langs prods"
              style={{ display: `${prodDrop ? "block" : "none"}` }}
              data-nav-id="products"
            >
              <p
                className={selectedProduct === "digital" ? "active" : ""}
                onClick={() => {
                  setSelectedProduct("digital");
                  setProductsOpen(false);
                  navigate("/digital");
                }}
              >
                {t("navbar.dig_prod")}
              </p>
              <p
                className={selectedProduct === "esim" ? "active" : ""}
                onClick={() => {
                  setSelectedProduct("esim");
                  setProductsOpen(false);
                  navigate("/esim");
                }}
              >
                eSIM
              </p>
              <p
                className={selectedProduct === "steam" ? "active" : ""}
                onClick={() => {
                  setSelectedProduct("steam");
                  setProductsOpen(false);
                  navigate("/steam");
                }}
              >
                Steam
              </p>
            </div>
          </li>
        ) : (
          <li>
            <NavLink to="/reports">{t("navbar.reports")}</NavLink>
          </li>
        )}
      </ul>

      {/* <div className="nav-search">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11.1524 11.1575L15.8281 15.8333M7.91146 12.4999C10.4428 12.4999 12.4948 10.4479 12.4948 7.91659C12.4948 5.38528 10.4428 3.33325 7.91146 3.33325C5.38015 3.33325 3.32812 5.38528 3.32812 7.91659C3.32812 10.4479 5.38015 12.4999 7.91146 12.4999Z"
            stroke="black"
            strokeOpacity="0.6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = searchValue.trim();
            if (!q) return;
            navigate(`/digital?category=business&query=${encodeURIComponent(q)}`);
            setSearchValue("");
          }}
        >
          <input
            type="text"
            placeholder="Введите сервис"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </form>
      </div> */}

      {/* Right section */}
      <ul className="nav-ul ul2">
        <li className="balance">
          {balanceErr
            ? balanceErr
            : balance != null
              ? `${Number(balance).toLocaleString("ru-RU")} TMT`
              : "—"}
        </li>

        {/* Language selector */}
        <li>
          <div className="nav-filter langs" ref={langRef}>
            <button
              type="button"
              onClick={() => setOpenLang((v) => !v)}
              aria-expanded={openLang}
              role="button"
              tabIndex={0}
            >
              <p>{currentLabel}</p>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.29289 12.2929L5.70711 8.70711C5.07714 8.07714 5.52331 7 6.41421 7H13.5858C14.4767 7 14.9229 8.07714 14.2929 8.70711L10.7071 12.2929C10.3166 12.6834 9.68342 12.6834 9.29289 12.2929Z"
                  fill="black"
                />
              </svg>
            </button>

            {openLang && (
              <div className="drop-options days langs">
                {languages.map((lang) => (
                  <p
                    key={lang.code}
                    className={lang.code === currentLang ? "opt-active" : ""}
                    onClick={() => changeLanguage(lang.code)}
                  >
                    {lang.label[currentLang]}
                  </p>
                ))}
              </div>
            )}
          </div>
        </li>

        {/* Help link */}
        <li>
          <NavLink to="/help" className={({ isActive }) => (isActive ? "activeHelp" : "")}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 17H12.01M12 14C12.8906 12.0938 15 12.2344 15 10C15 8.5 14 7 12 7C10.4521 7 9.50325 7.89844 9.15332 9M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{t("navbar.help")}</span>
          </NavLink>
        </li>

        {/* Profile */}
        <li>
          <button onClick={profileFunc}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 18.7083C17.4832 16.375 15.5357 15 12.0001 15C8.46459 15 6.51676 16.375 6 18.7083M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21ZM12 12C13.3333 12 14 11.2857 14 9.5C14 7.71429 13.3333 7 12 7C10.6667 7 10 7.71429 10 9.5C10 11.2857 10.6667 12 12 12Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>

            <span>{user?.username || "—"}</span>
          </button>
        </li>

        {/* Sidebar toggle */}
        <li onClick={sidebarFunc} className="toggle">
          {sidebar ? (
            // X icon when active
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            // Hamburger icon when inactive
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 4H20M4 12H20M4 20H20M4 8H20M4 16H20"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </li>
      </ul>

      {/* Profile Modal */}
      <div className={profile ? "profile show" : "profile"}>
        <div className="prof-block">
          <div className="prof-flex">
            <span>{t("navbar.myProfile")}</span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 72 75"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ cursor: "pointer" }}
              onClick={profileFunc}
            >
              <path
                d="M18 19.5L54 55.5M54 19.5L18 55.5"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {loadingProfile && <div style={{ marginBottom: 14 }}>{t("common.loading") || "Loading..."}</div>}
          {profileErr && <div className="alert error" style={{ marginBottom: 14 }}>{profileErr}</div>}

          <div style={{ marginBottom: 14 }}>
            <p>{t("navbar.company")}</p>
            <input type="text" value={company?.display_name || user?.username || "—"} readOnly />
          </div>
          <div style={{ marginBottom: 14 }}>
            <p>Email</p>
            <input type="text" value={user?.email || "—"} readOnly />
          </div>
          <div style={{ marginBottom: 14 }}>
            <p>{t("navbar.fullname")}</p>
            <input type="text" value={user?.full_name || "—"} readOnly />
          </div>
          <div>
            <p>{t("navbar.role")}</p>
            <input type="text" value={user?.role || "—"} readOnly />
          </div>

          <button
            className="logout"
            onClick={async () => {
              try {
                await logout();
              } catch (e) {
                console.error("Logout failed", e);
                clearAccessToken(); // fallback
              } finally {
                navigate("/", { replace: true });
              }
            }}
          >
            {t("navbar.logout")}
          </button>
        </div>
      </div>

      {/* Sidebar menu (mobile) */}
      <Sidebar sidebar={sidebar} sidebarFunc={sidebarFunc} />
    </div>
  );
}

export default Navbar;