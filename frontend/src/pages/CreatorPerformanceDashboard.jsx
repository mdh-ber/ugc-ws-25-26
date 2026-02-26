// src/pages/CreatorPerformanceDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
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
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
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

function isValidDateRange(from, to) {
  if (!from || !to) return false;
  return new Date(from).getTime() <= new Date(to).getTime();
}

// Ensure time series has cumulative values even if backend only provides count.
function ensureCumulative(series = []) {
  let run = 0;
  return (series || []).map((p) => {
    const count = Number(p?.count || 0);
    const hasCum =
      p?.cumulative !== undefined &&
      p?.cumulative !== null &&
      Number.isFinite(Number(p.cumulative));

    run = hasCum ? Number(p.cumulative) : run + count;

    return { date: p?.date, count, cumulative: run };
  });
}

// Build a complete date list from clicks/leads/platform series dates.
function buildAllDates(data) {
  const dates = new Set();

  (data?.clicks || []).forEach((p) => p?.date && dates.add(p.date));
  (data?.leads || []).forEach((p) => p?.date && dates.add(p.date));

  (data?.platforms || []).forEach((pl) => {
    (pl?.series || []).forEach((p) => p?.date && dates.add(p.date));
  });

  return Array.from(dates).sort((a, b) => a.localeCompare(b));
}

// Carry-forward cumulative values per platform across missing dates.
function buildPlatformCarryForward(data) {
  const platforms = (data?.platforms || [])
    .map((p) => p.platform)
    .filter(Boolean);

  if (!platforms.length) return { rows: [], keys: [] };

  const allDates = buildAllDates(data);
  if (!allDates.length) return { rows: [], keys: platforms };

  const perPlatform = new Map();

  for (const p of data.platforms) {
    const series = ensureCumulative(p.series || []);
    const m = new Map();
    for (const point of series) {
      if (point?.date) m.set(point.date, point.cumulative);
    }
    perPlatform.set(p.platform, m);
  }

  const lastSeen = Object.fromEntries(platforms.map((k) => [k, 0]));

  const rows = allDates.map((date) => {
    const row = { date };
    for (const k of platforms) {
      const m = perPlatform.get(k);
      const val = m?.has(date) ? Number(m.get(date) || 0) : lastSeen[k];
      lastSeen[k] = val;
      row[k] = val;
    }
    return row;
  });

  return { rows, keys: platforms };
}

export default function CreatorPerformanceDashboard() {
  const location = useLocation();

  // UI filters (defines backend query params)
  const today = new Date();
  const startDefault = new Date();
  startDefault.setDate(today.getDate() - 6);

  const [from, setFrom] = useState(formatISO(startDefault));
  const [to, setTo] = useState(formatISO(today));
  const [bucket, setBucket] = useState("daily");
  const [creatorId, setCreatorId] = useState(""); // optional

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  // ✅ Accept either role-based OR URL mode-based manager access
  const params = new URLSearchParams(location.search);
  const isManagerMode = params.get("mode") === "manager";

  const role = getCurrentUserRole();
  const normalizedRole = (role || "").toUpperCase().replace(/\s+/g, "_");
  const isAllowed = isManagerMode || normalizedRole === "MDH_MANAGER";

  useEffect(() => {
    if (!isAllowed) return;

    if (!isValidDateRange(from, to)) {
      setError("Invalid date range: 'From' must be earlier than or equal to 'To'.");
      setData(null);
      return;
    }

    let alive = true;
    setLoading(true);
    setError("");

    getCreatorPerformance({ from, to, bucket, creatorId: creatorId || null })
      .then((res) => {
        if (!alive) return;

        const clicks = ensureCumulative(res?.clicks || []);
        const leads = ensureCumulative(res?.leads || []);
        const platforms = (res?.platforms || []).map((p) => ({
          platform: p.platform,
          series: ensureCumulative(p.series || []),
        }));

        setData({ ...res, clicks, leads, platforms });
      })
      .catch((e) => {
        if (!alive) return;
        setError(e?.message || "Failed to load dashboard data");
        setData(null);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [from, to, bucket, creatorId, isAllowed]);

  const { rows: platformChartData, keys: platformKeys } = useMemo(() => {
    if (!data) return { rows: [], keys: [] };
    return buildPlatformCarryForward(data);
  }, [data]);

  if (!isAllowed) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Not authorized</h2>
        <p>This dashboard is only for MDH Manager role.</p>
        <p style={{ opacity: 0.7, marginTop: 6 }}>
          Tip: open with <code>?mode=manager</code> or login as <code>MDH_MANAGER</code>.
        </p>
      </div>
    );
  }

  const hasAnyData =
    (data?.clicks?.length || 0) > 0 ||
    (data?.leads?.length || 0) > 0 ||
    (data?.platforms?.length || 0) > 0;

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
      {!loading && !error && data && !hasAnyData && <p>No data for selected range.</p>}

      {/* Charts */}
      {!loading && !error && data && hasAnyData && (
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
                  <Line type="monotone" dataKey="count" name="Clicks" dot={false} />
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
                  <Line type="monotone" dataKey="count" name="Leads" dot={false} />
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