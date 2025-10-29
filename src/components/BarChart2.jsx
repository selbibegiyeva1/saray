// src/components/RevenueChart.jsx
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

const BarChart2 = ({ labels, dataValues, currency = "TMT" }) => {
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
            legend: { display: false },
            tooltip: {
                enabled: false,
                external: (context) => {
                    let el = document.getElementById("chartjs-tooltip");
                    if (!el) {
                        el = document.createElement("div");
                        el.id = "chartjs-tooltip";
                        el.innerHTML = "<div></div>";
                        document.body.appendChild(el);
                    }

                    const model = context.tooltip;
                    if (model.opacity === 0) {
                        el.style.opacity = 0;
                        return;
                    }

                    const label = model.dataPoints[0].label;
                    const rawVal = model.dataPoints[0].raw ?? 0;
                    const formatted = Number(rawVal).toLocaleString("ru-RU", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    });

                    el.innerHTML = `
            <div>
              <div id="tool-cont">
                <span id="t-span1">${label}</span><br/>
                <div id="t-flex">
                  <span id="t-span2">${formatted} ${currency}</span>
                  <span id="t-span3"></span>
                </div>
              </div>
            </div>
          `;

                    const pos = context.chart.canvas.getBoundingClientRect();
                    el.style.opacity = 1;
                    el.style.position = "absolute";
                    el.style.left = pos.left + window.pageXOffset + model.caretX + "px";
                    el.style.top = pos.top + window.pageYOffset + model.caretY + "px";
                    el.style.pointerEvents = "none";
                    el.style.transition = "all 0.1s ease";
                },
            },
        },
        scales: { y: { beginAtZero: true } },
    };

    return (
        <div className="chart-container">
            <Bar data={data} options={options} />
        </div>
    );
};

export default BarChart2;