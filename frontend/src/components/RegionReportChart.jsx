import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale);

const RegionReportChart = () => {
  const data = {
    labels: ["Bhubaneshwar", "Mumbai", "Delhi", "Chennai", "Kolkata"],
    datasets: [
      {
        label: "Disaster Reports",
        data: [12, 8, 15, 5, 9], // 🔧 Hardcoded counts
        backgroundColor: "#3b82f6",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="card border-border/70 p-6">
      <h3 className="mb-4 text-xl font-semibold text-foreground">
        Reports by Region
      </h3>
      <Bar data={data} options={options} />
    </div>
  );
};

export default RegionReportChart;
