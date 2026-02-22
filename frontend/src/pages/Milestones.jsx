import { useEffect, useState } from "react";
import axios from "axios";

// ✅ If backend is on 5000, change to 5000
const API_BASE = "http://localhost:5004";

// ✅ Use backend "scope" + "scopeValue" for platform, NOT category parsing
function percent(current, target) {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.round((Number(current || 0) / Number(target)) * 100));
}

export default function Milestones() {
  const [milestones, setMilestones] = useState([]);
  const [bestCreatorsMonth, setBestCreatorsMonth] = useState([]);
  const [bestCreatorByCity, setBestCreatorByCity] = useState({ Berlin: null, Düsseldorf: null });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    setErrorMsg("");

    const cityUrl = `${API_BASE}/leaderboards/best-creator-by-city?cities=Berlin,${encodeURIComponent(
      "Düsseldorf"
    )}`;

    try {
      const [typesRes, monthRes, cityRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/milestone-types`),
        axios.get(`${API_BASE}/leaderboards/best-creators-month`),
        axios.get(cityUrl),
      ]);

      // ✅ Milestone types are REQUIRED for this page
      if (typesRes.status !== "fulfilled") throw typesRes.reason;

      const typesData = typesRes.value?.data || [];
      const mappedMilestones = typesData.map((t) => ({
        id: t._id || t.id,
        title: t.title || "Untitled",
        metric: t.metric || t.category || "unknown",
        // ✅ backend model: scope="platform", scopeValue="instagram"/"tiktok"/etc
        platform: t.scope === "platform" ? t.scopeValue : null,
        current: 0, // public view
        target: t.goal ?? 0,
        rewardPoints: t.rewardPoints ?? 0,
        description: t.description || "",
        computeMethod: t.computeMethod || "goal",
        period: t.period || "lifetime",
        scope: t.scope || "global",
        scopeValue: t.scopeValue ?? null,
        slots: t.slots ?? 1,
      }));
      setMilestones(mappedMilestones);

      // ✅ Leaderboards are OPTIONAL (page should not break if backend returns 404)
      const monthData = monthRes.status === "fulfilled" ? monthRes.value?.data || [] : [];
      const cityData =
        cityRes.status === "fulfilled"
          ? cityRes.value?.data || { Berlin: null, Düsseldorf: null }
          : { Berlin: null, Düsseldorf: null };

      setBestCreatorsMonth(monthData);
      setBestCreatorByCity(cityData);

      if (monthRes.status === "rejected" || cityRes.status === "rejected") {
        setErrorMsg("Leaderboards are not available yet. Showing milestones only.");
      }
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err.message ||
          "Failed to load data"
      );
      setMilestones([]);
      setBestCreatorsMonth([]);
      setBestCreatorByCity({ Berlin: null, Düsseldorf: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

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
        <div className="border rounded p-4 bg-yellow-50 text-yellow-900 mb-4">{errorMsg}</div>
      )}

      {!loading && milestones.length > 0 && (
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
                        <div className="font-medium">{c.name || c.creatorName || c.creatorId}</div>
                        {c.platform && (
                          <div className="text-xs text-gray-600 capitalize">{c.platform}</div>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-gray-700 text-right">
                      <div>
                        <span className="font-semibold">{c.points ?? c.value ?? c.awardValue ?? 0}</span>{" "}
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
                        <span className="font-semibold">{c.points ?? c.value ?? c.awardValue ?? 0}</span>{" "}
                        pts
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {milestones.map((m) => {
              const pct = percent(m.current, m.target);

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
                      {pct >= 100 ? "completed" : "not started"}
                    </span>
                  </div>

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

                  <div className="mt-4 text-sm text-gray-700">
                    <div>
                      Reward: <span className="font-semibold">{m.rewardPoints}</span> points
                    </div>
                    <div className="text-gray-500 mt-1">{m.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {!loading && milestones.length === 0 && !errorMsg && (
        <div className="border rounded p-4 bg-gray-50 text-gray-600">No milestones available.</div>
      )}
    </div>
  );
}