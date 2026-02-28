import { useState } from "react";
import { VscFeedback } from "react-icons/vsc";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export default function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      setError(true);
      setTimeout(() => setError(false), 500);
      return;
    }

    try {
      setSubmitting(true);

      // ✅ send to backend
      await axios.post(`${API_BASE}/feedback`, {
        message: feedback.trim(),
      });

      setFeedback("");
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Open Modal Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        <div className="flex items-center gap-2">
          <VscFeedback className="stroke-[1] w-8" size={25} title="feedback" />
          Give Feedback
        </div>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              We value your feedback 💬
            </h2>

            <textarea
              rows="4"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write your feedback here..."
              className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2
                ${
                  error
                    ? "border-red-500 animate-shake"
                    : "border-gray-300 focus:ring-blue-500"
                }
              `}
              disabled={submitting}
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100"
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}