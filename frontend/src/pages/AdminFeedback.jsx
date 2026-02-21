import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export default function AdminFeedback() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [page, setPage] = useState(1);

  const limit = 10;

  // IMPORTANT: Must match where you stored token (browser console earlier)
  const token = sessionStorage.getItem("token");

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setErrMsg("");

      const res = await axios.get(
        `${API_BASE}/feedback?page=${page}&limit=${limit}&resolved=all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setItems(res.data.items || []);
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 401) {
        setErrMsg("Unauthorized: Admin token missing/invalid. Please login again.");
      } else if (err?.response?.status === 403) {
        setErrMsg("Forbidden: You are not an admin.");
      } else {
        setErrMsg(err?.response?.data?.message || "Failed to load feedback");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setErrMsg("Admin token missing. Please login as admin first.");
      return;
    }
    fetchFeedback();
  }, [page, token]);

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this feedback?");
    if (!ok) return;

    try {
      await axios.delete(`${API_BASE}/feedback/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove from UI instantly
      setItems((prev) => prev.filter((fb) => fb._id !== id));
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to delete feedback");
    }
  };

  const handleResolve = async (id, nextResolved) => {
    try {
      const res = await axios.patch(
        `${API_BASE}/feedback/${id}/resolve`,
        { resolved: nextResolved },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update UI instantly
      setItems((prev) => prev.map((fb) => (fb._id === id ? res.data : fb)));
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to update feedback");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Admin • Feedback</h1>

        <button
          onClick={fetchFeedback}
          className="px-4 py-2 rounded-lg border hover:bg-gray-50"
          disabled={loading || !token}
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
            <div
              key={fb._id}
              className="bg-white rounded-xl border p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-sm text-gray-500">
                    {fb.createdAt ? new Date(fb.createdAt).toLocaleString() : ""}
                  </div>

                  <div className="mt-2 whitespace-pre-wrap text-gray-900">
                    {fb.message}
                  </div>

                  <div className="mt-2 text-sm">
                    Status:{" "}
                    <span
                      className={
                        fb.resolved ? "text-green-700" : "text-orange-700"
                      }
                    >
                      {fb.resolved ? "Resolved" : "Unresolved"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleResolve(fb._id, !fb.resolved)}
                    className="px-3 py-2 rounded-lg border hover:bg-gray-50"
                    disabled={!token}
                  >
                    {fb.resolved ? "Mark Unresolved" : "Mark Resolved"}
                  </button>

                  <button
                    onClick={() => handleDelete(fb._id)}
                    className="px-3 py-2 rounded-lg border border-red-200 hover:bg-red-50 text-red-700"
                    disabled={!token}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <button
          className="px-4 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
          disabled={page <= 1 || loading}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>

        <div className="text-sm text-gray-700">Page {page}</div>

        <button
          className="px-4 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
          disabled={loading}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}