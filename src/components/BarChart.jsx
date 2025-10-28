// src/components/BarChart.jsx
import React from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ labels, dataValues, unit = "" }) => {
    const data = {
        labels,
        datasets: [
            {
                data: dataValues,
                backgroundColor: "#1B646D",
                borderColor: "#1B646D",
                borderWidth: 0,
                borderRadius: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false, position: "top" },
            tooltip: {
                enabled: false, // turn off default tooltips
                external: function (context) {
                    // Tooltip element
                    let tooltipEl = document.getElementById("chartjs-tooltip");

                    // Create element on first render
                    if (!tooltipEl) {
                        tooltipEl = document.createElement("div");
                        tooltipEl.id = "chartjs-tooltip";
                        tooltipEl.innerHTML = "<div></div>";
                        document.body.appendChild(tooltipEl);
                    }

                    const tooltipModel = context.tooltip;

                    // Hide if no tooltip
                    if (tooltipModel.opacity === 0) {
                        tooltipEl.style.opacity = 0;
                        return;
                    }

                    // Set tooltip text
                    const label = tooltipModel.dataPoints[0].label;
                    const value = tooltipModel.dataPoints[0].formattedValue;

                    tooltipEl.innerHTML = `
                        <div>
                            <div id="tool-cont">
                                <span id="t-span1">${label}</span><br/>
                                <div id="t-flex">
                                    <span id="t-span2">${value}${unit ? " " + unit : ""}</span>
                                    <span id="t-span3">16.0%</span>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5.87504 14.1248L14.1246 5.87521M14.1246 12.9463L14.1246 5.87521L7.05355 5.87521" stroke="#05A360" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    `;

                    // Position tooltip
                    const position = context.chart.canvas.getBoundingClientRect();
                    tooltipEl.style.opacity = 1;
                    tooltipEl.style.position = "absolute";
                    tooltipEl.style.left =
                        position.left + window.pageXOffset + tooltipModel.caretX + "px";
                    tooltipEl.style.top =
                        position.top + window.pageYOffset + tooltipModel.caretY + "px";
                    tooltipEl.style.pointerEvents = "none";
                    tooltipEl.style.transition = "all 0.1s ease";
                },
            },
        },
        scales: {
            y: { beginAtZero: true },
        },
    };

    return (
        <div className="chart-container">
            <Bar data={data} options={options} />
        </div>
    );
};

export default BarChart;