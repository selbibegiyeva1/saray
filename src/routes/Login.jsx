import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import "../styles/Login.css";

function Login() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const [openLang, setOpenLang] = useState(false);
    const [loading, setLoading] = useState(false); // <-- new state
    const currentLang = i18n.language || "ru";

    const languages = [
        { code: "ru", label: { ru: "Русский", tm: "Rus dili" } },
        { code: "tm", label: { ru: "Туркменский", tm: "Türkmen dili" } }
    ];

    const currentLabel =
        languages.find((l) => l.code === currentLang)?.label[currentLang] || "Русский";

    const changeLanguage = (langCode) => {
        i18n.changeLanguage(langCode);
        localStorage.setItem("lang", langCode);
        setOpenLang(false);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true); // show spinner

        // Fake loading for 2 seconds
        setTimeout(() => {
            setLoading(false);
            navigate("/home");
        }, 2000);
    };

    return (
        <div className='Login'>
            <div className="logo" style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 23.5, gap: 12 }}>
                <svg width="32" height="36" viewBox="0 0 36 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M36 25.3555C36 29.2185 32.8679 32.3506 29.0049 32.3506L17.3447 32.3506L30.6182 16.1748L17.3457 -8.15405e-07L29.0049 -3.05766e-07C32.8679 -1.36907e-07 36 3.13206 36 6.99512L36 25.3555Z" fill="#283FFF" />
                    <path d="M6.99512 32.3506C3.13206 32.3506 -1.27718e-06 29.2185 -1.10832e-06 25.3555L-3.05766e-07 6.99512C-1.36907e-07 3.13206 3.13206 -6.21254e-07 6.99512 -4.52394e-07L17.3447 0L4.07129 16.1748L17.3447 32.3506L6.99512 32.3506Z" fill="#283FFF" />
                    <rect width="10.397" height="10.397" transform="matrix(0.634368 0.773031 -0.634368 0.773031 17.7041 8.30566)" fill="#283FFF" />
                </svg>
                <p>Unite eSIM</p>
            </div>

            <div className="lang" style={{ display: "flex", justifyContent: "center" }}>
                <div className="lang-box">
                    <div className='nav-filter langs'>
                        <button
                            type="button"
                            onClick={() => setOpenLang((v) => !v)}
                            aria-expanded={openLang}
                            role="button"
                            id="log-lang"
                            tabIndex={0}
                        >
                            <p>{currentLabel}</p>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.29289 12.2929L5.70711 8.70711C5.07714 8.07714 5.52331 7 6.41421 7H13.5858C14.4767 7 14.9229 8.07714 14.2929 8.70711L10.7071 12.2929C10.3166 12.6834 9.68342 12.6834 9.29289 12.2929Z" fill="black" />
                            </svg>
                        </button>

                        {openLang && (
                            <div className="drop-options days langs langLogin">
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
                </div>
            </div>

            <center><h2 style={{ marginTop: 35.5 }}>{t("home.title")}</h2></center>
            <center><span className='log-span'>{t("login.subtitle")}</span></center>

            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: 16 }}>
                    <p>{t("login.username")}</p>
                    <input type="text" placeholder={t("login.enterUsername")} required />
                </div>
                <div style={{ marginBottom: 16 }}>
                    <p>{t("login.password")}</p>
                    <input type="password" placeholder={t("login.enterPassword")} required />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? <div className="spinner"></div> : t("login.button")}
                </button>
            </form>

            <center><span className='log-span span2'>{t("login.noRegistration")}</span></center>
            <center><span className='log-span span3'>{t("login.support")}</span></center>
        </div>
    );
}

export default Login;