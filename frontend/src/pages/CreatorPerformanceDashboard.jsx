// src/pages/CreatorPerformanceDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getCreatorPerformance } from "../services/creatorPerformanceService";

// If your installed chart library is Recharts:
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

// --- minimal role check (adjust to your auth storage) ---
function getCurrentUserRole() {
  try {
    // common patterns: localStorage user or auth object
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?.role || user?.user?.role || null;
  } catch {
    return null;
  }
}

function formatISO(d) {
  return d.toISOString().slice(0, 10);
}

export default function CreatorPerformanceDashboard() {
  // UI filters (defines backend query params)
  const [from, setFrom] = useState("2026-02-01");
  const [to, setTo] = useState("2026-02-04");
  const [bucket, setBucket] = useState("daily");
  const [creatorId, setCreatorId] = useState(""); // optional

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const role = getCurrentUserRole();

  const isAllowed = role === "MDH_MANAGER" || role === "MDH Manager"; // keep both until backend finalizes

  useEffect(() => {
    if (!isAllowed) return;

    let alive = true;
    setLoading(true);
    setError("");

    getCreatorPerformance({ from, to, bucket, creatorId: creatorId || null })
      .then((res) => {
        if (!alive) return;
        setData(res);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e?.message || "Failed to load dashboard data");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [from, to, bucket, creatorId, isAllowed]);

  // Build platform multi-series dataset: [{date, instagram: 11, youtube: 16}, ...] using cumulative
  const platformChartData = useMemo(() => {
    if (!data?.platforms?.length) return [];

    const map = new Map(); // date -> {date, [platform]: cumulative}

    for (const p of data.platforms) {
      for (const point of p.series) {
        const row = map.get(point.date) || { date: point.date };
        row[p.platform] = point.cumulative;
        map.set(point.date, row);
      }
    }

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  const platformKeys = useMemo(() => {
    return (data?.platforms || []).map((p) => p.platform);
  }, [data]);

  if (!isAllowed) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Not authorized</h2>
        <p>This dashboard is only for MDH Manager role.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Creator Performance Summary</h2>
      <p style={{ marginTop: 4, opacity: 0.8 }}>
        Clicks, Leads, and Platforms (cumulative time series)
      </p>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "16px 0" }}>
        <div>
          <label>From</label>
          <br />
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>

        <div>
          <label>To</label>
          <br />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>

        <div>
          <label>Bucket</label>
          <br />
          <select value={bucket} onChange={(e) => setBucket(e.target.value)}>
            <option value="daily">daily</option>
            <option value="weekly">weekly</option>
            <option value="monthly">monthly</option>
          </select>
        </div>

        <div>
          <label>Creator ID (optional)</label>
          <br />
          <input
            placeholder="e.g. creator_123"
            value={creatorId}
            onChange={(e) => setCreatorId(e.target.value)}
          />
        </div>

        <div style={{ marginLeft: "auto" }}>
          <button
            onClick={() => {
              // quick preset example: last 7 days from today
              const end = new Date();
              const start = new Date();
              start.setDate(end.getDate() - 6);
              setFrom(formatISO(start));
              setTo(formatISO(end));
              setBucket("daily");
            }}
          >
            Last 7 days
          </button>
        </div>
      </div>

      {/* State */}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {!loading && !error && data && data.clicks?.length === 0 && <p>No data for selected range.</p>}

      {/* Charts */}
      {!loading && !error && data && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18 }}>
          {/* Clicks */}
          <div style={{ border: "1px solid #333", borderRadius: 10, padding: 12 }}>
            <h3 style={{ margin: 0 }}>Clicks (Cumulative)</h3>
            <div style={{ height: 260, marginTop: 10 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.clicks}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cumulative" name="Cumulative Clicks" dot={false} />
                  <Line type="monotone" dataKey="count" name="Daily Clicks" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Leads */}
          <div style={{ border: "1px solid #333", borderRadius: 10, padding: 12 }}>
            <h3 style={{ margin: 0 }}>Leads (Cumulative)</h3>
            <div style={{ height: 260, marginTop: 10 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.leads}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cumulative" name="Cumulative Leads" dot={false} />
                  <Line type="monotone" dataKey="count" name="Daily Leads" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platforms */}
          <div style={{ border: "1px solid #333", borderRadius: 10, padding: 12 }}>
            <h3 style={{ margin: 0 }}>Platforms (Cumulative by Platform)</h3>
            <div style={{ height: 300, marginTop: 10 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={platformChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {platformKeys.map((k) => (
                    <Line key={k} type="monotone" dataKey={k} name={k} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}