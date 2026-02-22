import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const Rewards = () => {
  const [rewards, setRewards] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const res = await axios.get("/api/rewards");
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

  const breakdown =
    rewards?.breakdown ?? [
      { title: "Trainings", points: 400 },
      { title: "Reviews", points: 250 },
      { title: "Events", points: 300 },
      { title: "Referrals", points: 300 },
    ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Rewards Earned</h2>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h3>Total Points: {totalPoints}</h3>
      <p>Value: €{moneyValue}</p>

      <div>
        {breakdown.map((b, i) => (
          <div key={i}>{b.title}: {b.points}</div>
        ))}
      </div>
    </div>
  );
};

export default Rewards;