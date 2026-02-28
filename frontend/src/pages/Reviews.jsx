import { useEffect, useMemo, useState } from "react";
import UI_Guidelines from "./UI_Guidelines";

/**
 * NOTE:
 * - This keeps your existing modal logic + two cards.
 * - Adds a professional table (with search + status filter + pagination).
 * - Buttons/cards are moved BELOW the table as you requested.
 * - Uses SAMPLE data by default so it runs instantly.
 * - Later you can replace `sampleReviews` with API data without changing UI.
 */

const USE_SAMPLE_DATA = true;

function Reviews() {
  const [openGuidelines, setOpenGuidelines] = useState(false);

  // ---- table state
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // ESC close + lock background scroll when modal opens
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpenGuidelines(false);
    };

    if (openGuidelines) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openGuidelines]);

  // ---- sample reviews (replace with backend response later)
  const sampleReviews = useMemo(
    () => [
      {
        id: "RVW-10021",
        title: "Instagram Reel - Campus Tour",
        submittedBy: "Ayesha Khan",
        platform: "Instagram",
        submittedAt: "2026-02-12",
        status: "Pending",
      },
      {
        id: "RVW-10022",
        title: "YouTube Shorts - Lab Highlights",
        submittedBy: "Rahul Verma",
        platform: "YouTube",
        submittedAt: "2026-02-13",
        status: "In Review",
      },
      {
        id: "RVW-10023",
        title: "LinkedIn Post - Alumni Meetup",
        submittedBy: "Sneha Patil",
        platform: "LinkedIn",
        submittedAt: "2026-02-15",
        status: "Approved",
      },
      {
        id: "RVW-10024",
        title: "Instagram Story - Event Promo",
        submittedBy: "Mohit Sharma",
        platform: "Instagram",
        submittedAt: "2026-02-16",
        status: "Rejected",
      },
      {
        id: "RVW-10025",
        title: "Facebook Post - Workshop Recap",
        submittedBy: "Naina Singh",
        platform: "Facebook",
        submittedAt: "2026-02-18",
        status: "Pending",
      },
      {
        id: "RVW-10026",
        title: "YouTube Video - Interview Series",
        submittedBy: "Karan Mehta",
        platform: "YouTube",
        submittedAt: "2026-02-19",
        status: "In Review",
      },
      {
        id: "RVW-10027",
        title: "LinkedIn Carousel - Placement Stats",
        submittedBy: "Priya Iyer",
        platform: "LinkedIn",
        submittedAt: "2026-02-20",
        status: "Approved",
      },
      {
        id: "RVW-10028",
        title: "Instagram Reel - Student Life",
        submittedBy: "Arjun Nair",
        platform: "Instagram",
        submittedAt: "2026-02-21",
        status: "Pending",
      },
      {
        id: "RVW-10029",
        title: "Facebook Story - Admissions Update",
        submittedBy: "Fatima Noor",
        platform: "Facebook",
        submittedAt: "2026-02-22",
        status: "Approved",
      },
      {
        id: "RVW-10030",
        title: "YouTube Shorts - Library Tour",
        submittedBy: "Vikas Rao",
        platform: "YouTube",
        submittedAt: "2026-02-24",
        status: "Rejected",
      },
      {
        id: "RVW-10031",
        title: "LinkedIn Post - Faculty Spotlight",
        submittedBy: "Meera Das",
        platform: "LinkedIn",
        submittedAt: "2026-02-25",
        status: "Pending",
      },
      {
        id: "RVW-10032",
        title: "Instagram Post - Fest Highlights",
        submittedBy: "Sameer Ali",
        platform: "Instagram",
        submittedAt: "2026-02-26",
        status: "In Review",
      },
    ],
    []
  );

  // If you want to plug backend later, just replace this `rows` with API data.
  const rows = USE_SAMPLE_DATA ? sampleReviews : sampleReviews;

  const counts = useMemo(() => {
    const c = { All: rows.length, Pending: 0, "In Review": 0, Approved: 0, Rejected: 0 };
    for (const r of rows) {
      if (c[r.status] !== undefined) c[r.status] += 1;
    }
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const statusOk = statusFilter === "All" ? true : r.status === statusFilter;
      const qOk =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.submittedBy.toLowerCase().includes(q) ||
        r.platform.toLowerCase().includes(q) ||
        r.submittedAt.toLowerCase().includes(q);
      return statusOk && qOk;
    });
  }, [rows, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, totalPages]);

  useEffect(() => {
    // reset to page 1 when filters change
    setPage(1);
  }, [query, statusFilter]);

  const cardClass = "bg-white p-6 rounded-xl shadow flex flex-col justify-between";
  const buttonClass =
    "mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";

  const statusPill = (status) => {
    const base = "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border";
    if (status === "Pending")
      return (
        <span className={`${base} border-amber-200 bg-amber-50 text-amber-700`}>
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Pending
        </span>
      );
    if (status === "In Review")
      return (
        <span className={`${base} border-sky-200 bg-sky-50 text-sky-700`}>
          <span className="h-2 w-2 rounded-full bg-sky-500" />
          In Review
        </span>
      );
    if (status === "Approved")
      return (
        <span className={`${base} border-emerald-200 bg-emerald-50 text-emerald-700`}>
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Approved
        </span>
      );
    return (
      <span className={`${base} border-red-200 bg-red-50 text-red-700`}>
        <span className="h-2 w-2 rounded-full bg-red-500" />
        Rejected
      </span>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Reviews Overview</h1>
      <p className="text-sm text-gray-500 mb-6">
        Track submitted content, review status, and approval history.
      </p>

      {/* ---- TABLE SECTION (Professional) ---- */}
      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        {/* Table header controls */}
        <div className="p-4 md:p-5 border-b bg-white">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-bold">Review Requests</div>
              <div className="text-xs text-gray-500 mt-1">
                Showing {filtered.length} request{filtered.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by ID, title, user, platform..."
                  className="w-full sm:w-[320px] rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="All">All Status ({counts.All})</option>
                <option value="Pending">Pending ({counts.Pending})</option>
                <option value="In Review">In Review ({counts["In Review"]})</option>
                <option value="Approved">Approved ({counts.Approved})</option>
                <option value="Rejected">Rejected ({counts.Rejected})</option>
              </select>
            </div>
          </div>

          {/* Quick stats pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("All")}
              className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                statusFilter === "All"
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              All ({counts.All})
            </button>
            <button
              onClick={() => setStatusFilter("Pending")}
              className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                statusFilter === "Pending"
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Pending ({counts.Pending})
            </button>
            <button
              onClick={() => setStatusFilter("In Review")}
              className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                statusFilter === "In Review"
                  ? "border-sky-200 bg-sky-50 text-sky-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              In Review ({counts["In Review"]})
            </button>
            <button
              onClick={() => setStatusFilter("Approved")}
              className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                statusFilter === "Approved"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Approved ({counts.Approved})
            </button>
            <button
              onClick={() => setStatusFilter("Rejected")}
              className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                statusFilter === "Rejected"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Rejected ({counts.Rejected})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                  Request ID
                </th>
                <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                  Title
                </th>
                <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                  Submitted By
                </th>
                <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                  Platform
                </th>
                <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                  Date
                </th>
                <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                  Status
                </th>
                <th className="text-right font-semibold px-4 py-3 whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    No review requests found for your filters.
                  </td>
                </tr>
              ) : (
                paged.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/70">
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                      {r.id}
                    </td>
                    <td className="px-4 py-3 text-gray-800 min-w-[240px]">
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {r.platform} • {r.submittedAt}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {r.submittedBy}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {r.platform}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {r.submittedAt}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {statusPill(r.status)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {r.status === "Approved" ? (
                        <button
                          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                          onClick={() => alert(`Viewing details: ${r.id}`)}
                        >
                          View
                        </button>
                      ) : (
                        <button
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                          onClick={() => alert(`Open review: ${r.id}`)}
                        >
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-t bg-white">
          <div className="text-xs text-gray-500">
            Page {page} of {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </button>
            <button
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ---- BUTTON CARDS (moved BELOW table as requested) ---- */}
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {/* Card 1 */}
        <div className={cardClass}>
          <div>
            <h3 className="font-bold text-lg">Submit Review</h3>
            <p className="text-sm text-gray-500 mt-1">
              Submit your media for approval.
            </p>
          </div>

          <button className={buttonClass}>Submit Review</button>
        </div>

        {/* Card 2 */}
        <div className={cardClass}>
          <div>
            <h3 className="font-bold text-lg">Content Guidelines</h3>
            <p className="text-sm text-gray-500 mt-1">
              Read the do&apos;s and don&apos;ts before submitting.
            </p>
          </div>

          <button
            onClick={() => setOpenGuidelines(true)}
            className={buttonClass}
          >
            View Guidelines
          </button>
        </div>
      </div>

      {/* Modal */}
      {openGuidelines && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpenGuidelines(false)}
          />

          {/* Modal content */}
          <div
            className="relative z-10 w-[95%] max-w-4xl max-h-[85vh] overflow-y-auto bg-white rounded-xl shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-bold">Content Guidelines</h2>
              <button
                onClick={() => setOpenGuidelines(false)}
                className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            {/* Body (read-only list from backend) */}
            <div className="p-2">
              <UI_Guidelines />
            </div>

            {/* Footer */}
            <div className="flex justify-end px-6 py-4 border-t">
              <button
                onClick={() => setOpenGuidelines(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reviews;