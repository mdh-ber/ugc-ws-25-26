import { useEffect, useMemo, useRef, useState } from "react";
import {
  Trophy,
  MapPin,
  Calendar,
  Filter,
  Search,
  Download,
  BarChart3,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Wifi,
  X,
} from "lucide-react";

const API = "http://localhost:5000/api/leaderboard";

const PLATFORMS = ["All", "Instagram", "TikTok", "YouTube", "Facebook", "Unknown"];
const LOCATIONS = ["All", "Berlin", "Düsseldorf", "Unknown"];
const MONTHS = ["All", "2026-02", "2026-01", "2025-12"]; // make dynamic later

export default function LeaderboardPage() {
  // Later: get from auth
  const currentUserName = "Lea S.";

  // URL persisted filters
  const initial = useMemo(() => {
    const sp = new URLSearchParams(window.location.search);
    return {
      month: sp.get("month") || "2026-02",
      platform: sp.get("platform") || "All",
      location: sp.get("location") || "All",
    };
  }, []);

  const [month, setMonth] = useState(initial.month);
  const [platform, setPlatform] = useState(initial.platform);
  const [location, setLocation] = useState(initial.location);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rankedFromApi, setRankedFromApi] = useState([]);
  const [top3FromApi, setTop3FromApi] = useState([]);
  const [locationLeadersFromApi, setLocationLeadersFromApi] = useState({
    Berlin: null,
    Düsseldorf: null,
  });

  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const timerRef = useRef(null);

  // Drawer (score breakdown)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerRow, setDrawerRow] = useState(null);

  function syncUrl(next) {
    const sp = new URLSearchParams(window.location.search);
    sp.set("month", next.month);
    sp.set("platform", next.platform);
    sp.set("location", next.location);
    const url = `${window.location.pathname}?${sp.toString()}`;
    window.history.replaceState({}, "", url);
  }

  async function loadLeaderboard({ silent = false } = {}) {
    if (!silent) setLoading(true);
    setError("");

    try {
      const qs = new URLSearchParams({ month, platform, location }).toString();
      const res = await fetch(`${API}?${qs}`);
      const data = await res.json();

      if (!res.ok) {
        setRankedFromApi([]);
        setTop3FromApi([]);
        setLocationLeadersFromApi({ Berlin: null, Düsseldorf: null });
        setError(data?.message || "Failed to load leaderboard.");
        return;
      }

      setRankedFromApi(Array.isArray(data?.ranked) ? data.ranked : []);
      setTop3FromApi(Array.isArray(data?.top3) ? data.top3 : []);
      setLocationLeadersFromApi(data?.locationLeaders || { Berlin: null, Düsseldorf: null });
      setLastUpdatedAt(new Date());
    } catch (e) {
      console.error(e);
      setError("Server not reachable. Is backend running?");
      setRankedFromApi([]);
      setTop3FromApi([]);
      setLocationLeadersFromApi({ Berlin: null, Düsseldorf: null });
    } finally {
      if (!silent) setLoading(false);
    }
  }

  // on filter change: persist URL + fetch
  useEffect(() => {
    syncUrl({ month, platform, location });
    loadLeaderboard();

  }, [month, platform, location]);

  // auto refresh ticker (silent)
  useEffect(() => {
    if (!autoRefresh) return;

    timerRef.current = window.setInterval(() => {
      loadLeaderboard({ silent: true });
    }, 20000); // 20s

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };

  }, [autoRefresh, month, platform, location]);

  // normalize + client search
  const ranked = useMemo(() => {
    const q = search.trim().toLowerCase();

    const list = rankedFromApi.map((r) => ({
      id: String(r._id || `${r.creatorName}-${r.month}-${r.platform}-${r.location}`),
      name: r.creatorName || "-",
      score: Number(r.score || 0),
      rank: Number(r.rank || 0),
      platform: r.platform || "Unknown",
      location: r.location || "Unknown",
      month: r.month || "unknown",

      // indices from backend (for drawer)
      engagementIndex: Number(r.engagementIndex ?? 0),
      conversionIndex: Number(r.conversionIndex ?? 0),
      revenueIndex: Number(r.revenueIndex ?? 0),
      growthIndex: Number(r.growthIndex ?? 0),
    }));

    if (!q) return list;
    return list.filter((x) => x.name.toLowerCase().includes(q));
  }, [rankedFromApi, search]);

  const top3 = useMemo(() => {
    return (top3FromApi || []).map((r) => ({
      id: String(r._id || `${r.creatorName}-${r.month}-${r.platform}-${r.location}`),
      name: r.creatorName || "-",
      score: Number(r.score || 0),
      platform: r.platform || "Unknown",
      location: r.location || "Unknown",
      month: r.month || "unknown",
    }));
  }, [top3FromApi]);

  const locationLeaders = useMemo(() => {
    const mapLeader = (r) =>
      !r
        ? null
        : {
            id: String(r._id || `${r.creatorName}-${r.month}-${r.platform}-${r.location}`),
            name: r.creatorName || "-",
            score: Number(r.score || 0),
            platform: r.platform || "Unknown",
            location: r.location || "Unknown",
            month: r.month || "unknown",
          };

    return {
      Berlin: mapLeader(locationLeadersFromApi?.Berlin),
      Düsseldorf: mapLeader(locationLeadersFromApi?.Düsseldorf),
    };
  }, [locationLeadersFromApi]);

  const myRow = useMemo(() => ranked.find((r) => r.name === currentUserName) || null, [ranked]);

  const kpis = useMemo(() => {
    const total = ranked.length;
    const highest = ranked[0]?.score ?? 0;
    const avg = total ? Math.round(ranked.reduce((s, x) => s + x.score, 0) / total) : 0;
    return { total, highest, avg, myRank: myRow?.rank ?? "-" };
  }, [ranked, myRow]);

  function exportCSV() {
    const headers = ["rank", "name", "score", "platform", "location", "month"];
    const rows = ranked.map((r) => [r.rank, r.name, r.score, r.platform, r.location, r.month]);
    const csv = [headers.join(","), ...rows.map((row) => row.map(escapeCSV).join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leaderboard_${month}_${platform}_${location}.csv`.replaceAll(" ", "_");
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function openDrawer(row) {
    setDrawerRow(row);
    setDrawerOpen(true);
  }

  const createDisabled = loading;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Background accents */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute top-40 -right-24 h-72 w-72 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-amber-200/20 blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 text-white flex items-center justify-center shadow-sm">
            <BarChart3 size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Leaderboard</h1>

              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2 py-1 rounded-full border bg-white/80 text-gray-700">
                <Wifi size={12} />
                {autoRefresh ? "Live" : "Paused"}
              </span>

              {lastUpdatedAt ? (
                <span className="text-[11px] font-extrabold px-2 py-1 rounded-full border bg-white/80 text-gray-600">
                  Updated: {lastUpdatedAt.toLocaleTimeString()}
                </span>
              ) : null}
            </div>

            <p className="text-sm text-gray-500 mt-1">
              Enterprise ranking view with filters and highlights.
            </p>

            {loading ? (
              <div className="text-xs text-gray-500 mt-2">Loading leaderboard…</div>
            ) : error ? (
              <div className="text-xs text-red-600 mt-2">{error}</div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setAutoRefresh((p) => !p)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-white/90 hover:bg-white shadow-sm text-sm font-extrabold text-gray-900 transition"
          >
            <RefreshCw size={16} className={autoRefresh ? "animate-spin" : ""} />
            {autoRefresh ? "Auto: ON" : "Auto: OFF"}
          </button>

          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-white/90 hover:bg-white shadow-sm text-sm font-extrabold text-gray-900 transition"
            disabled={createDisabled}
          >
            <Download size={16} />
            Export CSV
          </button>

          <button
            onClick={() => loadLeaderboard()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-white/90 hover:bg-white shadow-sm text-sm font-extrabold text-gray-900 transition"
            disabled={createDisabled}
          >
            Refresh
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-white/70 shadow-sm text-xs font-extrabold text-gray-600">
            <Sparkles size={14} />
            Enhanced dashboard effects
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        {loading ? (
          <>
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
          </>
        ) : (
          <>
            <KPI label="Creators in view" value={kpis.total} />
            <KPI label="Highest score" value={kpis.highest} />
            <KPI label="Average score" value={kpis.avg} />
            <KPI label="Your rank" value={kpis.myRank} accent />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="sticky top-0 z-10 mt-6">
        <div className="rounded-2xl border bg-white/70 backdrop-blur shadow-sm p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-extrabold text-gray-500">
              <Filter size={14} />
              FILTERS
            </div>

            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border bg-white text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-gray-900"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search creators..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <SelectBox
              label="Monthly"
              icon={<Calendar size={16} className="text-gray-400" />}
              value={month}
              onChange={setMonth}
              options={MONTHS}
              format={(x) => (x === "All" ? "All months" : x)}
            />
            <SelectBox
              label="Platforms"
              icon={<Trophy size={16} className="text-gray-400" />}
              value={platform}
              onChange={setPlatform}
              options={PLATFORMS}
              format={(x) => x}
            />
            <SelectBox
              label="Location"
              icon={<MapPin size={16} className="text-gray-400" />}
              value={location}
              onChange={setLocation}
              options={LOCATIONS}
              format={(x) => (x === "All" ? "All locations" : x)}
            />
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Card title="Top 3 creators of the month" subtitle="Auto-updates with filters">
          {loading ? (
            <div className="grid gap-3">
              <CardSkeleton height="h-20" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CardSkeleton height="h-20" />
                <CardSkeleton height="h-20" />
              </div>
            </div>
          ) : top3.length === 0 ? (
            <Empty />
          ) : (
            <div className="grid gap-3">
              <PodiumCard place={1} data={top3[0]} currentUserName={currentUserName} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PodiumCard place={2} data={top3[1]} currentUserName={currentUserName} />
                <PodiumCard place={3} data={top3[2]} currentUserName={currentUserName} />
              </div>
            </div>
          )}
        </Card>

        <Card title="Location leaders" subtitle="Berlin vs Düsseldorf (month + platform)">
          {loading ? (
            <div className="grid gap-3">
              <CardSkeleton height="h-24" />
              <CardSkeleton height="h-24" />
            </div>
          ) : (
            <div className="grid gap-3">
              <LocLeader label="Berlin" leader={locationLeaders.Berlin} />
              <LocLeader label="Düsseldorf" leader={locationLeaders.Düsseldorf} />
            </div>
          )}
        </Card>

        <div className="lg:sticky lg:top-28 h-fit">
          <Card title="Your position" subtitle="Highlighted in the table">
            {loading ? (
              <CardSkeleton height="h-28" />
            ) : !myRow ? (
              <div className="text-sm text-gray-500">
                You’re not visible in this view. Try creating certificates/rewards/milestones or ingest data.
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-gray-900 to-gray-700 text-white p-4">
                <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -left-16 -bottom-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />

                <div className="flex items-start justify-between gap-3 relative">
                  <div>
                    <div className="text-xs font-extrabold opacity-85">Your rank</div>
                    <div className="mt-1 text-3xl font-extrabold">#{myRow.rank}</div>
                    <div className="mt-2 text-sm font-extrabold">{myRow.name}</div>
                    <div className="text-xs opacity-85 mt-1">
                      {myRow.platform} • {myRow.location} • {myRow.month}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-extrabold opacity-85">Score</div>
                    <div className="mt-1 text-3xl font-extrabold">{myRow.score}</div>
                    <div className="mt-2 inline-flex items-center gap-1 text-xs font-extrabold opacity-90">
                      <ArrowUpRight size={14} />
                      Keep climbing
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-xs opacity-85 relative">
                  Tip: click your row for score breakdown.
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Ranking table */}
      <div className="bg-white/90 border rounded-2xl shadow-sm mt-6 overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="font-extrabold text-gray-900">Ranking</div>
            <div className="text-xs text-gray-500 mt-1">
              Showing <span className="font-extrabold text-gray-900">{ranked.length}</span> creators
            </div>
          </div>
          <div className="text-xs text-gray-500">Top 3 shaded • Click row for breakdown</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500 font-extrabold">
                <Th>Rank</Th>
                <Th>Creator</Th>
                <Th>Platform</Th>
                <Th>Location</Th>
                <Th align="right">Score</Th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <>
                  <RowSkeleton />
                  <RowSkeleton />
                  <RowSkeleton />
                  <RowSkeleton />
                  <RowSkeleton />
                </>
              ) : ranked.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-sm text-gray-500">
                    No results for selected filters.
                  </td>
                </tr>
              ) : (
                ranked.map((r) => {
                  const isMe = r.name === currentUserName;
                  const isTop = r.rank <= 3;

                  return (
                    <tr
                      key={r.id}
                      onClick={() => openDrawer(r)}
                      className={[
                        "border-t cursor-pointer",
                        "transition-all",
                        "hover:bg-gray-50",
                        "active:scale-[0.999]",
                        isTop ? "bg-amber-50/60" : "bg-white",
                        isMe
                          ? "outline outline-2 outline-gray-900 -outline-offset-2 bg-gray-50 shadow-[0_0_0_6px_rgba(17,24,39,0.04)]"
                          : "",
                      ].join(" ")}
                    >
                      <Td>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-extrabold bg-white">
                          #{r.rank}
                        </span>
                      </Td>

                      <Td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 border flex items-center justify-center font-extrabold text-gray-700">
                            {initials(r.name)}
                          </div>
                          <div className="min-w-[180px]">
                            <div className="font-extrabold text-gray-900 flex items-center gap-2">
                              {r.name}
                              {isMe && (
                                <span className="text-[11px] font-extrabold px-2 py-1 rounded-full bg-gray-900 text-white">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">{r.month}</div>
                          </div>
                        </div>
                      </Td>

                      <Td>
                        <Pill>{r.platform}</Pill>
                      </Td>

                      <Td>
                        <Pill soft>{r.location}</Pill>
                      </Td>

                      <Td align="right">
                        <span className="font-extrabold text-gray-900">{r.score}</span>
                      </Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 text-xs text-gray-500 border-t bg-gray-50">
          Tip: add certificates/rewards/milestones or use /api/leaderboard/ingest to see changes instantly.
        </div>
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/35" onMouseDown={() => setDrawerOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[460px] bg-white shadow-2xl border-l">
            <div className="p-4 border-b flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-extrabold text-gray-500">SCORE BREAKDOWN</div>
                <div className="mt-1 font-extrabold text-gray-900 text-lg">
                  {drawerRow?.name || "-"}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {drawerRow?.platform} • {drawerRow?.location} • {drawerRow?.month}
                </div>
              </div>

              <button
                className="p-2 rounded-xl border hover:bg-gray-50"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close"
              >
                <X size={18} className="text-gray-700" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="rounded-2xl border bg-gradient-to-br from-gray-900 to-gray-700 text-white p-4 overflow-hidden relative">
                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
                <div className="text-xs font-extrabold opacity-90">Total score</div>
                <div className="mt-2 text-4xl font-extrabold">{drawerRow?.score ?? 0}</div>
                <div className="mt-2 text-xs opacity-85">
                  Weighted enterprise score (0–1000).
                </div>
              </div>

              <IndexBar label="Engagement index" value={drawerRow?.engagementIndex ?? 0} hint="Views, likes, comments, shares" />
              <IndexBar label="Conversion index" value={drawerRow?.conversionIndex ?? 0} hint="Leads + conversions" />
              <IndexBar label="Revenue index" value={drawerRow?.revenueIndex ?? 0} hint="Attributed revenue" />
              <IndexBar label="Growth index" value={drawerRow?.growthIndex ?? 0} hint="Rewards, milestones, certificates" />

              <div className="text-xs text-gray-500">
                These indices come from backend scoring; adjust weights there for enterprise tuning.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- UI parts ---------- */

function KPI({ label, value, accent }) {
  return (
    <div className="bg-white/90 border rounded-2xl shadow-sm p-4 relative overflow-hidden">
      <div className="text-xs font-extrabold text-gray-500">{label}</div>
      <div className={`mt-2 text-2xl font-extrabold ${accent ? "text-gray-900" : "text-gray-900"}`}>
        {value}
      </div>
      {accent ? <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gray-900/10 blur-2xl" /> : null}
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="bg-white/90 border rounded-2xl shadow-sm p-4">
      <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
      <div className="mt-3 h-7 w-20 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div className="bg-white/90 border rounded-2xl shadow-sm p-4">
      <div>
        <div className="font-extrabold text-gray-900">{title}</div>
        {subtitle ? <div className="text-xs text-gray-500 mt-1">{subtitle}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function CardSkeleton({ height = "h-24" }) {
  return (
    <div className={`rounded-2xl border bg-gray-50 p-4 ${height}`}>
      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
      <div className="mt-3 h-4 w-40 bg-gray-200 rounded animate-pulse" />
      <div className="mt-2 h-4 w-28 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}

function Empty() {
  return (
    <div className="p-4 rounded-2xl border border-dashed text-sm text-gray-500 bg-gray-50">
      No data for selected filters.
    </div>
  );
}

function SelectBox({ label, icon, value, onChange, options, format }) {
  return (
    <label className="grid gap-1.5">
      <div className="text-xs font-extrabold text-gray-500">{label}</div>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>
        <select
          className="w-full pl-10 pr-3 py-2.5 rounded-xl border bg-white text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-gray-900"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {format(o)}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

function PodiumCard({ place, data, currentUserName }) {
  if (!data) return null;
  const isMe = data.name === currentUserName;

  const tone =
    place === 1
      ? "from-amber-400 to-amber-600 text-white"
      : place === 2
      ? "from-slate-200 to-slate-400 text-slate-900"
      : "from-orange-200 to-orange-400 text-slate-900";

  return (
    <div className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${tone} shadow-sm transform transition hover:-translate-y-0.5 hover:shadow-md`}>
      <div className="pointer-events-none absolute -top-16 -left-16 h-40 w-40 rotate-12 bg-white/25 blur-xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-44 w-44 rounded-full bg-white/20" />

      <div className="flex items-start justify-between gap-3 relative">
        <div>
          <div className="text-xs font-extrabold opacity-90">#{place}</div>
          <div className="mt-2 text-base font-extrabold">{data.name}</div>
          <div className="mt-1 text-xs opacity-90">{data.platform} • {data.location}</div>
        </div>

        <div className="text-right">
          {isMe ? (
            <span className="inline-flex items-center rounded-full bg-black/25 px-2 py-1 text-xs font-extrabold text-white">
              You
            </span>
          ) : null}
          <div className="mt-2 text-xl font-extrabold">{data.score}</div>
        </div>
      </div>
    </div>
  );
}

