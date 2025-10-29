import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import "../styles/Login.css";

import api, { setAccessToken } from "../lib/api";

function Login() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const [openLang, setOpenLang] = useState(false);
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");

    const [appAlert, setAppAlert] = useState({ type: null, message: "" });
    const closeAlert = () => setAppAlert({ type: null, message: "" });

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

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({ username: false, password: false });

    const handleLogin = async (e) => {
        e.preventDefault();
        setServerError("");
        const newErrors = {
            username: username.trim() === "",
            password: password.trim() === "",
        };
        setErrors(newErrors);
        if (newErrors.username || newErrors.password) return;

        setLoading(true);
        try {
            const { data } = await api.post(`/v1/auth/partner/login`, { username, password });

            // success UI alert (green)
            setAppAlert({ type: "green", message: data?.message || t("login.success") || "Success" });

            // set token
            setAccessToken(data?.accessToken);

            // delay before redirect
            setTimeout(() => {
                navigate("/home", { replace: true });
            }, 1200);

        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                t("login.invalidCredentials") ||
                "Login failed";

            setServerError(msg);

            // error UI alert (red)
            setAppAlert({ type: "red", message: msg });
        } finally {
            setLoading(false);
        }
    };

    // handle input changes with live error reset
    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
        if (errors.username && e.target.value.trim() !== "") {
            setErrors((prev) => ({ ...prev, username: false }));
        }
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (errors.password && e.target.value.trim() !== "") {
            setErrors((prev) => ({ ...prev, password: false }));
        }
    };

    return (
        <div className='Login'>
            <div className="logo" style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 23.5, gap: 12 }}>
                <svg width="32" height="36" viewBox="0 0 36 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M36 25.3555C36 29.2185 32.8679 32.3506 29.0049 32.3506L17.3447 32.3506L30.6182 16.1748L17.3457 -8.15405e-07L29.0049 -3.05766e-07C32.8679 -1.36907e-07 36 3.13206 36 6.99512L36 25.3555Z" fill="#283FFF" />
                    <path d="M6.99512 32.3506C3.13206 32.3506 -1.27718e-06 29.2185 -1.10832e-06 25.3555L-3.05766e-07 6.99512C-1.36907e-07 3.13206 3.13206 -6.21254e-07 6.99512 -4.52394e-07L17.3447 0L4.07129 16.1748L17.3447 32.3506L6.99512 32.3506Z" fill="#283FFF" />
                    <rect width="10.397" height="10.397" transform="matrix(0.634368 0.773031 -0.634368 0.773031 17.7041 8.30566)" fill="#283FFF" />
                </svg>
                <p>Unite Shop</p>
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
                    <input
                        type="text"
                        placeholder={t("login.enterUsername")}
                        value={username}
                        onChange={handleUsernameChange}
                        className={errors.username ? "error" : ""}
                    />
                    {errors.username && <span>{t("login.empty")}</span>}
                </div>

                <div style={{ marginBottom: 16 }}>
                    <p>{t("login.password")}</p>
                    <input
                        type="password"
                        placeholder={t("login.enterPassword")}
                        value={password}
                        onChange={handlePasswordChange}
                        className={errors.password ? "error" : ""}
                    />
                    {errors.password && <span>{t("login.empty")}</span>}
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? <div className="spinner"></div> : t("login.button")}
                </button>
            </form>

            <center><span className='log-span span2'>{t("login.noRegistration")}</span></center>
            <center><span className='log-span span3'>{t("login.support")}</span></center>

            {/* Alerts */}
            {appAlert.type && (
                <div className="alerts">
                    {appAlert.type === "green" && (
                        <div className="alt green" role="alert">
                            {/* ✅ your success icon */}
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
                            {/* ❌ your error icon */}
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

            {/* <div className="alerts">
                <div className="alt green">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 3.93552C14.795 3.33671 13.4368 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 11.662 20.9814 11.3283 20.9451 11M21 5L12 14L9 11" stroke="#50A66A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <span>Успешно зарегистрировано</span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className='alt-close'>
                        <path d="M5 5L15 15M15 5L5 15" stroke="black" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>

                <div className="alt yellow">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 17H12.01M12 14C12.8906 12.0938 15 12.2344 15 10C15 8.5 14 7 12 7C10.4521 7 9.50325 7.89844 9.15332 9M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#FFB01D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <span>Аккаунт заблокирован</span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className='alt-close'>
                        <path d="M5 5L15 15M15 5L5 15" stroke="black" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>

                <div className="alt red">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 12H8M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#ED2428" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <span>Неверный логин или пароль</span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className='alt-close'>
                        <path d="M5 5L15 15M15 5L5 15" stroke="black" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
            </div> */}
        </div>
    );
}

export default Login;