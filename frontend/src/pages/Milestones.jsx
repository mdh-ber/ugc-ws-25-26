import { useEffect, useMemo, useState } from "react";
import axios from "axios";

/**
 * Public (NOT logged in):
 *  - show DEMO milestones (static) so page is never empty
 *
 * Logged in:
 *  - fetch milestone-types + user-milestones/:creatorId (+ leaderboards optional)
 *  - show real user progress
 */

const demoMilestones = [
  {
    id: "demo-1",
    title: "Clicks Goal",
    description: "Reach 500 clicks to unlock reward points.",
    metric: "clicks",
    platform: null,
    target: 500,
    rewardPoints: 200,
    current: null, // public mode (no user progress)
  },
  {
    id: "demo-2",
    title: "Posts Goal",
    description: "Publish 10 posts.",
    metric: "posts",
    platform: null,
    target: 10,
    rewardPoints: 150,
    current: null,
  },
  {
    id: "demo-3",
    title: "Creator of Platforms",
    description: "Post across platforms to reach the goal.",
    metric: "posts",
    platform: "all",
    target: 10,
    rewardPoints: 300,
    current: null,
  },
];

function percent(current, target) {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.round((Number(current || 0) / Number(target)) * 100));
}

/**
 * ✅ Robust base+path discovery (fixes Network Error when ports/routes differ)
 * Add/remove candidates based on your repo setup.
 */
const BASE_CANDIDATES = ["", "http://localhost:5000", "http://localhost:5000/api", "http://localhost:5004"];

const PATHS = {
  milestoneTypes: ["/milestone-types", "/api/milestone-types"],
  userMilestones: (creatorId) => [`/user-milestones/${creatorId}`, `/api/user-milestones/${creatorId}`],
  bestMonth: ["/leaderboards/best-creators-month", "/api/leaderboards/best-creators-month"],
  bestByCity: (cities) => [`/leaderboards/best-creator-by-city?cities=${cities}`, `/api/leaderboards/best-creator-by-city?cities=${cities}`],
};

