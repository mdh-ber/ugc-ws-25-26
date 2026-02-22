import ClicksPerCreatorCard from "../components/ClicksPerCreatorCard";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function UuOverview() {
  const [activeTab, setActiveTab] = useState("referral");
  const [series, setSeries] = useState([]);
  const [range, setRange] = useState("7");

  useEffect(() => {
    const url =
      activeTab === "referral"
        ? "http://localhost:5000/api/uu/referral/overview"
        : "http://localhost:5000/api/uu/referee/overview";

    axios
      .get(url, { params: { days: range } })
      .then((res) => setSeries(res.data.series || []))
      .catch((err) => console.error(err));
  }, [activeTab, range]);

  const metrics = useMemo(() => {
    if (!series.length) return { total: 0, avg: 0 };

    const total = series.reduce((sum, item) => sum + item.uu, 0);
    const avg = (total / series.length).toFixed(1);

    return { total, avg };
  }, [series]);

  return (
    <div className="bg-white shadow-lg rounded-xl p-4 w-full max-w-3xl mx-auto mt-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Unique Users Overview
        </h2>

        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="border text-sm rounded-md px-2 py-1 bg-gray-50"
        >
          <option value="7">7d</option>
          <option value="30">30d</option>
          <option value="90">90d</option>
        </select>
      </div>

      {/* KPI Mini Cards */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="bg-gray-50 px-3 py-2 rounded-lg">
          <p className="text-gray-500">Total Unique Users</p>
          <p className="font-semibold">{metrics.total}</p>
        </div>

        <div className="bg-gray-50 px-3 py-2 rounded-lg">
          <p className="text-gray-500">Avg Unique Users / Day</p>
          <p className="font-semibold">{metrics.avg}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {["referral", "referee"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 text-sm rounded-md transition ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-gray-50 rounded-lg p-2">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip
              formatter={(value) => [`${value}`, "Unique Users"]}
            />
            <Line
              type="monotone"
              dataKey="uu"
              name="Unique Users"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
