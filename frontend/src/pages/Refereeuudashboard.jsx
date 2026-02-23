import { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ─── inject fonts + global CSS once ──────────────────────────────────────────
const STYLE_ID = "referee-uu-styles";
if (!document.getElementById(STYLE_ID)) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap";
  document.head.appendChild(link);

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .ruu-root *, .ruu-root *::before, .ruu-root *::after { box-sizing: border-box; }
    .ruu-root input[type="date"]::-webkit-calendar-picker-indicator {
      filter: invert(0.35); cursor: pointer;
    }
    .ruu-preset-btn {
      background: #0d0d18; border: 1px solid #1f1f32; color: #4a4a6a;
      border-radius: 6px; padding: 5px 14px; font-size: 11px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace; letter-spacing: 0.08em;
      transition: all 0.15s ease;
    }
    .ruu-preset-btn:hover { border-color: #00e5ff55; color: #00e5ffaa; }
    .ruu-preset-btn.active { background: #00e5ff12; border-color: #00e5ff; color: #00e5ff; }
    .ruu-date-input {
      background: #0d0d18; border: 1px solid #1f1f32; color: #8888aa;
      border-radius: 6px; padding: 5px 10px; font-size: 11px;
      font-family: 'JetBrains Mono', monospace; outline: none; transition: border-color 0.15s;
    }
    .ruu-date-input:focus { border-color: #00e5ff55; }
    .ruu-member-row {
      border-bottom: 1px solid #0f0f1e; cursor: pointer; transition: background 0.12s ease;
    }
    .ruu-member-row:hover { background: #ffffff06; }
    .ruu-member-row.active { background: #00e5ff08; }
    .ruu-drill-panel { animation: ruuSlideIn 0.22s cubic-bezier(0.22,1,0.36,1); }
    @keyframes ruuSlideIn {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .ruu-skeleton {
      background: linear-gradient(90deg, #0f0f1e 25%, #181828 50%, #0f0f1e 75%);
      background-size: 200% 100%; animation: ruuShimmer 1.5s infinite; border-radius: 6px;
    }
    @keyframes ruuShimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .ruu-card {
      background: #0d0d18; border: 1px solid #1a1a2e; border-radius: 14px;
      padding: 22px 26px; margin-bottom: 16px;
    }
    .ruu-stat-card {
      flex: 1 1 130px; background: #090913; border: 1px solid #1a1a2e;
      border-radius: 12px; padding: 16px 20px; display: flex; flex-direction: column;
      gap: 5px; transition: border-color 0.2s;
    }
    .ruu-stat-card:hover { border-color: #2a2a4a; }
    .ruu-close-btn {
      margin-left: auto; background: none; border: none; color: #3a3a5a;
      cursor: pointer; font-size: 16px; padding: 2px 8px; font-family: inherit;
      transition: color 0.15s; line-height: 1;
    }
    .ruu-close-btn:hover { color: #ff4466; }
    .ruu-export-btn {
      background: none; border: 1px solid #1f1f32; color: #4a4a6a;
      border-radius: 6px; padding: 5px 14px; font-size: 10px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace; letter-spacing: 0.06em;
      transition: all 0.15s;
    }
    .ruu-export-btn:hover:not(:disabled) { border-color: #00e5ff44; color: #00e5ffaa; }
    .ruu-export-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .ruu-retry-btn {
      background: none; border: 1px solid #ff446644; color: #ff4466;
      border-radius: 6px; padding: 4px 14px; cursor: pointer; font-size: 11px;
      font-family: 'JetBrains Mono', monospace; transition: border-color 0.15s;
    }
    .ruu-retry-btn:hover { border-color: #ff4466; }
    @media (max-width: 768px) {
      .ruu-bottom-row { flex-direction: column !important; }
      .ruu-header     { flex-direction: column !important; }
      .ruu-controls   { align-items: flex-start !important; }
    }
  `;
  document.head.appendChild(style);
}

// ─── constants ────────────────────────────────────────────────────────────────
const API = "http://localhost:5000";
const PRESETS = [
  { label: "7D",  days: 7  },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

// ─── helpers ──────────────────────────────────────────────────────────────────
function toYYYYMMDD(d = new Date()) { return d.toISOString().slice(0, 10); }
function daysAgo(n) {
  const d = new Date(); d.setDate(d.getDate() - n); return toYYYYMMDD(d);
}
function fmt(n) { return n == null ? "—" : Number(n).toLocaleString(); }

function exportCsv(series, filename) {
  const rows = [["date", "uu"], ...series.map((r) => [r.date, r.uu])];
  const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob), download: filename,
  });
  a.click(); URL.revokeObjectURL(a.href);
}

// ─── tiny atoms ───────────────────────────────────────────────────────────────
function Skeleton({ h = 20, w = "100%" }) {
  return <div className="ruu-skeleton" style={{ height: h, width: w }} />;
}

function StatCard({ label, value, sub, accent = "#00e5ff" }) {
  return (
    <div className="ruu-stat-card">
      <span style={{ fontSize: 9, letterSpacing: "0.15em", color: "#3a3a5a", textTransform: "uppercase" }}>
        {label}
      </span>
      <span style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>
        {value}
      </span>
      {sub && <span style={{ fontSize: 10, color: "#3a3a5a", marginTop: 2 }}>{sub}</span>}
      <div style={{ height: 2, width: 28, background: accent, borderRadius: 2, marginTop: 8, opacity: 0.6 }} />
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#09090f", border: "1px solid #1f1f32", borderRadius: 10, padding: "10px 16px", fontFamily: "'JetBrains Mono', monospace" }}>
      <p style={{ margin: "0 0 6px", color: "#3a3a5a", fontSize: 10 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ margin: 0, color: p.color, fontSize: 13, fontWeight: 600 }}>
          {p.value.toLocaleString()} UU
        </p>
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "40px 0", color: "#ff4466", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
      <span style={{ fontSize: 28 }}>⚠</span>
      <span>{message}</span>
      {onRetry && <button className="ruu-retry-btn" onClick={onRetry}>retry</button>}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "48px 0", color: "#1f1f32", fontSize: 12 }}>
      <div style={{ fontSize: 32 }}>∅</div>
      <span>{text}</span>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function RefereeUuDashboard() {
  const [from, setFrom]               = useState(daysAgo(6));
  const [to, setTo]                   = useState(toYYYYMMDD());
  const [activePreset, setActivePreset] = useState("7D");

  const [overview, setOverview]           = useState([]);
  const [overviewLoading, setOvLoading]   = useState(false);
  const [overviewError, setOvError]       = useState(null);

  const [members, setMembers]             = useState([]);
  const [membersLoading, setMbLoading]    = useState(false);
  const [membersError, setMbError]        = useState(null);

  const [selected, setSelected]           = useState(null);   // { id, name }
  const [drillData, setDrillData]         = useState(null);
  const [drillLoading, setDrLoading]      = useState(false);
  const [drillError, setDrError]          = useState(null);

  // ── fetchers ────────────────────────────────────────────────────────────────
  const fetchOverview = useCallback(async () => {
    setOvLoading(true); setOvError(null);
    try {
      const r = await fetch(`${API}/api/uu/referee/overview?from=${from}&to=${to}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setOverview((await r.json()).series || []);
    } catch (e) { setOvError(e.message); setOverview([]); }
    finally { setOvLoading(false); }
  }, [from, to]);

  const fetchMembers = useCallback(async () => {
    setMbLoading(true); setMbError(null);
    try {
      const r = await fetch(`${API}/api/uu/referee/members?from=${from}&to=${to}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setMembers((await r.json()).members || []);
    } catch (e) { setMbError(e.message); setMembers([]); }
    finally { setMbLoading(false); }
  }, [from, to]);

  const fetchDrill = useCallback(async (id) => {
    setDrLoading(true); setDrError(null); setDrillData(null);
    try {
      const r = await fetch(`${API}/api/uu/referee/${id}?from=${from}&to=${to}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      setDrillData({ summary: d.summary, series: d.series || [] });
    } catch (e) { setDrError(e.message); }
    finally { setDrLoading(false); }
  }, [from, to]);

  useEffect(() => { fetchOverview(); fetchMembers(); }, [fetchOverview, fetchMembers]);
  useEffect(() => { if (selected) fetchDrill(selected.id); }, [selected, fetchDrill]);

  // ── preset handler ───────────────────────────────────────────────────────────
  function applyPreset(days, label) {
    setFrom(daysAgo(days - 1)); setTo(toYYYYMMDD()); setActivePreset(label);
  }

  // ── derived summary ──────────────────────────────────────────────────────────
  const summary = (() => {
    if (!overview.length) return { total: 0, avg: 0, peak: 0, peakDate: null };
    let total = 0, peak = -1, peakDate = null;
    for (const p of overview) {
      total += p.uu;
      if (p.uu > peak) { peak = p.uu; peakDate = p.date; }
    }
    return { total, avg: Math.round((total / overview.length) * 100) / 100, peak, peakDate };
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="ruu-root" style={{ minHeight: "100vh", background: "#07070f", color: "#c8c8e0", padding: "36px 28px" }}>

      {/* ── HEADER ── */}
      <header className="ruu-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, marginBottom: 32 }}>
        <div>
          <p style={{ margin: 0, fontSize: 10, letterSpacing: "0.2em", color: "#00e5ff", fontWeight: 600, textTransform: "uppercase" }}>
            Analytics · Referee
          </p>
          <h1 style={{ margin: "6px 0 0", fontSize: 32, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif", letterSpacing: "-1px", lineHeight: 1 }}>
            Referee UU
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 11, color: "#3a3a5a" }}>
            Unique users brought in by referees · {from} → {to}
          </p>
        </div>

        <div className="ruu-controls" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {PRESETS.map((p) => (
              <button key={p.label} className={`ruu-preset-btn${activePreset === p.label ? " active" : ""}`} onClick={() => applyPreset(p.days, p.label)}>
                {p.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="date" className="ruu-date-input" value={from} max={to}
              onChange={(e) => { setFrom(e.target.value); setActivePreset(null); }} />
            <span style={{ color: "#2a2a4a", fontSize: 12 }}>→</span>
            <input type="date" className="ruu-date-input" value={to} min={from}
              onChange={(e) => { setTo(e.target.value); setActivePreset(null); }} />
          </div>
        </div>
      </header>

      {/* ── STAT CARDS ── */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <StatCard label="Total UU"     value={overviewLoading ? "…" : fmt(summary.total)}  accent="#00e5ff" />
        <StatCard label="Avg Daily UU" value={overviewLoading ? "…" : fmt(summary.avg)}    accent="#7c6ff7" />
        <StatCard label="Peak UU"      value={overviewLoading ? "…" : fmt(summary.peak > -1 ? summary.peak : null)} sub={summary.peakDate} accent="#ff6b6b" />
        <StatCard label="Referees"     value={membersLoading  ? "…" : fmt(members.length)} accent="#00ff9d" />
      </div>

      {/* ── OVERVIEW CHART ── */}
      <div className="ruu-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "0.04em", fontFamily: "'Syne', sans-serif" }}>
              Unique Users Over Time
            </h2>
            <p style={{ margin: "3px 0 0", fontSize: 10, color: "#3a3a5a" }}>All referees combined</p>
          </div>
          <button className="ruu-export-btn" onClick={() => exportCsv(overview, `referee-uu-${from}-${to}.csv`)} disabled={!overview.length}>
            ↓ export csv
          </button>
        </div>

        {overviewLoading
          ? <Skeleton h={280} />
          : overviewError
          ? <ErrorState message={overviewError} onRetry={fetchOverview} />
          : overview.length === 0
          ? <EmptyState text="No data for selected range" />
          : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={overview} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="ovGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#00e5ff" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#00e5ff" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#0f0f1e" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#2a2a4a", fontSize: 10, fontFamily: "'JetBrains Mono'" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#2a2a4a", fontSize: 10, fontFamily: "'JetBrains Mono'" }} tickLine={false} axisLine={false} width={44}
                  label={{ value: "UU", angle: -90, position: "insideLeft", fill: "#2a2a4a", fontSize: 10, dy: 16 }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend formatter={(v) => <span style={{ color: "#4a4a6a", fontSize: 10, fontFamily: "'JetBrains Mono'" }}>{v}</span>} />
                <Area type="monotone" dataKey="uu" name="Referee UU" stroke="#00e5ff" strokeWidth={2}
                  fill="url(#ovGrad)" dot={false} activeDot={{ r: 5, fill: "#00e5ff", strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )
        }
      </div>

      {/* ── BOTTOM ROW ── */}
      <div className="ruu-bottom-row" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

        {/* MEMBERS TABLE */}
        <div className="ruu-card" style={{ flex: "1 1 300px", minWidth: 0, marginBottom: 0 }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Syne', sans-serif" }}>
            Referees Ranked by UU
          </h2>

          {membersLoading
            ? <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{[...Array(5)].map((_, i) => <Skeleton key={i} h={36} />)}</div>
            : membersError
            ? <ErrorState message={membersError} onRetry={fetchMembers} />
            : members.length === 0
            ? <EmptyState text="No referees found" />
            : (
              <div style={{ overflowY: "auto", maxHeight: 390 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr>
                      {["#", "Referee", "Total UU", ""].map((h, i) => (
                        <th key={i} style={{ textAlign: h === "Total UU" ? "right" : "left", color: "#2a2a4a", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", padding: "6px 10px", borderBottom: "1px solid #0f0f1e", fontFamily: "'JetBrains Mono', monospace" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m, i) => {
                      const isActive = selected?.id === m.id;
                      return (
                        <tr key={m.id} className={`ruu-member-row${isActive ? " active" : ""}`}
                          onClick={() => setSelected(isActive ? null : { id: m.id, name: m.name })}>
                          <td style={{ padding: "10px 10px", color: "#2a2a4a", width: 30, fontVariantNumeric: "tabular-nums" }}>{i + 1}</td>
                          <td style={{ padding: "10px 10px", color: isActive ? "#00e5ff" : "#7777aa", fontWeight: isActive ? 600 : 400 }}>
                            {m.name || m.id}
                          </td>
                          <td style={{ padding: "10px 10px", textAlign: "right", color: "#fff", fontVariantNumeric: "tabular-nums" }}>
                            {m.totalUu.toLocaleString()}
                          </td>
                          <td style={{ padding: "10px 8px", color: isActive ? "#00e5ff" : "#2a2a4a", fontSize: 14, width: 20 }}>
                            {isActive ? "✕" : "›"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>

        {/* DRILL-DOWN PANEL */}
        <div className="ruu-card" style={{ flex: "2 1 440px", minWidth: 0, marginBottom: 0 }}>
          {!selected
            ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 320, color: "#1a1a2e", gap: 14 }}>
                <div style={{ width: 60, height: 60, border: "1px dashed #1a1a2e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                  ↖
                </div>
                <p style={{ margin: 0, fontSize: 12, color: "#2a2a4a", textAlign: "center" }}>
                  Select a referee from the table<br />to see their individual breakdown
                </p>
              </div>
            )
            : (
              <div className="ruu-drill-panel">
                {/* drill header */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#7c6ff7", flexShrink: 0 }} />
                  <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: "'Syne', sans-serif", letterSpacing: "-0.3px" }}>
                    {selected.name || selected.id}
                  </h2>
                  {drillLoading && <span style={{ fontSize: 10, color: "#3a3a5a" }}>loading…</span>}
                  <button className="ruu-close-btn" onClick={() => { setSelected(null); setDrillData(null); }}>✕</button>
                </div>

                {drillLoading && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <Skeleton h={72} w="33%" /><Skeleton h={72} w="33%" /><Skeleton h={72} w="33%" />
                    </div>
                    <Skeleton h={200} />
                  </div>
                )}

                {!drillLoading && drillError && (
                  <ErrorState message={drillError} onRetry={() => fetchDrill(selected.id)} />
                )}

                {!drillLoading && drillData && (
                  <>
                    {/* mini stat row */}
                    <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
                      <StatCard label="Total UU"  value={fmt(drillData.summary.totalUu)}   accent="#7c6ff7" />
                      <StatCard label="Avg Daily" value={fmt(drillData.summary.avgDailyUu)} accent="#7c6ff7" />
                      <StatCard label="Peak UU"   value={fmt(drillData.summary.peakUu)} sub={drillData.summary.peakDate} accent="#ff6b6b" />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                      <button className="ruu-export-btn" onClick={() => exportCsv(drillData.series, `referee-${selected.id}-${from}-${to}.csv`)} disabled={!drillData.series.length}>
                        ↓ export csv
                      </button>
                    </div>

                    {drillData.series.length === 0
                      ? <EmptyState text="No UU data for this referee in selected range" />
                      : (
                        <ResponsiveContainer width="100%" height={220}>
                          <AreaChart data={drillData.series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="drGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%"   stopColor="#7c6ff7" stopOpacity={0.22} />
                                <stop offset="100%" stopColor="#7c6ff7" stopOpacity={0}    />
                              </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#0f0f1e" strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tick={{ fill: "#2a2a4a", fontSize: 10, fontFamily: "'JetBrains Mono'" }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fill: "#2a2a4a", fontSize: 10, fontFamily: "'JetBrains Mono'" }} tickLine={false} axisLine={false} width={44}
                              label={{ value: "UU", angle: -90, position: "insideLeft", fill: "#2a2a4a", fontSize: 10, dy: 16 }} />
                            <Tooltip content={<ChartTooltip />} />
                            <Legend formatter={(v) => <span style={{ color: "#4a4a6a", fontSize: 10, fontFamily: "'JetBrains Mono'" }}>{v}</span>} />
                            <Area type="monotone" dataKey="uu" name={selected.name || selected.id}
                              stroke="#7c6ff7" strokeWidth={2} fill="url(#drGrad)"
                              dot={false} activeDot={{ r: 5, fill: "#7c6ff7", strokeWidth: 0 }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      )
                    }
                  </>
                )}
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}