import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../services/api";

// --- SAMPLE DATA TOGGLE (safe, does not affect backend mode) ---
const USE_SAMPLE_DATA = true;

// deterministic color from string (no hardcoding platform->color)
function colorFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 70% 50%)`;
}

function isObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function monthKey(dateLike) {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return String(dateLike).slice(0, 7);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`; // YYYY-MM
}

function monthLabelFromKey(yyyyMm) {
  // yyyyMm like "2026-02"
  const [y, m] = String(yyyyMm).split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleString("default", { month: "short" }); // Jan, Feb...
}

// --- SAMPLE MONTHLY DATA GENERATOR (already monthly) ---
function generateSampleLeadsMonthly(months = 6) {
  const platforms = ["Instagram", "Facebook", "YouTube", "LinkedIn"];
  const data = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yyyyMm = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}`;

    const row = { date: yyyyMm }; // date is YYYY-MM for monthly chart

    for (const p of platforms) {
      const base =
        p === "Instagram"
          ? 420
          : p === "Facebook"
          ? 320
          : p === "YouTube"
          ? 220
          : 180;

      row[p] = Math.max(0, Math.floor(base * (0.6 + Math.random() * 0.8)));
    }

    data.push(row);
  }

  return data;
}

// --- AGGREGATE ANY DAILY PAYLOAD INTO MONTHS (safe for both backend formats) ---
function aggregateToMonthsPivot(pivotRows) {
  // pivotRows: [{date: "...", Instagram: 2, ...}, ...]
  const map = new Map(); // month -> {date: 'YYYY-MM', ...platforms totals}

  for (const row of pivotRows || []) {
    const mk = monthKey(row?.date);
    if (!map.has(mk)) map.set(mk, { date: mk });

    const out = map.get(mk);
    for (const [k, v] of Object.entries(row || {})) {
      if (k === "date") continue;
      out[k] = (out[k] || 0) + (Number(v) || 0);
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  );
}

export default function LeadsChart() {
  // ✅ months instead of days
  const [timeSeriesMonths, setTimeSeriesMonths] = useState(6);
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [darkMode, setDarkMode] = useState(false);

  const [leadsData, setLeadsData] = useState([]); // [{date:'YYYY-MM', Instagram: 10, ...}]
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");

      try {
        // --- SAMPLE MODE (monthly) ---
        if (USE_SAMPLE_DATA) {
          const sample = generateSampleLeadsMonthly(timeSeriesMonths);
          if (!cancelled) setLeadsData(sample);
          return;
        }

        // ✅ Backend call: keep compatibility by sending BOTH months and days
        // If your backend supports months, it can use months=...
        // If it only supports days, it can use days=months*30
        const days = timeSeriesMonths * 30;
        const res = await api.get("/leads/stats");
        const payload = res?.data;

        // If backend returns pivoted array: [{ date, Instagram: 3, YouTube: 1, ... }]
        if (Array.isArray(payload)) {
          const monthly = aggregateToMonthsPivot(payload);
          if (!cancelled) setLeadsData(monthly);
          return;
        }

        // If backend returns { data: [{date, platform, count}, ...] }
        if (isObject(payload) && Array.isArray(payload.data)) {
          // 1) pivot daily rows
          const map = new Map();
          for (const r of payload.data) {
            const d = r.date;
            const p = r.platform;
            const v = Number(r.count ?? r.leads ?? 0) || 0;
            if (!map.has(d)) map.set(d, { date: d });
            map.get(d)[p] = (map.get(d)[p] || 0) + v;
          }
          const dailyPivot = Array.from(map.values()).sort((a, b) =>
            String(a.date).localeCompare(String(b.date))
          );

          // 2) aggregate to months
          const monthly = aggregateToMonthsPivot(dailyPivot);
          if (!cancelled) setLeadsData(monthly);
          return;
        }

        if (!cancelled) setLeadsData([]);
      } catch (e) {
        if (!cancelled) {
          setErr(e?.response?.data?.message || "Failed to load leads data");
          setLeadsData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [timeSeriesMonths]);

  const platforms = useMemo(() => {
    const set = new Set();
    for (const row of leadsData) {
      Object.keys(row || {}).forEach((k) => {
        if (k !== "date") set.add(k);
      });
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [leadsData]);

  const totalLeads = useMemo(() => {
    if (!leadsData.length) return 0;

    if (selectedPlatform === "All") {
      return leadsData.reduce((sum, row) => {
        let rowSum = 0;
        for (const p of platforms) rowSum += Number(row[p] || 0);
        return sum + rowSum;
      }, 0);
    }

    return leadsData.reduce(
      (sum, row) => sum + Number(row[selectedPlatform] || 0),
      0
    );
  }, [leadsData, platforms, selectedPlatform]);

  const platformTotals = useMemo(() => {
    const totals = {};
    for (const p of platforms) totals[p] = 0;
    for (const row of leadsData) {
      for (const p of platforms) totals[p] += Number(row[p] || 0);
    }
    return totals;
  }, [leadsData, platforms]);

  const hasData = leadsData.length > 0 && platforms.length > 0;

  return (
    <div
      className={`p-4 sm:p-6 transition-all ${
        darkMode ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-900"
      }`}
    >
      <div
        className={`mx-auto max-w-7xl rounded-2xl border p-5 sm:p-7 shadow-sm ${
          darkMode
            ? "border-zinc-800 bg-zinc-900"
            : "border-zinc-200 bg-white"
        }`}
      >
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Leads Analytics
            </h2>
            <p
              className={`mt-1 text-sm ${
                darkMode ? "text-zinc-300" : "text-zinc-600"
              }`}
            >
              Filter by platform and time series window.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            {/* ✅ Time series parameter (MONTHS) */}
            <label className="flex items-center gap-2">
              <span
                className={`text-xs font-medium ${
                  darkMode ? "text-zinc-300" : "text-zinc-600"
                }`}
              >
                Time Series
              </span>
              <select
                value={timeSeriesMonths}
                onChange={(e) => setTimeSeriesMonths(Number(e.target.value))}
                className={`rounded-lg border px-3 py-2 text-sm outline-none ${
                  darkMode
                    ? "border-zinc-700 bg-zinc-950 text-white"
                    : "border-zinc-200 bg-white text-zinc-900"
                }`}
              >
                <option value={3}>Last 3 months</option>
                <option value={6}>Last 6 months</option>
                <option value={12}>Last 12 months</option>
                <option value={24}>Last 24 months</option>
              </select>
            </label>

            {/* Platform filter */}
            <label className="flex items-center gap-2">
              <span
                className={`text-xs font-medium ${
                  darkMode ? "text-zinc-300" : "text-zinc-600"
                }`}
              >
                Platform
              </span>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className={`rounded-lg border px-3 py-2 text-sm outline-none ${
                  darkMode
                    ? "border-zinc-700 bg-zinc-950 text-white"
                    : "border-zinc-200 bg-white text-zinc-900"
                }`}
              >
                <option value="All">All</option>
                {platforms.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>

            {/* Dark mode */}
            <button
              onClick={() => setDarkMode((v) => !v)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                darkMode
                  ? "bg-white text-zinc-900 hover:opacity-90"
                  : "bg-zinc-900 text-white hover:opacity-90"
              }`}
            >
              {darkMode ? "Light" : "Dark"}
            </button>
          </div>
        </div>

        {/* Errors */}
        {err && (
          <div
            className={`mt-4 rounded-lg border p-3 text-sm ${
              darkMode
                ? "border-red-900/50 bg-red-950/40 text-red-200"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {err}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div
              className={`h-10 w-10 animate-spin rounded-full border-4 border-t-transparent ${
                darkMode ? "border-zinc-200" : "border-zinc-800"
              }`}
            />
          </div>
        ) : !hasData ? (
          <div
            className={`mt-6 rounded-xl border p-6 text-sm ${
              darkMode
                ? "border-zinc-800 bg-zinc-950 text-zinc-300"
                : "border-zinc-200 bg-zinc-50 text-zinc-600"
            }`}
          >
            No leads data available for the selected time window.
          </div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {platforms.map((p) => (
                <div
                  key={p}
                  className={`rounded-xl border p-3 ${
                    darkMode
                      ? "border-zinc-800 bg-zinc-950"
                      : "border-zinc-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium opacity-70">{p}</div>
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ background: colorFromString(p) }}
                    />
                  </div>
                  <div className="mt-2 text-xl font-bold">
                    {platformTotals[p] ?? 0}
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-6 flex flex-col gap-1">
              <div
                className={`text-sm ${
                  darkMode ? "text-zinc-300" : "text-zinc-600"
                }`}
              >
                Total Leads
              </div>
              <div className="text-3xl font-bold">{totalLeads}</div>
              <div
                className={`text-xs ${
                  darkMode ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                {selectedPlatform === "All"
                  ? `Across all platforms (last ${timeSeriesMonths} months)`
                  : `${selectedPlatform} (last ${timeSeriesMonths} months)`}
              </div>
            </div>

            {/* Chart (LINE GRAPH + MONTH LABELS) */}
            <div
              className={`mt-6 h-[320px] sm:h-[420px] rounded-xl border p-3 ${
                darkMode
                  ? "border-zinc-800 bg-zinc-950"
                  : "border-zinc-200 bg-white"
              }`}
            >
              <ResponsiveContainer>
                <LineChart data={leadsData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    stroke={darkMode ? "#fff" : "#111"}
                    tickFormatter={(value) => monthLabelFromKey(value)} // Jan, Feb, Mar...
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke={darkMode ? "#fff" : "#111"}
                  />
                  <Tooltip
                    labelFormatter={(label) => monthLabelFromKey(label)}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />

                  {selectedPlatform === "All" ? (
                    platforms.map((p) => (
                      <Line
                        key={p}
                        type="monotone"
                        dataKey={p}
                        stroke={colorFromString(p)}
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 5 }}
                      />
                    ))
                  ) : (
                    <Line
                      type="monotone"
                      dataKey={selectedPlatform}
                      stroke={colorFromString(selectedPlatform)}
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}