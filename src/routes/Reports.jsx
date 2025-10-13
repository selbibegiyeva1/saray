import Navbar from '../components/Navbar';
import { useState } from 'react';

import WithdrawnReport from "../components/WithdrawnReport";
import EarnedReport from "../components/EarnedReport";
import AvailableReport from "../components/AvailableReport";

// CSS
import "../styles/Reports.css";

function Reports() {
    const [activeButton, setActiveButton] = useState("withdrawn");

    const renderReport = () => {
        switch (activeButton) {
            case "earned":
                return <EarnedReport />;
            case "available":
                return <AvailableReport />;
            default:
                return <WithdrawnReport />;
        }
    };

    return (
        <div className='Home'>
            <Navbar />
            <div className="page-head trans-head">
                <h1>Отчёты</h1>
                {activeButton !== "available" && (
                    <form>
                        <button className="filter-btn blue-nav" type="button">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.8327 2.5H6.16602C5.06145 2.5 4.16602 3.39543 4.16602 4.5V8.33333M10.8327 2.5L15.8327 7.5M10.8327 2.5V6.5C10.8327 7.05228 11.2804 7.5 11.8327 7.5H15.8327M15.8327 7.5V15.5C15.8327 16.6046 14.9373 17.5 13.8327 17.5H8.33268C6.49173 17.5 4.99935 16.0076 4.99935 14.1667C4.99935 12.3257 6.49173 10.8333 8.33268 10.8333H10.8327M10.8327 10.8333L8.33268 8.33333M10.8327 10.8333L8.33268 13.3333" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <span>Экспорт за период</span>
                        </button>

                        <button className="filter-btn" type="button">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.8327 2.5H6.16602C5.06145 2.5 4.16602 3.39543 4.16602 4.5V15.5C4.16602 16.6046 5.06145 17.5 6.16602 17.5H13.8327C14.9373 17.5 15.8327 16.6046 15.8327 15.5V7.5M10.8327 2.5L15.8327 7.5M10.8327 2.5V6.5C10.8327 7.05228 11.2804 7.5 11.8327 7.5H15.8327M9.99935 10.8333V14.1667M11.666 12.5H8.33268" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <span>Экспорт CSV</span>
                        </button>

                        <button className="filter-btn" type="button">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.8327 2.5H6.16602C5.06145 2.5 4.16602 3.39543 4.16602 4.5V8.33333M10.8327 2.5L15.8327 7.5M10.8327 2.5V6.5C10.8327 7.05228 11.2804 7.5 11.8327 7.5H15.8327M15.8327 7.5V15.5C15.8327 16.6046 14.9373 17.5 13.8327 17.5H8.33268C6.49173 17.5 4.99935 16.0076 4.99935 14.1667C4.99935 12.3257 6.49173 10.8333 8.33268 10.8333H10.8327M10.8327 10.8333L8.33268 8.33333M10.8327 10.8333L8.33268 13.3333" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <span>Экспорт XLS</span>
                        </button>
                    </form>
                )}
            </div>


            <div className="report-links">
                <button
                    className={activeButton === "withdrawn" ? "report-btn active" : "report-btn"}
                    onClick={() => setActiveButton("withdrawn")}
                >
                    Выведено
                </button>
                <button
                    className={activeButton === "earned" ? "report-btn active" : "report-btn"}
                    onClick={() => setActiveButton("earned")}
                >
                    Всего заработано
                </button>
                <button
                    className={activeButton === "available" ? "report-btn active" : "report-btn"}
                    onClick={() => setActiveButton("available")}
                >
                    Доступно к выводу
                </button>
            </div>

            <div className="report-display">
                {renderReport()}
            </div>
        </div>
    )
}

export default Reports