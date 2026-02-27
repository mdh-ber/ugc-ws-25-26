import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getCampaigns, deleteCampaign } from "../services/campaignService";

// ✅ EURO formatter
function formatMoney(n) {
  const num = Number(n || 0);
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(num);
}

export default function CampaignsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");

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

  // 🔎 FILTERED LIST
  const filtered = useMemo(() => {
    if (!search.trim()) return items;

    const q = search.toLowerCase();

    return items.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.platform?.toLowerCase().includes(q)
    );
  }, [items, search]);

  if (loading) return <div className="p-6">Loading campaigns...</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-semibold">Campaigns</h2>

        <button
          onClick={() => navigate("/campaigns/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Create Campaign
        </button>
      </div>

      {/* 🔎 SEARCH BAR */}
      <div className="mb-4">
        <input
          placeholder="Search by campaign name or platform..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3">Platform</th>
              <th className="p-3">Budget</th>
              <th className="p-3">Spent</th>
              <th className="p-3">Start</th>
              <th className="p-3">End</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((c) => (
              <tr key={c._id} className="border-t text-sm">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 text-center">{c.platform || "-"}</td>

                {/* ✅ EURO FORMAT APPLIED */}
                <td className="p-3 text-center">
                  {formatMoney(c.budget)}
                </td>
                <td className="p-3 text-center">
                  {formatMoney(c.spent)}
                </td>

                <td className="p-3 text-center">
                  {c.startDate
                    ? new Date(c.startDate).toLocaleDateString()
                    : "-"}
                </td>
                <td className="p-3 text-center">
                  {c.endDate
                    ? new Date(c.endDate).toLocaleDateString()
                    : "-"}
                </td>

                <td className="p-3 text-center">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                    {c.status}
                  </span>
                </td>

                <td className="p-3 text-center space-x-2">
                  <button
                    onClick={() => navigate(`/campaigns/${c._id}/edit`)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => onDelete(c._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>

                  <button
                    onClick={() => navigate(`/campaigns/${c._id}/roi`)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    View ROI
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No campaigns found
          </div>
        )}
      </div>
    </div>
  );
}