import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../styles/Navbar.css";

function Navbar() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "ru";

  const navigate = useNavigate();

  const TOKEN =
    "8d5b81f8-e8125-4578-b1a7-e093b318d5b81f8-e8125-4578-b1a7-e093b31";
  const displayToken = `${TOKEN.slice(0, 32)}...`;

  const [profile, setProfile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  const [openLang, setOpenLang] = useState(false);

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

  // Copy token
  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(TOKEN);
      setCopied(true);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = TOKEN;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
      } finally {
        document.body.removeChild(ta);
      }
    } finally {
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const profileFunc = () => setProfile(!profile);
  const sidebarFunc = () => setSidebar(!sidebar);

  return (
    <div className="Navbar">
      {/* Logo */}
      <NavLink
        to="/home"
        className={({ isActive }) => (isActive ? "active" : "")}
        style={{ display: "flex" }}
      >
        <svg
          width="32"
          height="36"
          viewBox="0 0 36 33"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M36 25.3555C36 29.2185 32.8679 32.3506 29.0049 32.3506L17.3447 32.3506L30.6182 16.1748L17.3457 -8.15405e-07L29.0049 -3.05766e-07C32.8679 -1.36907e-07 36 3.13206 36 6.99512L36 25.3555Z"
            fill="#283FFF"
          />
          <path
            d="M6.99512 32.3506C3.13206 32.3506 -1.27718e-06 29.2185 -1.10832e-06 25.3555L-3.05766e-07 6.99512C-1.36907e-07 3.13206 3.13206 -6.21254e-07 6.99512 -4.52394e-07L17.3447 0L4.07129 16.1748L17.3447 32.3506L6.99512 32.3506Z"
            fill="#283FFF"
          />
          <rect
            width="10.397"
            height="10.397"
            transform="matrix(0.634368 0.773031 -0.634368 0.773031 17.7041 8.30566)"
            fill="#283FFF"
          />
        </svg>
      </NavLink>

      {/* Navigation links */}
      <ul className="nav-ul">
        <li>
          <NavLink to="/home">{t("navbar.home")}</NavLink>
        </li>
        <li>
          <NavLink to="/transactions">{t("navbar.transactions")}</NavLink>
        </li>
        <li>
          <NavLink to="/reports">{t("navbar.reports")}</NavLink>
        </li>
      </ul>

      {/* Right section */}
      <ul className="nav-ul ul2">
        {/* Language selector */}
        <li>
          <div className="nav-filter langs">
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
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24 24.9444C23.311 21.8333 20.7142 20 16.0002 20C11.2861 20 8.68901 21.8333 8 24.9444M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28ZM16 16C17.7778 16 18.6667 15.0476 18.6667 12.6667C18.6667 10.2857 17.7778 9.33333 16 9.33333C14.2222 9.33333 13.3333 10.2857 13.3333 12.6667C13.3333 15.0476 14.2222 16 16 16Z"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Мурад</span>
          </button>
        </li>

        {/* Sidebar toggle */}
        <li>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onClick={sidebarFunc}
            className="toggle"
          >
            <path
              d="M4 4H20M4 12H20M4 20H20M4 8H20M4 16H20"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
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

          <div style={{ marginBottom: 14 }}>
            <p>Email</p>
            <input type="text" value="roycharyyew@gmail.com" readOnly />
          </div>
          <div style={{ marginBottom: 14 }}>
            <p>{t("navbar.name")}</p>
            <input type="text" value="Мурад" readOnly />
          </div>
          <div style={{ marginBottom: 14 }}>
            <p>{t("navbar.lastname")}</p>
            <input type="text" value="Мурад" readOnly />
          </div>
          <div style={{ marginBottom: 20 }}>
            <p>{t("navbar.role")}</p>
            <input type="text" value={t("navbar.director")} readOnly />
          </div>

          <div>
            <span className="tkn-spn">{t("navbar.tokenManage")}</span>
            <p>{t("navbar.yourToken")}</p>
            <div
              className="token"
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <input
                type="text"
                className="token-inp"
                value={displayToken}
                readOnly
                title={TOKEN}
              />
              <svg
                width="24"
                height="25"
                viewBox="0 0 24 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ cursor: "pointer" }}
                onClick={copyToken}
              >
                <path
                  d="M9 15.5H5C3.89543 15.5 3 14.6046 3 13.5V5.5C3 4.39543 3.89543 3.5 5 3.5H13C14.1046 3.5 15 4.39543 15 5.5V9.5M11 21.5H19C20.1046 21.5 21 20.6046 21 19.5V11.5C21 10.3954 20.1046 9.5 19 9.5H11C9.89543 9.5 9 10.3954 9 11.5V19.5C9 20.6046 9.89543 21.5 11 21.5Z"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {copied && <span className="copied">{t("navbar.copied")}</span>}
            </div>
          </div>

          <button className="logout" onClick={() => navigate("/")}>
            {t("navbar.logout")}
          </button>
        </div>
      </div>

      {/* Sidebar menu (mobile) */}
      <div className={sidebar ? "sidebar moveleft" : "sidebar"}>
        <ul>
          <li>
            <NavLink to="/home" onClick={sidebarFunc}>
              {t("navbar.home")}
            </NavLink>
          </li>
          <li>
            <NavLink to="/transactions" onClick={sidebarFunc}>
              {t("navbar.transactions")}
            </NavLink>
          </li>
          <li>
            <NavLink to="/reports" onClick={sidebarFunc}>
              {t("navbar.reports")}
            </NavLink>
          </li>
          <li>
            <NavLink to="/help" onClick={sidebarFunc}>
              {t("navbar.help")}
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Navbar;