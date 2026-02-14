import { useEffect, useState } from "react";
import axios from "axios";

export default function UuOverview() {
  const [activeTab, setActiveTab] = useState("referral"); // default tab
  const [series, setSeries] = useState([]);

  useEffect(() => {
    const url =
      activeTab === "referral"
        ? "http://localhost:5001/api/uu/referral/overview"
        : "http://localhost:5001/api/uu/referee/overview";

    axios
      .get(url)
      .then((res) => {
        // your backend returns { series: [...] }
        setSeries(res.data.series || []);
      })
      .catch((err) => console.error("API error", err));
  }, [activeTab]);

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: "600", marginBottom: 12 }}>
        UU Overview
      </h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab("referral")}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #ccc",
            background: activeTab === "referral" ? "#2563eb" : "white",
            color: activeTab === "referral" ? "white" : "black",
            cursor: "pointer",
          }}
        >
          Referral
        </button>

        <button
          onClick={() => setActiveTab("referee")}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #ccc",
            background: activeTab === "referee" ? "#2563eb" : "white",
            color: activeTab === "referee" ? "white" : "black",
            cursor: "pointer",
          }}
        >
          Referee
        </button>
      </div>

      {/* Data */}
      {series.length === 0 ? (
        <p>No data yet...</p>
      ) : (
        series.map((item, index) => (
          <p key={index}>
            {item.date} : {item.uu}
          </p>
        ))
      )}
    </div>
  );
}