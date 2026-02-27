// frontend/src/pages/Milestones.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getMilestoneTypes,
  getUserMilestones,
  getBestCreatorsMonth,
  getBestCreatorByCity,
} from "../services/milestoneService";

function percent(current, target) {
  if (!target || target <= 0) return 0;
  return Math.min(
    100,
    Math.round((Number(current || 0) / Number(target)) * 100)
  );
}

export default function Milestones() {
  const [milestones, setMilestones] = useState([]);
  const [bestCreatorsMonth, setBestCreatorsMonth] = useState([]);
  const [bestCreatorByCity, setBestCreatorByCity] = useState({
    Berlin: null,
    Düsseldorf: null,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const token = sessionStorage.getItem("token");
  const creatorId = sessionStorage.getItem("userId");
  const isLoggedIn = useMemo(() => Boolean(token && creatorId), [token, creatorId]);

  const mapTypesToUi = useCallback((types) => {
    return (types || []).map((t) => ({
      id: t._id || t.id,
      title: t.title || "Untitled",
      description: t.description || "",
      metric: t.metric || t.category || "unknown",
      platform: t.scope === "platform" ? t.scopeValue : null,
      target: t.goal ?? 0,
      rewardPoints: t.rewardPoints ?? 0,
      current: null, // ✅ only filled after login
      status: null,
    }));
  }, []);

  const mergeTypesWithUser = useCallback((typesUi, userItems) => {
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
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      // ✅ 1) Milestone catalog (required). If this fails, page is empty -> show error.
      const types = await getMilestoneTypes();
      const typesUi = mapTypesToUi(types);

      // ✅ 2) Leaderboards (optional). Failure should NOT break page.
      const cities = `Berlin,Düsseldorf`;
      const [monthRes, cityRes] = await Promise.allSettled([
        getBestCreatorsMonth(),
        getBestCreatorByCity(cities),
      ]);

      setBestCreatorsMonth(
        monthRes.status === "fulfilled" ? monthRes.value || [] : []
      );

      setBestCreatorByCity(
        cityRes.status === "fulfilled"
          ? cityRes.value || { Berlin: null, Düsseldorf: null }
          : { Berlin: null, Düsseldorf: null }
      );

      // ✅ 3) User progress only after login
      if (isLoggedIn) {
        const userItems = await getUserMilestones(creatorId);
        setMilestones(mergeTypesWithUser(typesUi, userItems));
      } else {
        setMilestones(typesUi); // ✅ show only what milestone page has (no progress)
      }
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Network Error"
      );
      setMilestones([]);
      setBestCreatorsMonth([]);
      setBestCreatorByCity({ Berlin: null, Düsseldorf: null });
    } finally {
      setLoading(false);
    }
  }, [creatorId, isLoggedIn, mapTypesToUi, mergeTypesWithUser]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

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

      {/* Top: Best Creator of the Month */}
      <div className="border rounded-xl p-4 bg-white shadow-sm mb-4">
        <h3 className="text-lg font-semibold">Best Creator of the Month</h3>

        {bestCreatorsMonth.length === 0 ? (
          <div className="text-sm text-gray-500 mt-3">No data available</div>
        ) : (
          <div className="mt-4 space-y-3">
            {bestCreatorsMonth.map((c, idx) => (
              <div
                key={c.id || c._id || c.creatorId || idx}
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
                    <div className="text-xs text-gray-500">
                      {(c.clicks ?? 0)} clicks • {(c.leads ?? 0)} leads
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-700">
                  <span className="font-semibold">
                    {c.points ?? c.value ?? c.awardValue ?? 0}
                  </span>{" "}
                  pts
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Side-by-side: Berlin + Düsseldorf */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
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

      {/* Milestones list: show catalog always; show progress only after login */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {milestones.length === 0 ? (
          <div className="border rounded p-4 bg-gray-50 text-gray-600">
            No milestones available.
          </div>
        ) : (
          milestones.map((m) => {
            const showProgress = isLoggedIn && m.current !== null;
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
                    {!showProgress
                      ? "available"
                      : pct >= 100
                      ? "completed"
                      : "in progress"}
                  </span>
                </div>

                {showProgress && (
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
                )}

                <div className="mt-4 text-sm text-gray-700">
                  <div>
                    Reward: <span className="font-semibold">{m.rewardPoints}</span>{" "}
                    points
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