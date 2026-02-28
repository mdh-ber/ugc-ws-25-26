import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const Rewards = () => {
  const [rewards, setRewards] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const res = await api.get("/rewards");
        setRewards(res.data);
      } catch (e) {
        setError(e?.message || "Request failed");
      } finally {
        setLoading(false);
      }
    };
    fetchRewards();
  }, []);

  const totalPoints = rewards?.totalPoints ?? 0;
  const conversionRate = rewards?.conversionRate ?? 0.5;

  const moneyValue = useMemo(() => {
    return Number((totalPoints * conversionRate).toFixed(2));
  }, [totalPoints, conversionRate]);

  const breakdown = rewards?.breakdown || [];

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>Rewards Earned</h2>

      {loading && <p>Loading rewards...</p>}
      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

      {/* TOTAL POINTS CARD */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          marginBottom: "20px",
        }}
      >
        <h3>Total Points</h3>
        <h1 style={{ color: "#2563eb" }}>{totalPoints}</h1>
        <p>Equivalent Value: €{moneyValue}</p>

        <button
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Redeem Now
        </button>
      </div>

      {/* BREAKDOWN CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        {breakdown.map((item, index) => (
          <div
            key={index}
            style={{
              background: "#fff",
              padding: "15px",
              borderRadius: "8px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            }}
          >
            <h4>{item.title}</h4>
            <p>{item.points} Points</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rewards;
