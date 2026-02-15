import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { fetchChartData } from "../services/clicksService";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const ClicksChart = ({ platform, startDate, endDate }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (!platform) return;

    const loadData = async () => {
      const data = await fetchChartData(platform, startDate, endDate);

      setChartData({
        labels: data.labels,
        datasets: [
          {
            label: "Clicks",
            data: data.values,
            borderColor: "#4F46E5",
            backgroundColor: "rgba(79,70,229,0.2)",
            tension: 0.4,
          },
        ],
      });
    };

    loadData();
  }, [platform, startDate, endDate]);

  if (!chartData) return <p>Loading chart...</p>;

  return (
    <div style={{ width: "600px", margin: "auto" }}>
      <Line data={chartData} />
    </div>
  );
};

export default ClicksChart;