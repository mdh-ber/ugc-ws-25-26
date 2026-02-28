<<<<<<< HEAD
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
=======
import React from "react";

const Rewards = () => {
  const totalPoints = 1250;
  const moneyValue = totalPoints * 0.5; // example conversion
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>Rewards Earned</h2>

<<<<<<< HEAD
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
=======
      {/* Total Points Card */}
      <div style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: "20px"
      }}>
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
        <h3>Total Points</h3>
        <h1 style={{ color: "#2563eb" }}>{totalPoints}</h1>
        <p>Equivalent Value: €{moneyValue}</p>

<<<<<<< HEAD
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
=======
        <button style={{
          marginTop: "10px",
          padding: "10px 20px",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}>
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
          Redeem Now
        </button>
      </div>

<<<<<<< HEAD
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
=======
      {/* Breakdown Section */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "15px",
        marginBottom: "20px"
      }}>
        {[
          { title: "Trainings", points: 400 },
          { title: "Reviews", points: 250 },
          { title: "Events", points: 300 },
          { title: "Referrals", points: 300 }
        ].map((item, index) => (
          <div key={index} style={{
            background: "#fff",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
          }}>
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
            <h4>{item.title}</h4>
            <p>{item.points} Points</p>
          </div>
        ))}
      </div>
<<<<<<< HEAD
=======

      {/* Transaction History */}
      <div style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
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
            <tr>
              <td>12 Feb 2026</td>
              <td>Training Completion</td>
              <td>+200</td>
              <td>Credited</td>
            </tr>
            <tr>
              <td>10 Feb 2026</td>
              <td>Event Participation</td>
              <td>+150</td>
              <td>Credited</td>
            </tr>
            <tr>
              <td>5 Feb 2026</td>
              <td>Redeemed</td>
              <td>-300</td>
              <td>Transferred</td>
            </tr>
          </tbody>
        </table>
      </div>
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
    </div>
  );
};

export default Rewards;
