import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  BookOpen,
} from "lucide-react";
import { getReferrals } from "../services/referralService";

export default function ReferralList() {
  // State for referrals data
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("referralDate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterIntake, setFilterIntake] = useState("all");
  const [filterEnrollmentStatus, setFilterEnrollmentStatus] = useState("all");
  const [filterRewardStatus, setFilterRewardStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - Replace with actual API call
  useEffect(() => {
    // Actual API call
    const fetchReferrals = async () => {
      try {
        setLoading(true);
        const data = await getReferrals();
        setReferrals(data);
      } catch (err) {
        console.error("Error fetching referrals:", err);
        setError("Failed to fetch referrals");
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, []);

  // Filter and sort referrals
  const filteredAndSortedReferrals = useMemo(() => {
    let filtered = referrals.filter((referral) => {
      const fullName =
        `${referral.firstName} ${referral.surName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        referral.enrolledCourse
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        referral.referredBy.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesIntake =
        filterIntake === "all" || referral.intake === filterIntake;
      const matchesEnrollmentStatus =
        filterEnrollmentStatus === "all" ||
        referral.enrollmentStatus === filterEnrollmentStatus;
      const matchesRewardStatus =
        filterRewardStatus === "all" ||
        referral.rewardStatus === filterRewardStatus;

      return (
        matchesSearch &&
        matchesIntake &&
        matchesEnrollmentStatus &&
        matchesRewardStatus
      );
    });

    // Sort filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "name":
          aValue = `${a.firstName} ${a.surName}`;
          bValue = `${b.firstName} ${b.surName}`;
          break;
        case "intake":
          aValue = `${a.intake} ${a.year}`;
          bValue = `${b.intake} ${b.year}`;
          break;
        case "referralDate":
          aValue = new Date(a.referralDate);
          bValue = new Date(b.referralDate);
          break;
        default:
          aValue = a[sortField];
          bValue = b[sortField];
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    referrals,
    searchTerm,
    sortField,
    sortDirection,
    filterIntake,
    filterEnrollmentStatus,
    filterRewardStatus,
  ]);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get status badge style
  const getStatusBadge = (status, type) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";

    if (type === "enrollment") {
      switch (status) {
        case "Enrolled":
          return `${baseClasses} bg-green-100 text-green-800`;
        case "Pending":
          return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case "Not Enrolled":
          return `${baseClasses} bg-red-100 text-red-800`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`;
      }
    } else if (type === "reward") {
      switch (status) {
        case "Approved":
          return `${baseClasses} bg-green-100 text-green-800`;
        case "Pending":
          return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case "Rejected":
          return `${baseClasses} bg-red-100 text-red-800`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`;
      }
    }
    return `${baseClasses} bg-gray-100 text-gray-800`;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading referrals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Referral List</h1>
          <p className="text-gray-600 mt-1">
            Monitor applicant referrals and reward status
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <User size={16} />
          <span>{filteredAndSortedReferrals.length} referrals</span>
        </div>
      </div>

      {/* Summary Stats */}
      {filteredAndSortedReferrals.length > 0 && (
        <div className="space-y-4 mb-6">
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-gray-900">
                {filteredAndSortedReferrals.length}
              </div>
              <div className="text-md text-gray-600">Total Referrals</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-green-800">
                {
                  filteredAndSortedReferrals.filter(
                    (r) => r.enrollmentStatus === "Enrolled",
                  ).length
                }
              </div>
              <div className="text-md text-green-600">Enrolled</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-yellow-800">
                {
                  filteredAndSortedReferrals.filter(
                    (r) => r.enrollmentStatus === "Pending",
                  ).length
                }
              </div>
              <div className="text-md text-yellow-600">Pending</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-blue-800">
                {
                  filteredAndSortedReferrals.filter(
                    (r) => r.rewardStatus === "Approved",
                  ).length
                }
              </div>
              <div className="text-md text-blue-600">Rewards Approved</div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        {/* Search Bar */}
        <div className="relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name, course, or referrer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            <Filter size={16} />
            <span>Filters</span>
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* Clear filters */}
          {(filterIntake !== "all" ||
            filterEnrollmentStatus !== "all" ||
            filterRewardStatus !== "all") && (
            <button
              onClick={() => {
                setFilterIntake("all");
                setFilterEnrollmentStatus("all");
                setFilterRewardStatus("all");
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Filter Controls */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intake
              </label>
              <select
                value={filterIntake}
                onChange={(e) => setFilterIntake(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Intakes</option>
                <option value="Winter">Winter</option>
                <option value="Summer">Summer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enrollment Status
              </label>
              <select
                value={filterEnrollmentStatus}
                onChange={(e) => setFilterEnrollmentStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="Enrolled">Enrolled</option>
                <option value="Pending">Pending</option>
                <option value="Not Enrolled">Not Enrolled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reward Status
              </label>
              <select
                value={filterRewardStatus}
                onChange={(e) => setFilterRewardStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Rewards</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left border-b border-gray-200">
              <th className="p-3">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900"
                >
                  Applicant Name
                  {sortField === "name" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </button>
              </th>
              <th className="p-3">
                <button
                  onClick={() => handleSort("intake")}
                  className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900"
                >
                  <Calendar size={16} />
                  Intake
                  {sortField === "intake" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </button>
              </th>
              <th className="p-3">
                <button
                  onClick={() => handleSort("enrolledCourse")}
                  className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900"
                >
                  <BookOpen size={16} />
                  Course
                  {sortField === "enrolledCourse" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </button>
              </th>
              <th className="p-3">
                <button
                  onClick={() => handleSort("referredBy")}
                  className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900"
                >
                  Referred By
                  {sortField === "referredBy" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </button>
              </th>
              <th className="p-3">
                <button
                  onClick={() => handleSort("referralDate")}
                  className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900"
                >
                  Referral Date
                  {sortField === "referralDate" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </button>
              </th>
              <th className="p-3">
                <button
                  onClick={() => handleSort("enrollmentStatus")}
                  className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900"
                >
                  Enrollment Status
                  {sortField === "enrollmentStatus" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </button>
              </th>
              <th className="p-3">
                <button
                  onClick={() => handleSort("rewardStatus")}
                  className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900"
                >
                  Reward Status
                  {sortField === "rewardStatus" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedReferrals.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">
                  No referrals found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredAndSortedReferrals.map((referral) => (
                <tr
                  key={referral.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="p-3">
                    <div className="font-medium text-gray-900">
                      {referral.firstName} {referral.surName}
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">
                    {referral.intake} {referral.year}
                  </td>
                  <td className="p-3 text-gray-600">
                    {referral.enrolledCourse}
                  </td>
                  <td className="p-3 text-gray-600">{referral.referredBy}</td>
                  <td className="p-3 text-gray-600">
                    {formatDate(referral.referralDate)}
                  </td>
                  <td className="p-3">
                    <span
                      className={getStatusBadge(
                        referral.enrollmentStatus,
                        "enrollment",
                      )}
                    >
                      {referral.enrollmentStatus}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={getStatusBadge(
                        referral.rewardStatus,
                        "reward",
                      )}
                    >
                      {referral.rewardStatus}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
