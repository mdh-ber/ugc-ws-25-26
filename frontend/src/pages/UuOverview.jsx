<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import {
  getRefereeOverview,
  getRefereeMembers,
  getRefereeDetails,
  getReferralOverview,
  getReferralMembers,
  getReferralDetails,
} from "../services/uuService";

=======
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
<<<<<<< HEAD
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function UuOverview() {
  const [tab, setTab] = useState("referral"); // "referral" | "referee"
  const [days, setDays] = useState(7);

  const [overview, setOverview] = useState([]);
  const [members, setMembers] = useState([]);

  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [details, setDetails] = useState(null);

  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // ---------- Load Overview ----------
  const loadOverview = async () => {
    try {
      setLoadingOverview(true);

      const res =
        tab === "referee"
          ? await getRefereeOverview({ days })
          : await getReferralOverview({ days });

      setOverview(res?.series || []);
    } catch (e) {
      console.error("Overview API error:", e);
      setOverview([]);
    } finally {
      setLoadingOverview(false);
    }
  };

  // ---------- Load Members ----------
  const loadMembers = async () => {
    try {
      setLoadingMembers(true);

      const res =
        tab === "referee"
          ? await getRefereeMembers({ days })
          : await getReferralMembers({ days });

      const list = res?.members || [];
      setMembers(list);

      if (list.length > 0) {
        setSelectedMemberId(list[0].id);
      } else {
        setSelectedMemberId("");
        setDetails(null);
      }
    } catch (e) {
      console.error("Members API error:", e);
      setMembers([]);
      setSelectedMemberId("");
      setDetails(null);
    } finally {
      setLoadingMembers(false);
    }
  };

  // ---------- Load Details ----------
  const loadDetails = async (id) => {
    if (!id) return;

    try {
      setLoadingDetails(true);

      const res =
        tab === "referee"
          ? await getRefereeDetails(id, { days })
          : await getReferralDetails(id, { days });

      setDetails(res);
    } catch (e) {
      console.error("Details API error:", e);
      setDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    setDetails(null);
    setSelectedMemberId("");
    loadOverview();
    loadMembers();
    
  }, [tab, days]);

  useEffect(() => {
    if (selectedMemberId) loadDetails(selectedMemberId);
    
  }, [selectedMemberId]);

  const summary = useMemo(() => {
    return details?.summary || { totalUu: 0, avgDailyUu: 0, peakUu: 0 };
  }, [details]);

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-start justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            Unique Users Overview
          </h1>

          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="border rounded-md px-3 py-1 text-sm"
          >
            <option value={7}>7d</option>
            <option value={14}>14d</option>
            <option value={30}>30d</option>
          </select>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Total Unique Users</div>
            <div className="text-2xl font-bold text-gray-900">
              {summary.totalUu}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Click a member to view details
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Avg Unique Users / Day</div>
            <div className="text-2xl font-bold text-gray-900">
              {summary.avgDailyUu}
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setTab("referral")}
            className={`px-4 py-2 rounded-md text-sm ${
              tab === "referral"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Referral
          </button>

          <button
            onClick={() => setTab("referee")}
            className={`px-4 py-2 rounded-md text-sm ${
              tab === "referee"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Referee
          </button>
        </div>

        <div
          className="mt-4 bg-white rounded-lg border p-3"
          style={{ height: 260 }}
        >
          {loadingOverview ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              Loading chart...
            </div>
          ) : overview.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              No data yet...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overview}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="uu" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="font-semibold mb-2 text-gray-800">Members</div>

            {loadingMembers ? (
              <div className="border rounded-lg p-4 text-gray-500">
                Loading members...
              </div>
            ) : members.length === 0 ? (
              <div className="border rounded-lg p-4 text-gray-500">
                No members found...
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                {members.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMemberId(m.id)}
                    className={`w-full text-left p-3 border-b last:border-b-0 hover:bg-gray-50 ${
                      selectedMemberId === m.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="font-medium text-gray-900">{m.name}</div>
                    <div className="text-xs text-gray-500">
                      Total UU: {m.totalUu}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="font-semibold mb-2 text-gray-800">Details</div>

            {!selectedMemberId ? (
              <div className="border rounded-lg p-4 text-gray-500">
                Select a member to view details
              </div>
            ) : loadingDetails ? (
              <div className="border rounded-lg p-4 text-gray-500">
                Loading details...
              </div>
            ) : !details ? (
              <div className="border rounded-lg p-4 text-gray-500">
                No details found...
              </div>
            ) : (
              <div className="border rounded-lg p-4">
                {details.profile && (
                  <div className="mb-3">
                    <div className="font-semibold text-gray-900">
                      {details.profile.firstName} {details.profile.surName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {details.profile.enrolledCourse}
                    </div>
                    <div className="text-xs text-gray-500">
                      Status: {details.profile.enrollmentStatus} | Reward:{" "}
                      {details.profile.rewardStatus}
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-700">
                  <div>Total UU: {details.summary.totalUu}</div>
                  <div>Avg Daily: {details.summary.avgDailyUu}</div>
                  <div>Peak UU: {details.summary.peakUu}</div>
                  <div>Peak Date: {details.summary.peakDate || "-"}</div>
                </div>

                <div className="mt-4" style={{ height: 220 }}>
                  {details.series?.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={details.series}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="uu" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      No series data...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
=======
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
        ? "http://localhost:5000/api/uu/referral/overview"
        : "http://localhost:5000/api/uu/referee/overview";

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
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
