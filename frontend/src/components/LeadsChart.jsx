import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import api from "../services/api";

// deterministic color from string (no hardcoding platform->color)
function colorFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 70% 50%)`;
}

function isObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

export default function LeadsChart() {
  const [timeSeriesDays, setTimeSeriesDays] = useState(30); // time series parameter
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [darkMode, setDarkMode] = useState(false);

  const [leadsData, setLeadsData] = useState([]); // [{date: '2026-02-01', Instagram: 10, ...}, ...]
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Fetch time series (not hardcoded)
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");
      try {
        // ✅ adjust endpoint if your backend uses a different route
        // Expected response shape: { data: [{ date: "2026-02-01", platform: "Instagram", leads: 10 }, ...] }
        // OR directly [{ date, Instagram, YouTube, ... }]
       const res = await api.get(`/leads/stats`);
       console.log("LEADS STATS RESPONSE:", res.data);
        let rows = [];
        if (Array.isArray(payload)) {
          // already pivoted
          rows = payload;
        } else if (isObject(payload) && Array.isArray(payload.data)) {
          // needs pivot
          const map = new Map();
          for (const r of payload.data) {
            const d = r.date;
            const p = r.platform;
            const v = Number(r.leads ?? r.count ?? 0) || 0;
            if (!map.has(d)) map.set(d, { date: d });
            map.get(d)[p] = (map.get(d)[p] || 0) + v;
          }
          rows = Array.from(map.values()).sort((a, b) => String(a.date).localeCompare(String(b.date)));
        } else {
          rows = [];
        }

        if (!cancelled) setLeadsData(rows);
      }  catch (e) {
  // Backend route not available yet (team dependency) – keep UI functional
  setErr("");
  setLeadsData([]);
} finally {
  if (!cancelled) setLoading(false);
}
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [timeSeriesDays]);

  // derive platforms dynamically from data keys (no hardcoding)
  const platforms = useMemo(() => {
    const set = new Set();
    for (const row of leadsData) {
      Object.keys(row || {}).forEach((k) => {
        if (k !== "date") set.add(k);
      });
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [leadsData]);

  // total leads
  const totalLeads = useMemo(() => {
    if (!leadsData.length) return 0;
    if (selectedPlatform === "All") {
      return leadsData.reduce((sum, row) => {
        let rowSum = 0;
        for (const p of platforms) rowSum += Number(row[p] || 0);
        return sum + rowSum;
      }, 0);
    }
    return leadsData.reduce((sum, row) => sum + Number(row[selectedPlatform] || 0), 0);
  }, [leadsData, platforms, selectedPlatform]);

  // KPI per platform
  const platformTotals = useMemo(() => {
    const totals = {};
    for (const p of platforms) totals[p] = 0;
    for (const row of leadsData) {
      for (const p of platforms) totals[p] += Number(row[p] || 0);
    }
    return totals;
  }, [leadsData, platforms]);

  // empty state
  const hasData = leadsData.length > 0 && platforms.length > 0;

  return (
    <div className={`p-4 sm:p-6 transition-all ${darkMode ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-900"}`}>
      <div className={`mx-auto max-w-7xl rounded-2xl border p-5 sm:p-7 shadow-sm ${darkMode ? "border-zinc-800 bg-zinc-900" : "border-zinc-200 bg-white"}`}>
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Leads Analytics</h2>
            <p className={`mt-1 text-sm ${darkMode ? "text-zinc-300" : "text-zinc-600"}`}>
              Filter by platform and time series window.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            {/* Time series parameter */}
            <label className="flex items-center gap-2">
              <span className={`text-xs font-medium ${darkMode ? "text-zinc-300" : "text-zinc-600"}`}>Time Series</span>
              <select
                value={timeSeriesDays}
                onChange={(e) => setTimeSeriesDays(Number(e.target.value))}
                className={`rounded-lg border px-3 py-2 text-sm outline-none ${darkMode ? "border-zinc-700 bg-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-900"}`}
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </label>

            {/* Platform filter */}
            <label className="flex items-center gap-2">
              <span className={`text-xs font-medium ${darkMode ? "text-zinc-300" : "text-zinc-600"}`}>Platform</span>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className={`rounded-lg border px-3 py-2 text-sm outline-none ${darkMode ? "border-zinc-700 bg-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-900"}`}
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
                darkMode ? "bg-white text-zinc-900 hover:opacity-90" : "bg-zinc-900 text-white hover:opacity-90"
              }`}
            >
              {darkMode ? "Light" : "Dark"}
            </button>
          </div>
        </div>

        {/* Errors */}
        {err && (
          <div className={`mt-4 rounded-lg border p-3 text-sm ${darkMode ? "border-red-900/50 bg-red-950/40 text-red-200" : "border-red-200 bg-red-50 text-red-700"}`}>
            {err}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className={`h-10 w-10 animate-spin rounded-full border-4 border-t-transparent ${darkMode ? "border-zinc-200" : "border-zinc-800"}`} />
          </div>
        ) : !hasData ? (
          <div className={`mt-6 rounded-xl border p-6 text-sm ${darkMode ? "border-zinc-800 bg-zinc-950 text-zinc-300" : "border-zinc-200 bg-zinc-50 text-zinc-600"}`}>
            No leads data yet. Backend leads stats API is pending.
          </div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {platforms.map((p) => (
                <div
                  key={p}
                  className={`rounded-xl border p-3 ${darkMode ? "border-zinc-800 bg-zinc-950" : "border-zinc-200 bg-white"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium opacity-70">{p}</div>
                    <div className="h-3 w-3 rounded-full" style={{ background: colorFromString(p) }} />
                  </div>
                  <div className="mt-2 text-xl font-bold">{platformTotals[p] ?? 0}</div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-6 flex flex-col gap-1">
              <div className={`text-sm ${darkMode ? "text-zinc-300" : "text-zinc-600"}`}>Total Leads</div>
              <div className="text-3xl font-bold">{totalLeads}</div>
              <div className={`text-xs ${darkMode ? "text-zinc-400" : "text-zinc-500"}`}>
                {selectedPlatform === "All" ? `Across all platforms (last ${timeSeriesDays} days)` : `${selectedPlatform} (last ${timeSeriesDays} days)`}
              </div>
            </div>

            {/* Chart */}
            <div className={`mt-6 h-[320px] sm:h-[420px] rounded-xl border p-3 ${darkMode ? "border-zinc-800 bg-zinc-950" : "border-zinc-200 bg-white"}`}>
              <ResponsiveContainer>
                <BarChart data={leadsData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke={darkMode ? "#fff" : "#111"} />
                  <YAxis tick={{ fontSize: 12 }} stroke={darkMode ? "#fff" : "#111"} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />

                  {selectedPlatform === "All"
                    ? platforms.map((p) => (
                        <Bar key={p} dataKey={p} radius={[8, 8, 0, 0]}>
                          {leadsData.map((_, idx) => (
                            <Cell key={idx} fill={colorFromString(p)} />
                          ))}
                        </Bar>
                      ))
                    : (
                      <Bar dataKey={selectedPlatform} radius={[8, 8, 0, 0]}>
                        {leadsData.map((_, idx) => (
                          <Cell key={idx} fill={colorFromString(selectedPlatform)} />
                        ))}
                      </Bar>
                    )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}