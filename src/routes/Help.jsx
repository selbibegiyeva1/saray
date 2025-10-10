import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import "../styles/Help.css";

const faqData = [
    {
        question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras dapibus libero vitae tempor vulputate.",
        answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras dapibus libero vitae tempor vulputate. Nunc et nulla at nisi posuere tincidunt. Nunc ullamcorper tellus nibh."
    },
    {
        question: "Nunc et nulla at nisi posuere tincidunt.",
        answer: "Mauris egestas, justo ac facilisis tincidunt, sapien ex volutpat sapien, vitae vulputate tortor lacus in lorem."
    },
    {
        question: "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.",
        answer: "Aenean ut erat in libero faucibus tincidunt ac non orci. Morbi dictum faucibus nunc nec varius."
    },
    {
        question: "Aliquam erat volutpat.",
        answer: "Suspendisse potenti. Nulla facilisi. Quisque at ligula nec justo bibendum gravida."
    },
    {
        question: "Curabitur dictum, lorem ut aliquet porttitor.",
        answer: "Donec ullamcorper leo id quam convallis, a tincidunt nunc commodo."
    },
    {
        question: "Etiam feugiat lacus ut velit tincidunt aliquam.",
        answer: "Vivamus eget dui id orci malesuada tincidunt sit amet nec nisi."
    }
];

function Help() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className='Home'>
            <Navbar />
            <div className="page-head" style={{ justifyContent: "center", flexDirection: "column" }}>
                <center>
                    <h1>Помощь</h1>
                </center>
                <center>
                    <span className='help-desc'>Напишите что нибудь для дескрипшена</span>
                </center>
            </div>

            <div className="faqs">
                <div className="faq-flex">
                    <b>Контакты:</b>
                    <div className="f-flex-block">
                        <span>Email: roycharyyew@gmail.com</span>
                        <span>Telegram: @Huwejqwo</span>
                    </div>
                </div>

                <p style={{ fontSize: 18, fontWeight: "bold" }}>FAQ</p>

                <div className="faq">
                    {faqData.map((item, index) => (
                        <div key={index} className={`quest ${openIndex === index ? 'open' : ''}`}>
                            <div
                                className="quest-header"
                                onClick={() => toggleFAQ(index)}
                                style={{ display: "flex", justifyContent: "space-between", gap: 26, cursor: "pointer" }}
                            >
                                <p>{item.question}</p>
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 72 72"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    style={{
                                        transform: openIndex === index ? "rotate(0deg)" : "rotate(180deg)",
                                        transition: "transform 0.3s ease"
                                    }}
                                >
                                    <path d="M60 48L36 24L12 48" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            {openIndex === index && (
                                <span className="quest-answer">{item.answer}</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Help;