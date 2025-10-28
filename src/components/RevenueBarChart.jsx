// src/components/RevenueBarChart.jsx
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

const RevenueBarChart = ({ labels, dataValues, unit = "TMT" }) => {
    const data = {
        labels,
        datasets: [
            {
                data: dataValues,
                backgroundColor: "#2D85EA",
                borderColor: "#2D85EA",
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
                enabled: false,
                external: function (context) {
                    let tooltipEl = document.getElementById("chartjs-tooltip-revenue");
                    if (!tooltipEl) {
                        tooltipEl = document.createElement("div");
                        tooltipEl.id = "chartjs-tooltip-revenue";
                        tooltipEl.innerHTML = "<div></div>";
                        document.body.appendChild(tooltipEl);
                    }

                    const model = context.tooltip;
                    if (model.opacity === 0) {
                        tooltipEl.style.opacity = 0;
                        return;
                    }

                    const label = model.dataPoints[0].label;
                    const value = model.dataPoints[0].formattedValue;

                    tooltipEl.innerHTML = `
            <div>
              <div id="tool-cont">
                <span id="t-span1">${label}</span><br/>
                <div id="t-flex">
                  <span id="t-span2">${value}${unit ? " " + unit : ""}</span>
                </div>
              </div>
            </div>
          `;

                    const position = context.chart.canvas.getBoundingClientRect();
                    tooltipEl.style.opacity = 1;
                    tooltipEl.style.position = "absolute";
                    tooltipEl.style.left = position.left + window.pageXOffset + model.caretX + "px";
                    tooltipEl.style.top = position.top + window.pageYOffset + model.caretY + "px";
                    tooltipEl.style.pointerEvents = "none";
                    tooltipEl.style.transition = "all 0.1s ease";
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

export default RevenueBarChart;