function LocLeader({ label, leader }) {
  return (
    <div className="rounded-2xl border bg-gray-50 p-4 transition hover:bg-white hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div className="font-extrabold text-gray-900">{label}</div>
        <Pill soft>Leader</Pill>
      </div>

      {!leader ? (
        <div className="text-sm text-gray-500 mt-3">No data</div>
      ) : (
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <div className="font-extrabold text-gray-900">{leader.name}</div>
            <div className="text-xs text-gray-500 mt-1">{leader.platform}</div>
          </div>
          <div className="text-lg font-extrabold text-gray-900">{leader.score}</div>
        </div>
      )}
    </div>
  );
}

function Pill({ children, soft }) {
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-extrabold",
        soft ? "bg-gray-100 text-gray-700 border-gray-200" : "bg-white text-gray-900 border-gray-200",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function Th({ children, align }) {
  return <th className={`px-4 py-3 text-left ${align === "right" ? "text-right" : ""}`}>{children}</th>;
}

function Td({ children, align }) {
  return <td className={`px-4 py-3 text-sm ${align === "right" ? "text-right" : ""}`}>{children}</td>;
}

function RowSkeleton() {
  return (
    <tr className="border-t">
      <td className="px-4 py-4">
        <div className="h-6 w-14 bg-gray-200 rounded-full animate-pulse" />
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gray-200 rounded-2xl animate-pulse" />
          <div>
            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="mt-2 h-3 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
      </td>
      <td className="px-4 py-4">
        <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
      </td>
      <td className="px-4 py-4 text-right">
        <div className="ml-auto h-3 w-16 bg-gray-200 rounded animate-pulse" />
      </td>
    </tr>
  );
}

function IndexBar({ label, value, hint }) {
  const v = Math.max(0, Math.min(100, Number(value || 0)));
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold text-gray-900">{label}</div>
          <div className="text-xs text-gray-500 mt-1">{hint}</div>
        </div>
        <div className="text-sm font-extrabold text-gray-900">{v}/100</div>
      </div>
      <div className="mt-3 h-2.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gray-900 transition-all"
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}

function initials(name) {
  const parts = (name || "").trim().split(" ").filter(Boolean);
  const a = parts[0]?.[0] || "C";
  const b = parts[1]?.[0] || "";
  return (a + b).toUpperCase();
}

function escapeCSV(v) {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}