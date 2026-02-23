import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCampaigns, deleteCampaign } from "../services/campaignService";

export default function CampaignsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    try {
      setErr("");
      setLoading(true);
      const data = await getCampaigns();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          e.message ||
          "Failed to load campaigns"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    if (!window.confirm("Delete this campaign?")) return;
    try {
      await deleteCampaign(id);
      await load();
    } catch (e) {
      alert(
        e?.response?.data?.message || e.message || "Delete failed"
      );
    }
  };

  if (loading) return <div className="p-4">Loading campaigns...</div>;
  if (err) return <div className="p-4 text-red-500">{err}</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Campaigns</h2>

        <button
          onClick={() => navigate("/campaigns/new")}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          + Create Campaign
        </button>
      </div>

      {items.length === 0 ? (
        <div>No campaigns found</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Platform</th>
                <th className="p-3 text-left">Budget</th>
                <th className="p-3 text-left">Spent</th>
                <th className="p-3 text-left">Start</th>
                <th className="p-3 text-left">End</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((c) => (
                <tr
                  key={c._id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3">{c.platform || "-"}</td>
                  <td className="p-3">
                    ₹{Number(c.budget ?? 0).toLocaleString()}
                  </td>
                  <td className="p-3">
                    ₹{Number(c.spent ?? 0).toLocaleString()}
                  </td>
                  <td className="p-3">
                    {c.startDate
                      ? new Date(c.startDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-3">
                    {c.endDate
                      ? new Date(c.endDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        c.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {c.status || "-"}
                    </span>
                  </td>

                  {/* Styled Buttons */}
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() =>
                        navigate(`/campaigns/${c._id}/edit`)
                      }
                      className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-xs"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => onDelete(c._id)}
                      className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-xs"
                    >
                      Delete
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/campaigns/${c._id}/roi`)
                      }
                      className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 text-xs"
                    >
                      View ROI
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}