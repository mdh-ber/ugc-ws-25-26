import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function UuOverview() {
  const [activeTab, setActiveTab] = useState("referral");
  const [series, setSeries] = useState([]);
  const [range, setRange] = useState("7");

  // ✅ NEW: members modal states
  const [openMembers, setOpenMembers] = useState(false);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  useEffect(() => {
    const url =
      activeTab === "referral"
        ? "http://localhost:5000/api/uu/referral/users"
        : "http://localhost:5000/api/uu/referee/users";

    axios
      .get(url, { params: { days: range } })
      .then((res) => setSeries(res.data.series || []))
      .catch((err) => console.error(err));
  }, [activeTab, range]);

  const metrics = useMemo(() => {
    if (!series.length) return { total: 0, avg: 0 };

    const total = series.reduce((sum, item) => sum + item.uu, 0);
    const avg = (total / series.length).toFixed(1);

    return { total, avg };
  }, [series]);

  // ✅ NEW: Fetch members on click
  const fetchMembers = async () => {
    try {
      setMembersLoading(true);

      // call backend members endpoint based on tab
      const url =
        activeTab === "referral"
          ? "http://localhost:5000/api/uu/referral/members"
          : "http://localhost:5000/api/uu/referee/members";

      const res = await axios.get(url, { params: { days: range } });

      setMembers(res.data.members || []);
      setOpenMembers(true);
    } catch (err) {
      console.error(err);
    } finally {
      setMembersLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-4 w-full max-w-3xl mx-auto mt-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Unique Users Overview
        </h2>

        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="border text-sm rounded-md px-2 py-1 bg-gray-50"
        >
          <option value="7">7d</option>
          <option value="30">30d</option>
          <option value="90">90d</option>
        </select>
      </div>

      {/* KPI Mini Cards */}
      <div className="flex gap-4 mb-4 text-sm">
        {/* ✅ CLICKABLE e Users */}
        <button
          onClick={fetchMembers}
          className="bg-gray-50 px-3 py-2 rounded-lg text-left hover:bg-gray-100"
        >
          <p className="text-gray-500">Total Unique Users</p>
          <p className="font-semibold">{metrics.total}</p>
          <p className="text-xs text-gray-400 mt-1">Click to view members</p>
        </button>

        <div className="bg-gray-50 px-3 py-2 rounded-lg">
          <p className="text-gray-500">Avg Unique Users / Day</p>
          <p className="font-semibold">{metrics.avg}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {["referral", "referee"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 text-sm rounded-md transition ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-gray-50 rounded-lg p-2">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip formatter={(value) => [`${value}`, "Unique Users"]} />
            <Line
              type="monotone"
              dataKey="uu"
              name="Unique Users"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ✅ MEMBERS MODAL */}
      {openMembers && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-semibold">
                {activeTab.toUpperCase()} Members ({members.length})
              </h3>

              <button
                onClick={() => setOpenMembers(false)}
                className="text-sm px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
              >
                Close
              </button>
            </div>

            {membersLoading ? (
              <div className="text-sm text-gray-500 p-3">Loading...</div>
            ) : members.length === 0 ? (
              <div className="text-sm text-gray-500 p-3">No members found.</div>
            ) : (
              <div className="max-h-80 overflow-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 px-2">Member ID</th>
                      <th className="py-2 px-2">Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 font-medium">{m.id}</td>
                        <td className="py-2 px-2">{m.name || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
