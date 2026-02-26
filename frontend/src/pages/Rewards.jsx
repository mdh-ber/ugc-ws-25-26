import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const DEFAULT_CATEGORIES = ["Trainings", "Reviews", "Events", "Referrals"];

const Rewards = () => {
  const [rewards, setRewards] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get("/api/rewards");
        setRewards(res.data);
      } catch (e) {
        setError(e?.response?.data?.message || e?.message || "Request failed");
      } finally {
        setLoading(false);
      }
    };
    fetchRewards();
  }, []);

  const totalPoints = typeof rewards?.totalPoints === "number" ? rewards.totalPoints : 0;

  const conversionRate =
    typeof rewards?.conversionRate === "number" ? rewards.conversionRate : null;

  const moneyValueFromBackend =
    typeof rewards?.moneyValue === "number" ? rewards.moneyValue : null;

  const moneyValue = useMemo(() => {
    if (moneyValueFromBackend !== null) return Number(moneyValueFromBackend.toFixed(2));
    if (conversionRate !== null) return Number((totalPoints * conversionRate).toFixed(2));
    return 0;
  }, [moneyValueFromBackend, conversionRate, totalPoints]);

  const breakdownMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(rewards?.breakdown)) {
      rewards.breakdown.forEach((item) => {
        const title = String(item?.title || "").trim();
        const points = typeof item?.points === "number" ? item.points : 0;
        if (title) map.set(title.toLowerCase(), { title, points, id: item?.id });
      });
    }
    return map;
  }, [rewards]);

  const breakdownCards = useMemo(() => {
    return DEFAULT_CATEGORIES.map((title) => {
      const found = breakdownMap.get(title.toLowerCase());
      return {
        id: found?.id || title.toLowerCase(),
        title,
        points: found?.points ?? 0,
      };
    });
  }, [breakdownMap]);

  const canRedeem = Boolean(rewards?.canRedeem);

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>Rewards Earned</h2>

      {loading && <p>Loading rewards...</p>}
      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

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
          disabled={!canRedeem}
          onClick={() => {
            if (rewards?.redeemUrl) window.location.href = rewards.redeemUrl;
          }}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            background: canRedeem ? "#2563eb" : "#9ca3af",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: canRedeem ? "pointer" : "not-allowed",
          }}
        >
          Redeem Now
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        {breakdownCards.map((item) => (
          <div
            key={item.id}
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