function joinUrl(base, path) {
  if (!base) return path;
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

async function tryGetAny(paths, headers) {
  let lastErr = null;

  for (const base of BASE_CANDIDATES) {
    for (const path of paths) {
      const url = joinUrl(base, path);
      try {
        const res = await axios.get(url, { headers });
        return { data: res.data, base, path };
      } catch (e) {
        lastErr = e;
      }
    }
  }

  throw lastErr || new Error("Network Error");
}

export default function Milestones() {
  const [milestones, setMilestones] = useState(demoMilestones);
  const [bestCreatorsMonth, setBestCreatorsMonth] = useState([]);
  const [bestCreatorByCity, setBestCreatorByCity] = useState({ Berlin: null, Düsseldorf: null });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const token = sessionStorage.getItem("token");
  const creatorId = sessionStorage.getItem("userId"); // must be set after login

  const isLoggedIn = Boolean(token && creatorId);

  const authHeaders = useMemo(() => {
    if (!token) return undefined;
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  const mapTypesToUi = (types) =>
    (types || []).map((t) => ({
      id: t._id || t.id,
      title: t.title || "Untitled",
      description: t.description || "",
      metric: t.metric || t.category || "unknown",
      platform: t.scope === "platform" ? t.scopeValue : null,
      target: t.goal ?? 0,
      rewardPoints: t.rewardPoints ?? 0,
      current: 0, // logged-in progress starts at 0 unless user milestone exists
      status: "in_progress",
    }));

  const mergeTypesWithUser = (typesUi, userItems) => {
    const byTypeId = new Map(
      (userItems || []).map((u) => [
        String(u?.milestoneTypeId?._id || u?.milestoneTypeId),
        u,
      ])
    );

    return (typesUi || []).map((t) => {
      const u = byTypeId.get(String(t.id));
      return {
        ...t,
        current: u ? u.progress ?? 0 : 0,
        status: u?.status || "in_progress",
      };
    });
  };

  const fetchLoggedInData = async () => {
    // 1) milestone types (required)
    const typesRes = await tryGetAny(PATHS.milestoneTypes, authHeaders);
    const typesUi = mapTypesToUi(typesRes.data);

    // 2) user milestones (required for progress)
    const userRes = await tryGetAny(PATHS.userMilestones(creatorId), authHeaders);
    const merged = mergeTypesWithUser(typesUi, userRes.data || []);
    setMilestones(merged);

    // 3) leaderboards (optional)
    const cities = `Berlin,${encodeURIComponent("Düsseldorf")}`;

    try {
      const monthRes = await tryGetAny(PATHS.bestMonth, authHeaders);
      setBestCreatorsMonth(monthRes.data || []);
    } catch {
      setBestCreatorsMonth([]);
    }

    try {
      const cityRes = await tryGetAny(PATHS.bestByCity(cities), authHeaders);
      setBestCreatorByCity(cityRes.data || { Berlin: null, Düsseldorf: null });
    } catch {
      setBestCreatorByCity({ Berlin: null, Düsseldorf: null });
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      if (!isLoggedIn) {
        // ✅ Public: show demo (no network calls)
        setMilestones(demoMilestones);
        setBestCreatorsMonth([]);
        setBestCreatorByCity({ Berlin: null, Düsseldorf: null });
      } else {
        // ✅ Logged in: fetch real data
        await fetchLoggedInData();
      }
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Network Error"
      );

      // fallback: keep page usable
      setMilestones(isLoggedIn ? [] : demoMilestones);
      setBestCreatorsMonth([]);
      setBestCreatorByCity({ Berlin: null, Düsseldorf: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []); // no eslint comment

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold">Milestones</h2>

        <button
          onClick={fetchAll}
          className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-black"
        >
          Refresh
        </button>
      </div>

      {loading && <div className="border rounded p-4 bg-gray-50">Loading...</div>}

      {!loading && errorMsg && (
        <div className="border rounded p-4 bg-yellow-50 text-yellow-900 mb-4">
          {errorMsg}
        </div>
      )}

      {!loading && !isLoggedIn && (
        <div className="border rounded p-4 bg-blue-50 text-blue-900 mb-6">
          You are viewing demo milestones. Login to see your personal progress and leaderboards.
        </div>
      )}

      {!loading && isLoggedIn && (
        <>
          <div className="border rounded-xl p-4 bg-white shadow-sm mb-6">
            <h3 className="text-lg font-semibold">Best Creators of the Month</h3>

            {bestCreatorsMonth.length === 0 ? (
              <div className="text-sm text-gray-500 mt-3">No data available</div>
            ) : (
              <div className="mt-4 space-y-3">
                {bestCreatorsMonth.map((c, idx) => (
                  <div
                    key={c.id || c._id || c.creatorId || `${c.name}-${idx}`}
                    className="flex items-center justify-between border rounded-lg p-3 bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-medium">
                          {c.name || c.creatorName || c.creatorId}
                        </div>
                        {c.platform && (
                          <div className="text-xs text-gray-600 capitalize">{c.platform}</div>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-gray-700 text-right">
                      <div>
                        <span className="font-semibold">
                          {c.points ?? c.value ?? c.awardValue ?? 0}
                        </span>{" "}
                        pts
                      </div>
                      <div className="text-xs text-gray-500">
                        {(c.clicks ?? 0)} clicks • {(c.leads ?? 0)} leads
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {["Berlin", "Düsseldorf"].map((city) => {
              const c = bestCreatorByCity?.[city];
              return (
                <div key={city} className="border rounded-xl p-4 bg-white shadow-sm">
                  <h3 className="text-lg font-semibold">Best Creator of {city}</h3>

                  {!c ? (
                    <div className="text-sm text-gray-500 mt-3">No data available</div>
                  ) : (
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {c.name || c.creatorName || c.creatorId}
                        </div>
                        <div className="text-xs text-gray-500">
                          {(c.clicks ?? 0)} clicks • {(c.leads ?? 0)} leads
                        </div>
                      </div>
                      <div className="text-sm text-gray-700">
                        <span className="font-semibold">
                          {c.points ?? c.value ?? c.awardValue ?? 0}
                        </span>{" "}
                        pts
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {milestones.length === 0 ? (
          <div className="border rounded p-4 bg-gray-50 text-gray-600">
            No milestones available.
          </div>
        ) : (
          milestones.map((m) => {
            const showProgress = isLoggedIn; // only show progress after login
            const pct = showProgress ? percent(m.current, m.target) : 0;

            return (
              <div key={m.id} className="border rounded-xl p-4 bg-white shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{m.title}</h3>
                    <div className="text-sm text-gray-600">
                      Metric: <span className="font-medium">{m.metric}</span>
                    </div>
                    {m.platform && (
                      <div className="text-sm text-gray-600">
                        Platform:{" "}
                        <span className="font-medium capitalize">{m.platform}</span>
                      </div>
                    )}
                  </div>

                  <span className="text-xs px-2 py-1 rounded-full border bg-gray-50">
                    {!showProgress ? "available" : pct >= 100 ? "completed" : "in progress"}
                  </span>
                </div>

                {showProgress ? (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-700 mb-2">
                      <span>
                        {m.current} / {m.target}
                      </span>
                      <span className="font-semibold">{pct}%</span>
                    </div>

                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-2 bg-blue-600" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-gray-500">
                    Login to track your progress for this milestone.
                  </div>
                )}

                <div className="mt-4 text-sm text-gray-700">
                  <div>
                    Reward: <span className="font-semibold">{m.rewardPoints}</span> points
                  </div>
                  <div className="text-gray-500 mt-1">{m.description}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}