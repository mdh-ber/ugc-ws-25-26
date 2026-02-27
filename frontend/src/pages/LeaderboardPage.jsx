import { useMemo, useState } from "react";
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
} from "lucide-react";

/**
 * Enterprise Leaderboard (Tailwind only)
 * - More styling effects (glow, gradients, glass filter bar, hover animation, podium shine)
 * - Current user highlighted + sticky position card
 * - Filters: Month, Platform, Location (Berlin/Düsseldorf)
 */

const PLATFORMS = ["All", "Instagram", "TikTok", "YouTube", "Facebook"];
const LOCATIONS = ["All", "Berlin", "Düsseldorf"];
const MONTHS = ["All", "2026-02", "2026-01", "2025-12"]; // demo months (YYYY-MM)

// Demo data
const demoCreators = [
  { id: "u1", name: "Aylin K.", score: 980, platform: "TikTok", location: "Berlin", month: "2026-02" },
  { id: "u2", name: "Sammy R.", score: 920, platform: "Instagram", location: "Düsseldorf", month: "2026-02" },
  { id: "u3", name: "John M.", score: 870, platform: "YouTube", location: "Berlin", month: "2026-02" },
  { id: "u4", name: "Lea S.", score: 820, platform: "TikTok", location: "Düsseldorf", month: "2026-02" },
  { id: "u5", name: "Fatima A.", score: 780, platform: "Instagram", location: "Berlin", month: "2026-02" },
  { id: "u6", name: "Noah P.", score: 745, platform: "Facebook", location: "Berlin", month: "2026-01" },
  { id: "u7", name: "Mia T.", score: 700, platform: "YouTube", location: "Düsseldorf", month: "2026-01" },
  { id: "u8", name: "Zara H.", score: 665, platform: "TikTok", location: "Berlin", month: "2026-01" },
  { id: "u9", name: "Ben L.", score: 620, platform: "Instagram", location: "Düsseldorf", month: "2025-12" },
  { id: "u10", name: "Nina W.", score: 590, platform: "TikTok", location: "Berlin", month: "2025-12" },
  { id: "u11", name: "Chris D.", score: 560, platform: "YouTube", location: "Berlin", month: "2026-02" },
  { id: "u12", name: "Lina F.", score: 540, platform: "Instagram", location: "Berlin", month: "2026-02" },
];

