import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const Rewards = () => {
  const [rewards, setRewards] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const res = await axios.get("/api/rewards/summary/123"); 
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

  const breakdown = [
    { title: "Trainings", points: 400 },
    { title: "Reviews", points: 250 },
    { title: "Events", points: 300 },
    { title: "Referrals", points: 300 },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Rewards Earned</h2>

      {loading && <p>Loading rewards...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ background: "#fff", padding: 20, borderRadius: 10 }}>
        <h3>Total Points</h3>
        <h1>{totalPoints}</h1>
        <p>Equivalent Value: €{moneyValue}</p>
      </div>

      <div style={{ display: "grid", gap: 15, marginTop: 20 }}>
        {breakdown.map((item, i) => (
          <div key={i} style={{ background: "#fff", padding: 15 }}>
            <h4>{item.title}</h4>
            <p>{item.points} Points</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rewards;