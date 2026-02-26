// src/pages/CreatorPerformanceDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { getCreatorPerformance } from "../services/creatorPerformanceService";

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

// If backend already sends cumulative, we keep it.
// If backend sends only count, we compute cumulative.
function ensureCumulative(series = []) {
  let run = 0;
  return (series || []).map((p) => {
    const count = Number(p?.count || 0);
    const hasCum =
      p?.cumulative !== undefined &&
      p?.cumulative !== null &&
      Number.isFinite(Number(p.cumulative));
    run = hasCum ? Number(p.cumulative) : run + count;
    return { ...p, count, cumulative: run };
  });
}

// Creates a merged dataset for platform multi-lines using whatever keys exist.
// DOES NOT pad beyond last backend point. Missing platform points on a timestamp are left undefined.
function buildPlatformMergedRows(platforms = []) {
  const map = new Map(); // timeKey -> row

  for (const p of platforms) {
    const key = p.platform;
    const series = ensureCumulative(p.series || []);
    for (const pt of series) {
      const t = pt.date; // can be "YYYY-MM-DD" or hourly timestamp
      if (!t) continue;
      const row = map.get(t) || { date: t };
      row[key] = pt.cumulative;
      map.set(t, row);
    }
  }

  return Array.from(map.values()).sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

// For X-axis label formatting: if hourly, show HH:mm; else show YYYY-MM-DD.
function formatXAxisTick(value, bucketUsed) {
  if (!value) return "";
  if (bucketUsed === "hourly") {
    // try to extract HH:mm from ISO or "YYYY-MM-DD HH:00"
    const s = String(value);
    const isoTime = s.includes("T") ? s.split("T")[1] : s.includes(" ") ? s.split(" ")[1] : "";
    if (isoTime) return isoTime.slice(0, 5);
    return s.slice(-5);
  }
  return String(value).slice(0, 10);
}

export default function CreatorPerformanceDashboard() {
  const location = useLocation();

  // default: last 7 days
  const today = new Date();
  const startDefault = new Date();
  startDefault.setDate(today.getDate() - 6);

  const [from, setFrom] = useState(formatISO(startDefault));
  const [to, setTo] = useState(formatISO(today));
  const [creatorId, setCreatorId] = useState("");

  // NEW: platform filter
  const [selectedPlatforms, setSelectedPlatforms] = useState([]); // array of platform strings

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  // manager access
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

    // IMPORTANT: bucket="auto" -> backend decides hourly/daily/etc
    getCreatorPerformance({
      from,
      to,
      bucket: "auto",
      creatorId: creatorId || null,
      platforms: selectedPlatforms, // array
    })
      .then((res) => {
        if (!alive) return;

        const clicks = ensureCumulative(res?.clicks || []);
        const leads = ensureCumulative(res?.leads || []);
        const platforms = (res?.platforms || []).map((p) => ({
          platform: p.platform,
          series: ensureCumulative(p.series || []),
        }));

        setData({
          ...res,
          clicks,
          leads,
          platforms,
          availablePlatforms: res?.availablePlatforms || (res?.platforms || []).map((p) => p.platform),
          bucketUsed: res?.bucketUsed || "daily",
        });

        // If user selected platforms that backend no longer returns (new creator/range),
        // keep them but also allow user to clear.
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
  }, [from, to, creatorId, selectedPlatforms, isAllowed]);

  const availablePlatforms = useMemo(() => data?.availablePlatforms || [], [data]);

  const platformChartData = useMemo(() => {
    return buildPlatformMergedRows(data?.platforms || []);
  }, [data]);

  const platformKeys = useMemo(() => {
    // display only currently returned platforms (already filtered by backend if platforms param used)
    return (data?.platforms || []).map((p) => p.platform);
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
        Clicks, Leads, and Platforms (time series, backend-controlled granularity)
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
          <label>Creator ID </label>
          <br />
          <input
            placeholder="e.g. creator_123"
            value={creatorId}
            onChange={(e) => setCreatorId(e.target.value)}
          />
        </div>

        <div>
          <label>Platforms</label>
          <br />
          <select
            multiple
            value={selectedPlatforms}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions).map((o) => o.value);
              setSelectedPlatforms(values);
            }}
            style={{ minWidth: 220, height: 34 }}
          >
            {availablePlatforms.length === 0 ? (
              <option value="" disabled>
                (no platforms)
              </option>
            ) : (
              availablePlatforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))
            )}
          </select>
          <div style={{ marginTop: 4, display: "flex", gap: 8 }}>
            <button type="button" onClick={() => setSelectedPlatforms([])}>
              Clear
            </button>
            <small style={{ opacity: 0.7 }}>
              (Ctrl/Shift to select multiple)
            </small>
          </div>
        </div>

        <div style={{ marginLeft: "auto" }}>
          <button
            onClick={() => {
              const end = new Date();
              const start = new Date();
              start.setDate(end.getDate() - 6);
              setFrom(formatISO(start));
              setTo(formatISO(end));
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

      {!loading && !error && data && (
        <p style={{ opacity: 0.75, marginTop: 0 }}>
          Granularity: <b>{data.bucketUsed || "daily"}</b>
        </p>
      )}

      {/* Charts */}
      {!loading && !error && data && hasAnyData && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18 }}>
          {/* Clicks */}
          <div style={{ border: "1px solid #333", borderRadius: 10, padding: 12 }}>
            <h3 style={{ margin: 0 }}>Clicks</h3>
            <div style={{ height: 260, marginTop: 10 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.clicks}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => formatXAxisTick(v, data.bucketUsed)}
                  />
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
            <h3 style={{ margin: 0 }}>Leads</h3>
            <div style={{ height: 260, marginTop: 10 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.leads}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => formatXAxisTick(v, data.bucketUsed)}
                  />
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
            <h3 style={{ margin: 0 }}>Platforms (Cumulative)</h3>
            <div style={{ height: 300, marginTop: 10 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={platformChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => formatXAxisTick(v, data.bucketUsed)}
                  />
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