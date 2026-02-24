import { useState } from "react";

function Reviews() {
  const [reviewRequests] = useState([
    { id: 1, name: "Emma Johnson", status: "NEED_REVIEW", date: "2026-02-01" },
    { id: 2, name: "Liam Carter", status: "REVIEWED", date: "2026-02-03" },
    { id: 3, name: "Olivia Smith", status: "NEED_REVIEW", date: "2026-02-05" },
    { id: 4, name: "Noah Miller", status: "REVIEWED", date: "2026-02-08" },
    { id: 5, name: "Sophia Davis", status: "NEED_REVIEW", date: "2026-02-10" },
    { id: 6, name: "James ", status: "REVIEWED", date: "2026-02-17" },
    { id: 7, name: "Davis", status: "NEED_REVIEW", date: "2026-02-16" },
    { id: 8, name: "James Wilson", status: "REVIEWED", date: "2026-02-12" },
    { id: 9, name: "Ava Moore", status: "NEED_REVIEW", date: "2026-02-15" },
    { id: 10, name: "virat kholi", status: "NEED_REVIEW", date: "2026-02-18" },
    { id: 11, name: "Rocky", status: "REVIEWED", date: "2026-02-19" },
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reviews Overview</h1>

      {/* TABLE CARD */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="font-bold text-lg">Review Requests</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">User Name</th>
                <th className="px-6 py-3">Submitted</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {reviewRequests.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {user.name}
                  </td>

                  <td className="px-6 py-4 text-gray-600">{user.date}</td>

                  <td className="px-6 py-4">
                    {user.status === "REVIEWED" ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        Reviewed
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                        Need to review
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    {user.status === "NEED_REVIEW" ? (
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-xs font-semibold">
                        Review
                      </button>
                    ) : (
                      <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-1.5 rounded text-xs font-semibold">
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SUBMIT BUTTON AT BOTTOM */}
        <div className="p-5 border-t flex justify-end">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded">
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}

export default Reviews;