import { useState } from 'react';

import Navbar from '../components/Navbar'
import BarChart from '../components/BarChart';

// CSS
import "../styles/Reports.css";

function Reports() {
    // Toggle this to test states
    const [hasTransactions] = useState(true);

    // Full transactions list (sampled from your markup)
    const transactions = [
        { date: "Игры", time: "58451ТМТ", txId: "58451ТМТ", orderId: "58451шт" },
        { date: "Игры", time: "58451ТМТ", txId: "58451ТМТ", orderId: "58451шт" },
        { date: "Игры", time: "58451ТМТ", txId: "58451ТМТ", orderId: "58451шт" },
        { date: "Игры", time: "58451ТМТ", txId: "58451ТМТ", orderId: "58451шт" },
        { date: "Игры", time: "58451ТМТ", txId: "58451ТМТ", orderId: "58451шт" },
        { date: "Игры", time: "58451ТМТ", txId: "58451ТМТ", orderId: "58451шт" },
        { date: "Игры", time: "58451ТМТ", txId: "58451ТМТ", orderId: "58451шт" },
        { date: "Игры", time: "58451ТМТ", txId: "58451ТМТ", orderId: "58451шт" },
        { date: "Игры", time: "58451ТМТ", txId: "58451ТМТ", orderId: "58451шт" },
        { date: "Игры", time: "58451ТМТ", txId: "58451ТМТ", orderId: "58451шт" },
        { date: "Игры", time: "58451ТМТ", txId: "58451ТМТ", orderId: "58451шт" },
        { date: "Игры", time: "58451ТМТ", txId: "58451ТМТ", orderId: "58451шт" },
        { date: "Игры", time: "58451ТМТ", txId: "58451ТМТ", orderId: "58451шт" },
        { date: "Игры", time: "58451ТМТ", txId: "58451ТМТ", orderId: "58451шт" },
        { date: "Игры", time: "58451ТМТ", txId: "58451ТМТ", orderId: "58451шт" },
        { date: "Игры", time: "58451ТМТ", txId: "58451ТМТ", orderId: "58451шт" },
        { date: "Игры", time: "58451ТМТ", txId: "58451ТМТ", orderId: "58451шт" },
        { date: "Игры", time: "58451ТМТ", txId: "58451ТМТ", orderId: "58451шт" },
        { date: "Игры", time: "58451ТМТ", txId: "58451ТМТ", orderId: "58451шт" },
        { date: "Игры", time: "58451ТМТ", txId: "58451ТМТ", orderId: "58451шт" },
        { date: "Игры", time: "58451ТМТ", txId: "58451ТМТ", orderId: "58451шт" },
        { date: "Игры", time: "58451ТМТ", txId: "58451ТМТ", orderId: "58451шт" },
        { date: "Игры", time: "58451ТМТ", txId: "58451ТМТ", orderId: "58451шт" },
        { date: "Игры", time: "58451ТМТ", txId: "58451ТМТ", orderId: "58451шт" },
    ];

    const initialPeriod = 'День';
    const [period, setPeriod] = useState(initialPeriod);
    const [openDay, setOpenDay] = useState(false);
    const periods = ['День', 'Неделя', 'Месяц', 'Год'];


    // Example generator — replace with real data when you have it.
    const getChartDataByPeriod = (p) => {
        switch (p) {
            case "День": {
                // 8 time buckets across the day
                const labels = ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00"];
                const values = [5, 9, 12, 18, 24, 20, 16, 8];
                return { labels, values, title: "Оборот за день" };
            }
            case "Месяц": {
                // 4 weeks of the current month
                const labels = ["Нед. 1", "Нед. 2", "Нед. 3", "Нед. 4"];
                const values = [110, 140, 95, 160];
                return { labels, values, title: "Оборот за месяц" };
            }
            case "Год": {
                // 12 months
                const labels = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
                const values = [300, 280, 360, 420, 500, 480, 510, 530, 490, 550, 600, 620];
                return { labels, values, title: "Оборот за год" };
            }
            case "Всё":
            default: {
                // Year-over-year
                const labels = ["2021", "2022", "2023", "2024", "2025"];
                const values = [2500, 3100, 4000, 5200, 6100];
                return { labels, values, title: "Оборот за всё время" };
            }
        }
    };

    const { labels, values, title } = getChartDataByPeriod(period);

    return (
        <div className='Home'>
            <Navbar />
            <div className="page-head trans-head">
                <h1>Отчёты</h1>
                <form>
                    <button className="filter-btn blue-nav" type="button">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.8334 2.5H6.16675C5.06218 2.5 4.16675 3.39543 4.16675 4.5V15.5C4.16675 16.6046 5.06218 17.5 6.16675 17.5H13.8334C14.938 17.5 15.8334 16.6046 15.8334 15.5V7.5M10.8334 2.5L15.8334 7.5M10.8334 2.5V6.5C10.8334 7.05228 11.2811 7.5 11.8334 7.5H15.8334M10.0001 10.8333V14.1667M11.6667 12.5H8.33341" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Экспорт CSV</span>
                    </button>

                    <button className="filter-btn" type="button">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.8334 2.5H6.16675C5.06218 2.5 4.16675 3.39543 4.16675 4.5V15.5C4.16675 16.6046 5.06218 17.5 6.16675 17.5H13.8334C14.938 17.5 15.8334 16.6046 15.8334 15.5V7.5M10.8334 2.5L15.8334 7.5M10.8334 2.5V6.5C10.8334 7.05228 11.2811 7.5 11.8334 7.5H15.8334M10.0001 10.8333V14.1667M11.6667 12.5H8.33341" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Экспорт CSV</span>
                    </button>

                    <button className="filter-btn" type="button">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.8334 2.5H6.16675C5.06218 2.5 4.16675 3.39543 4.16675 4.5V15.5C4.16675 16.6046 5.06218 17.5 6.16675 17.5H13.8334C14.938 17.5 15.8334 16.6046 15.8334 15.5V7.5M10.8334 2.5L15.8334 7.5M10.8334 2.5V6.5C10.8334 7.05228 11.2811 7.5 11.8334 7.5H15.8334M10.0001 10.8333V14.1667M11.6667 12.5H8.33341" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Экспорт XLS</span>
                    </button>

                    <div className='nav-filter'>
                        <button
                            type='button'
                            onClick={() => { setOpenDay(v => !v); setOpenCat(false); setOpenPay(false); }}
                            aria-expanded={openDay}
                            role="button"
                            tabIndex={0}
                        >
                            <p>{period}</p>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.29289 12.2929L5.70711 8.70711C5.07714 8.07714 5.52331 7 6.41421 7H13.5858C14.4767 7 14.9229 8.07714 14.2929 8.70711L10.7071 12.2929C10.3166 12.6834 9.68342 12.6834 9.29289 12.2929Z" fill="black" />
                            </svg>
                        </button>

                        {openDay && (
                            <div className="drop-options days">
                                {periods.map(opt => (
                                    <p
                                        key={opt}
                                        className={opt === period ? 'opt-active' : ''}
                                        onClick={() => { setPeriod(opt); setOpenDay(false); }}
                                    >
                                        {opt}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                </form>
            </div>

            <div className="chart-grid reports-grid">
                <div className="transactions-container">
                    <table>
                        <div>
                            <p className="tb-head">Итоги за период</p>

                            <tr className='row-titles row-reports' style={{ marginBottom: 16, marginTop: 14 }}>
                                <p>Категория</p>
                                <p>Оборот</p>
                                <p>Вознаграждение</p>
                                <p>Транзакции</p>
                            </tr>

                            <div className="reports-auto">
                                {hasTransactions ? (
                                    transactions.map((tx, i) => {
                                        return (
                                            <tr key={i} className='row-titles row-data'>
                                                <p>{tx.date}</p>
                                                <p>{tx.time}</p>
                                                <p>{tx.txId}</p>
                                                <p>{tx.orderId}</p>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    // Keep it a row so the table never collapses
                                    <div className="no-data">
                                        <p>У вас пока нет транзакций</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </table>
                </div>
                <div className='chart-block'>
                    <p className='chart-head'>График</p>
                    <BarChart labels={labels} dataValues={values} />
                </div>
            </div>
        </div>
    )
}

export default Reports