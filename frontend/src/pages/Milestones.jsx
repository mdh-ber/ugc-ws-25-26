import { useEffect, useState } from "react";
import axios from "axios";

const demoMilestones = [
  {
    id: "m1",
    title: "Clicks Goal",
    metric: "clicks",
    current: 320,
    target: 500,
    rewardPoints: 200,
    description: "Reach 500 clicks to unlock reward points.",
  },
  {
    id: "m2",
    title: "Posts Goal",
    metric: "posts",
    current: 6,
    target: 10,
    rewardPoints: 150,
    description: "Publish 10 posts.",
  },
  {
    id: "m3",
    title: "Points Goal",
    metric: "points",
    current: 850,
    target: 1200,
    rewardPoints: 300,
    description: "Earn 1200 points total.",
  },
];

function percent(current, target) {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.round((Number(current || 0) / Number(target)) * 100));
}

export default function Milestones() {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchMilestones = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      // If backend exists:
      // const res = await axios.get("/api/milestones");
      // setMilestones(res.data);

      // Until backend is confirmed, show demo UI:
      setMilestones(demoMilestones);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err.message || "Failed to load milestones");
      setMilestones(demoMilestones); // fallback so UI still shows
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold">Milestones</h2>

        <button
          onClick={fetchMilestones}
          className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-black"
        >
          Refresh
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        Track your progress toward different goal types (points, clicks, posts).
      </p>

      {loading && (
        <div className="border rounded p-4 bg-gray-50">Loading milestones...</div>
      )}

      {!loading && errorMsg && (
        <div className="border rounded p-4 bg-yellow-50 text-yellow-900 mb-4">
          {errorMsg}
        </div>
      )}

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
                </div>

                <span className="text-xs px-2 py-1 rounded-full border bg-gray-50">
                  {pct >= 100 ? "completed" : pct === 0 ? "not started" : "in progress"}
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
    </div>
  );
}
