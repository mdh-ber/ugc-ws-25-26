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
 
  const totalPoints = Array.isArray(rewards)
  ? rewards.reduce((sum, r) => sum + (r.pointsRequired || 0), 0)
  : 0;

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
 
  const history =
    rewards?.history ?? [
      { date: "12 Feb 2026", activity: "Training Completion", points: +200, status: "Credited" },
      { date: "10 Feb 2026", activity: "Event Participation", points: +150, status: "Credited" },
      { date: "5 Feb 2026", activity: "Redeemed", points: -300, status: "Transferred" },
    ];
 
  return (
<div style={{ padding: "20px" }}>
<h2 style={{ marginBottom: "20px" }}>Rewards Earned</h2>
 
      {loading && <p>Loading rewards...</p>}
      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

      {Array.isArray(rewards) && rewards.length > 0 && (
  <div style={{ marginBottom: "20px" }}>
    {rewards.map(r => (
      <div key={r._id}>
        {r.title} — {r.pointsRequired} pts
      </div>
    ))}
  </div>
)}
 
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
 
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
>
<h3>Transaction History</h3>
<table width="100%" style={{ marginTop: "10px" }}>
<thead>
<tr>
<th align="left">Date</th>
<th align="left">Activity</th>
<th align="left">Points</th>
<th align="left">Status</th>
</tr>
</thead>
<tbody>
            {history.map((row, idx) => (
<tr key={idx}>
<td>{row.date}</td>
<td>{row.activity}</td>
<td>{row.points > 0 ? `+${row.points}` : row.points}</td>
<td>{row.status}</td>
</tr>
            ))}
</tbody>
</table>
</div>
</div>
  );
};
 
export default Rewards;