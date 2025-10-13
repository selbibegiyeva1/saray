import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import "../styles/Help.css";

const faqData = [
    {
        question: "Как изменить пароль или контактные данные?",
        answer: "Обратитесь к администратору вашей организации или к нашему менеджеру — они обновят данные и/или инициируют смену пароля."
    },
    {
        question: "Что означают «Всего заработано», «Выведено» и «Доступно к выводу»?",
        answer: "• Всего заработано — суммарное вознаграждение (кэшбэк), начисленное по вашим продажам. <br><br> • Выведено — сумма, которую вы уже получили (выплаты, выданные наличными или перечисленные на счёт/карту/USDT). <br><br> • Доступно к выводу — сумма, которую можно вывести на текущий момент."
    },
    {
        question: "Есть ли минимальная сумма для вывода?",
        answer: "Минимальной суммы нет. Выплаты производятся раз в месяц в установленную дату, независимо от накопленной суммы"
    },
    {
        question: "Как часто обновляется информация о заработке?",
        answer: "Ежедневно, в 00:00 (по локальному времени кабинета). В течение дня цифры могут носить предварительный характер."
    },
    {
        question: "Почему сумма в разделе «Доступно к выводу» меньше, чем «Всего заработано»?",
        answer: "Потому что часть средств вы уже получили в предыдущие периоды — они учтены во «Выведено» и не входят в текущую доступную сумму."
    },
    {
        question: "Что делать, если API-ключ не работает?",
        answer: "Обратитесь в техническую поддержку и опишите проблему максимально подробно. Полезно сразу приложить: <br><br> • ваш partner ID/название компании; <br> • пример запроса (метод, заголовки, тело) и ответа сервера; <br> • скриншоты/логи."
    },
    {
        question: "В какое время работает поддержка?",
        answer: "С понедельника по пятницу: 09:00–18:00. <br>В субботу: 09:00–13:00."
    },
    {
        question: "Что делать, если у клиента проблема с покупкой?",
        answer: "Соберите максимум деталей и обратитесь в поддержку. Пожалуйста, укажите: <br><br> • ID транзакции <br> • дату и время операции; <br> • товар/категорию и сумму; <br> • краткое описание проблемы клиента и его контакт (если допустимо)."
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
            <div className="page-head trans-head" style={{ justifyContent: "center", flexDirection: "column" }}>
                <center>
                    <h1>Нужна помощь?</h1>
                </center>
                <center>
                    <span className='help-desc'>Проверьте ответы ниже или напишите нам — мы рядом.</span>
                </center>
            </div>

            <div className="faqs">
                <div className="faq-flex">
                    <b>Контакты:</b>
                    <div className="f-flex-block">
                        <span>Email: roycharyyew@gmail.com</span>
                        <span>Telegram: @Huwejqwo</span>
                        <span>Поддержка: +99365 45 87 89</span>
                    </div>
                </div>


                <div className="faq">
                    <p style={{ fontSize: 18, fontWeight: "bold", marginBottom: 31 }}>FAQ</p>
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
                                <span className="quest-answer" dangerouslySetInnerHTML={{ __html: item.answer }}></span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Help;