export default function LeaderboardPage() {
  // Later: get from auth user
  const currentUserId = "u4";

  const [month, setMonth] = useState("2026-02");
  const [platform, setPlatform] = useState("All");
  const [location, setLocation] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return demoCreators
      .filter((c) => (month === "All" ? true : c.month === month))
      .filter((c) => (platform === "All" ? true : c.platform === platform))
      .filter((c) => (location === "All" ? true : c.location === location))
      .filter((c) => (q ? c.name.toLowerCase().includes(q) : true));
  }, [month, platform, location, search]);

  const ranked = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => b.score - a.score);
    return sorted.map((c, idx) => ({ ...c, rank: idx + 1 }));
  }, [filtered]);

  const top3 = useMemo(() => ranked.slice(0, 3), [ranked]);
  const myRow = useMemo(() => ranked.find((r) => r.id === currentUserId) || null, [ranked]);

  const locationLeaders = useMemo(() => {
    const res = { Berlin: null, Düsseldorf: null };
    for (const loc of ["Berlin", "Düsseldorf"]) {
      const list = demoCreators
        .filter((c) => (month === "All" ? true : c.month === month))
        .filter((c) => (platform === "All" ? true : c.platform === platform))
        .filter((c) => c.location === loc)
        .sort((a, b) => b.score - a.score);
      res[loc] = list[0] || null;
    }
    return res;
  }, [month, platform]);

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
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Leaderboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Enterprise ranking view with filters and highlights.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-white/90 hover:bg-white shadow-sm text-sm font-extrabold text-gray-900 transition"
          >
            <Download size={16} />
            Export CSV
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-white/70 shadow-sm text-xs font-extrabold text-gray-600">
            <Sparkles size={14} />
            Enhanced dashboard effects
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        <KPI label="Creators in view" value={kpis.total} />
        <KPI label="Highest score" value={kpis.highest} />
        <KPI label="Average score" value={kpis.avg} />
        <KPI label="Your rank" value={kpis.myRank} accent />
      </div>

      {/* Filters (glassy sticky bar) */}
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
        {/* Top 3 */}
        <Card title="Top 3 creators of the month" subtitle="Auto-updates with filters">
          {top3.length === 0 ? (
            <Empty />
          ) : (
            <div className="grid gap-3">
              <PodiumCard place={1} data={top3[0]} currentUserId={currentUserId} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PodiumCard place={2} data={top3[1]} currentUserId={currentUserId} />
                <PodiumCard place={3} data={top3[2]} currentUserId={currentUserId} />
              </div>
            </div>
          )}
        </Card>

        {/* Location leaders */}
        <Card title="Location leaders" subtitle="Berlin vs Düsseldorf (month + platform)">
          <div className="grid gap-3">
            <LocLeader label="Berlin" leader={locationLeaders.Berlin} />
            <LocLeader label="Düsseldorf" leader={locationLeaders.Düsseldorf} />
          </div>
        </Card>

        {/* Your position */}
        <div className="lg:sticky lg:top-28 h-fit">
          <Card title="Your position" subtitle="Highlighted in the table">
            {!myRow ? (
              <div className="text-sm text-gray-500">
                You’re not visible in this view. Try changing filters.
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
                  Your row is outlined below.
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
          <div className="text-xs text-gray-500">Top 3 shaded • You outlined</div>
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
              {ranked.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-sm text-gray-500">
                    No results for selected filters.
                  </td>
                </tr>
              ) : (
                ranked.map((r) => {
                  const isMe = r.id === currentUserId;
                  const isTop = r.rank <= 3;

                  return (
                    <tr
                      key={r.id}
                      className={[
                        "border-t",
                        "transition-all",
                        "hover:bg-gray-50",
                        "hover:shadow-[inset_0_0_0_9999px_rgba(0,0,0,0.01)]",
                        isTop ? "bg-amber-50/60" : "bg-white",
                        isMe ? "outline outline-2 outline-gray-900 -outline-offset-2 bg-gray-50" : "",
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
          Enterprise tip: compare like-for-like (same month/platform) for fair ranking.
        </div>
      </div>
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
      {accent ? (
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gray-900/10 blur-2xl" />
      ) : null}
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

function PodiumCard({ place, data, currentUserId }) {
  if (!data) return null;

  const isMe = data.id === currentUserId;

  const tone =
    place === 1
      ? "from-amber-400 to-amber-600 text-white"
      : place === 2
      ? "from-slate-200 to-slate-400 text-slate-900"
      : "from-orange-200 to-orange-400 text-slate-900";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${tone} shadow-sm transform transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      {/* Shine */}
      <div className="pointer-events-none absolute -top-16 -left-16 h-40 w-40 rotate-12 bg-white/25 blur-xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-44 w-44 rounded-full bg-white/20" />

      <div className="flex items-start justify-between gap-3 relative">
        <div>
          <div className="text-xs font-extrabold opacity-90">#{place}</div>
          <div className="mt-2 text-base font-extrabold">{data.name}</div>
          <div className="mt-1 text-xs opacity-90">
            {data.platform} • {data.location}
          </div>
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
  return (
    <th className={`px-4 py-3 text-left ${align === "right" ? "text-right" : ""}`}>
      {children}
    </th>
  );
}

function Td({ children, align }) {
  return (
    <td className={`px-4 py-3 text-sm ${align === "right" ? "text-right" : ""}`}>
      {children}
    </td>
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