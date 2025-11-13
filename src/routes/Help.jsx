import React, { useState } from "react";
import "../styles/Help.css";
import { useTranslation } from "react-i18next";

function Help() {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language || "ru";
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const faqData = t("help.faq", { returnObjects: true });

    return (
        <div className="Home">
            <div
                className="page-head trans-head"
                style={{ justifyContent: "center", flexDirection: "column" }}
            >
                <center>
                    <h1>{t("help.title")}</h1>
                </center>
                <center>
                    <span className="help-desc">{t("help.subtitle")}</span>
                </center>
            </div>

            <div className="faqs">
                <div className="faq-flex">
                    <b>{t("help.contactsTitle")}</b>
                    <div className="f-flex-block">
                        <span>Email: esim@unite-venture.com</span>
                        <span>Telegram: @unite_esim</span>
                        <span>
                            {t("help.support")}: +99362 42 31 18
                        </span>
                    </div>
                </div>

                <div className="faq">
                    <p style={{ fontSize: 18, fontWeight: "bold", marginBottom: 31 }}>FAQ</p>

                    {faqData.map((item, index) => (
                        <div
                            key={index}
                            className={`quest ${openIndex === index ? "open" : ""}`}
                        >
                            <div
                                className="quest-header"
                                onClick={() => toggleFAQ(index)}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 26,
                                    cursor: "pointer",
                                }}
                            >
                                <p>{item.question}</p>
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 72 72"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    style={{
                                        transform:
                                            openIndex === index ? "rotate(0deg)" : "rotate(180deg)",
                                        transition: "transform 0.3s ease",
                                    }}
                                >
                                    <path
                                        d="M60 48L36 24L12 48"
                                        stroke="black"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>

                            {openIndex === index && (
                                <span
                                    className="quest-answer"
                                    dangerouslySetInnerHTML={{ __html: item.answer }}
                                ></span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Help;