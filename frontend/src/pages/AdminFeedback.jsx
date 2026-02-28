import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminFeedback() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setErrMsg("");

      const res = await api.get("/feedback"); // ✅ matches backend

      // backend might return [] OR {items: []}
      const data = Array.isArray(res.data) ? res.data : res.data.items || [];
      setItems(data);
    } catch (err) {
      console.error(err);
      setErrMsg(err?.response?.data?.message || "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Feedback</h1>

        <button
          onClick={fetchFeedback}
          className="px-4 py-2 rounded-lg border hover:bg-gray-50"
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {errMsg && (
        <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700">
          {errMsg}
        </div>
      )}

      {loading ? (
        <div className="text-gray-600">Loading feedback...</div>
      ) : items.length === 0 ? (
        <div className="text-gray-600">No feedback received yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((fb) => (
            <div key={fb._id} className="bg-white rounded-xl border p-4 shadow-sm">
              <div className="text-sm text-gray-500">
                {fb.createdAt ? new Date(fb.createdAt).toLocaleString() : ""}
              </div>

              <div className="mt-2 whitespace-pre-wrap text-gray-900">
                {fb.feedback || fb.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}