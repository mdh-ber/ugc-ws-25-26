import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  BookOpen,
  Download,
  Eye,
  MapPin,
  X,
  ExternalLink,
  AlertTriangle,
  Users,
} from "lucide-react";
import { getReferrals } from "../services/referralService";
import * as XLSX from "xlsx"; // Install with: npm install xlsx

export default function ReferralList() {
  // State for referrals data
  const [referrals, setReferrals] = useState([]);
  const [referralsCode, setReferralsCode] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("referralDate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterIntake, setFilterIntake] = useState("all");
  const [filterEnrollmentStatus, setFilterEnrollmentStatus] = useState("all");
  const [filterRewardStatus, setFilterRewardStatus] = useState("all");
  const [filterApplicantLocation, setFilterApplicantLocation] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(null);

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

  // ...existing code...
  // Filter and sort referrals
  const filteredAndSortedReferrals = useMemo(() => {
    let filtered = referrals.filter((referral) => {
      const fullName =
        `${referral.firstName || ""} ${referral.surName || ""}`.toLowerCase();
      const course = (referral.enrolledCourse || "").toLowerCase();
      const referrer = 
        `${referral.referralCodeId.userId.firstName || ""} ${referral.referralCodeId.userId.lastName || ""}`.toLowerCase(); 
      const location = (referral.applicantLocation || "").toLowerCase();

      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        course.includes(searchTerm.toLowerCase()) ||
        referrer.includes(searchTerm.toLowerCase()) ||
        location.includes(searchTerm.toLowerCase());

      const matchesIntake =
        filterIntake === "all" || referral.intake === filterIntake;
      const matchesEnrollmentStatus =
        filterEnrollmentStatus === "all" ||
        referral.enrollmentStatus === filterEnrollmentStatus;
      const matchesRewardStatus =
        filterRewardStatus === "all" ||
        referral.rewardStatus === filterRewardStatus;
      const matchesLocation =
        filterApplicantLocation === "all" ||
        referral.applicantLocation === filterApplicantLocation;

      return (
        matchesSearch &&
        matchesIntake &&
        matchesEnrollmentStatus &&
        matchesRewardStatus &&
        matchesLocation
      );
    });

    // Sort filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "name":
          aValue = `${a.firstName || ""} ${a.surName || ""}`;
          bValue = `${b.firstName || ""} ${b.surName || ""}`;
          break;
        case "intake":
          aValue = `${a.intake || ""} ${a.year || ""}`;
          bValue = `${b.intake || ""} ${b.year || ""}`;
          break;
        case "referralDate":
          aValue = new Date(a.referralDate || 0);
          bValue = new Date(b.referralDate || 0);
          break;
        default:
          aValue = a[sortField] || "";
          bValue = b[sortField] || "";
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
    filterApplicantLocation,
  ]);

  // Detect duplicate referees
  const duplicateReferees = useMemo(() => {
    if (!referrals.length) return [];

    const refereeMap = new Map();
    const duplicates = new Set();

    referrals.forEach((referral, index) => {
      const email = referral.email?.toLowerCase().trim();
      const phone = referral.phoneNumber?.trim();
      const refereeUUID = referral.refereeUUID._id?.trim();

      // Check for duplicates by email
      if (email) {
        if (refereeMap.has(`email_${email}`)) {
          duplicates.add(refereeMap.get(`email_${email}`));
          duplicates.add(index);
        } else {
          refereeMap.set(`email_${email}`, index);
        }
      }

      // Check for duplicates by phone
      if (phone) {
        if (refereeMap.has(`phone_${phone}`)) {
          duplicates.add(refereeMap.get(`phone_${phone}`));
          duplicates.add(index);
        } else {
          refereeMap.set(`phone_${phone}`, index);
        }
      }

      // Check for duplicates by referee UUID
      if (refereeUUID) {
        if (refereeMap.has(`uuid_${refereeUUID}`)) {
          duplicates.add(refereeMap.get(`uuid_${refereeUUID}`));
          duplicates.add(index);
        } else {
          refereeMap.set(`uuid_${refereeUUID}`, index);
        }
      }
    });

    // Get referee names and their duplicate counts from duplicate entries
    const refereeCounts = new Map();
    Array.from(duplicates).forEach((index) => {
      const referral = referrals[index];
      if (
        referral.referralCodeId.userId.firstName &&
        referral.referralCodeId.userId.lastName
      ) {
        const refereeName = `${referral.referralCodeId.userId.firstName} ${referral.referralCodeId.userId.lastName}`;
        refereeCounts.set(
          refereeName,
          (refereeCounts.get(refereeName) || 0) + 1,
        );
      }
    });

    // Convert to array of objects with name and count
    return Array.from(refereeCounts.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }, [referrals]);
  // ...existing code...
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

  // Handle showing detail modal
  const handleShowDetails = (referral) => {
    setSelectedReferral(referral);
    setShowModal(true);
  };

  // Handle Excel download
  const handleDownloadExcel = () => {
    // Excel implementation (requires: npm install xlsx)
    const excelData = filteredAndSortedReferrals.map((referral) => ({
      "Referral Code": referral.referralCodeId.code || "",
      "Applicant Name": `${referral.firstName} ${referral.surName}`,
      "Referrer UUID": referral.referrerUUID._id || "",
      Intake: `${referral.intake} ${referral.year}`,
      Course: referral.enrolledCourse,
      "Applicant Location": referral.applicantLocation || "",
      "Referred By": `${referral.referralCodeId.userId.firstName || ""} ${referral.referralCodeId.userId.lastName || ""}`,
      "Referee UUID": referral.refereeUUID._id || "",
      "Social Media Platform": referral.socialMediaPlatform || "",
      "Referral Date": formatDate(referral.referralDate),
      "Enrollment Status": referral.enrollmentStatus,
      "Reward Status": referral.rewardStatus,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Referrals List");

    const fileName = `referrals_list_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
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
        <div className="flex items-center gap-4">
          <button
            onClick={handleDownloadExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            <Download size={16} />
            Download
          </button>
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
              <div className="text-lg text-gray-600">Total Referrals</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-green-800">
                {
                  filteredAndSortedReferrals.filter(
                    (r) => r.enrollmentStatus === "Enrolled",
                  ).length
                }
              </div>
              <div className="text-lg text-green-600">Enrolled</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-yellow-800">
                {
                  filteredAndSortedReferrals.filter(
                    (r) => r.enrollmentStatus === "Pending",
                  ).length
                }
              </div>
              <div className="text-lg text-yellow-600">Pending</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-blue-800">
                {
                  filteredAndSortedReferrals.filter(
                    (r) => r.rewardStatus === "Approved",
                  ).length
                }
              </div>
              <div className="text-lg text-blue-600">Rewards Approved</div>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Referee Alert Card */}
      {duplicateReferees.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={20}
              className="text-amber-600 mt-0.5 flex-shrink-0"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <Users size={16} />
                Duplicate Referees Detected ({duplicateReferees.length})
              </h3>
              <p className="text-sm text-amber-700 mb-3">
                The following referees have duplicate entries based on email,
                phone number, or referee UUID:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {duplicateReferees.map((referee, index) => (
                  <div
                    key={index}
                    className="bg-white px-3 py-2 rounded-md border border-amber-200 text-sm text-amber-800 font-medium flex justify-between items-center"
                  >
                    <span>{referee.name}</span>
                    <span className="bg-amber-100 px-2 py-1 rounded-full text-xs font-bold">
                      {referee.count} duplicates
                    </span>
                  </div>
                ))}
              </div>
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
            filterRewardStatus !== "all" ||
            filterApplicantLocation !== "all") && (
            <button
              onClick={() => {
                setFilterIntake("all");
                setFilterEnrollmentStatus("all");
                setFilterRewardStatus("all");
                setFilterApplicantLocation("all");
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Filter Controls */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
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
                Location
              </label>
              <select
                value={filterApplicantLocation}
                onChange={(e) => setFilterApplicantLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Locations</option>
                <option value="Berlin">Berlin</option>
                <option value="Dusseldorf">Dusseldorf</option>
                <option value="Munich">Munich</option>
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
                  onClick={() => handleSort("applicantLocation")}
                  className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900"
                >
                  <MapPin size={16} />
                  Location
                  {sortField === "applicantLocation" &&
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
              <th className="p-3">
                <span className="font-medium text-gray-700">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedReferrals.length === 0 ? (
              <tr>
                <td colSpan="9" className="p-8 text-center text-gray-500">
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
                  <td className="p-3 text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin size={12} className="text-gray-400" />
                      {referral.applicantLocation || "N/A"}
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">
                    {referral.referralCodeId.userId.firstName}{" "}
                    {referral.referralCodeId.userId.lastName}
                  </td>
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
                  <td className="p-3">
                    <button
                      onClick={() => handleShowDetails(referral)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm transition"
                    >
                      <Eye size={14} />
                      Detail
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {showModal && selectedReferral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                Referral Details
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Applicant Name
                    </label>
                    <p className="text-gray-900 font-semibold">
                      {selectedReferral.firstName} {selectedReferral.surName}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Referrer UUID
                    </label>
                    <p className="text-gray-900 font-mono text-sm">
                      {selectedReferral.referrerUUID._id || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="text-gray-900">{selectedReferral.email}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Phone Number
                    </label>
                    <p className="text-gray-900">
                      {selectedReferral.phoneNumber || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Intake
                    </label>
                    <p className="text-gray-900">
                      {selectedReferral.intake} {selectedReferral.year}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Course
                    </label>
                    <p className="text-gray-900">
                      {selectedReferral.enrolledCourse}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Applicant Location
                    </label>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <p className="text-gray-900">
                        {selectedReferral.applicantLocation || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Referred By
                    </label>
                    <p className="text-gray-900 font-semibold">
                      {selectedReferral.referralCodeId.userId.firstName}{" "}
                    {selectedReferral.referralCodeId.userId.lastName}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Referee UUID
                    </label>
                    <p className="text-gray-900 font-mono text-sm">
                      {selectedReferral.refereeUUID._id || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Referral Code
                    </label>
                    <p className="text-gray-900 font-mono">
                      {selectedReferral.referralCodeId.code || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Social Media Platform
                    </label>
                    <div className="flex items-center gap-2">
                      <ExternalLink size={16} className="text-gray-400" />
                      <p className="text-gray-900">
                        {selectedReferral.socialMediaPlatform || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Referral Date
                    </label>
                    <p className="text-gray-900">
                      {formatDate(selectedReferral.referralDate)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Enrollment Status
                    </label>
                    <div className="flex items-center gap-4">
                      <span
                        className={getStatusBadge(
                          selectedReferral.enrollmentStatus,
                          "enrollment",
                        )}
                      >
                        {selectedReferral.enrollmentStatus}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Reward Status
                    </label>
                    <div className="flex items-center gap-4">
                      <span
                        className={getStatusBadge(
                          selectedReferral.rewardStatus,
                          "reward",
                        )}
                      >
                        {selectedReferral.rewardStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
