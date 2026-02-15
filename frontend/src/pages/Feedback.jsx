import { useState } from "react";
import { VscFeedback } from "react-icons/vsc";

export default function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (!feedback.trim()) {
      setError(true);

      // Remove animation class after animation ends
      setTimeout(() => setError(false), 500);

      return;
    }

    console.log("User Feedback:", feedback);
    setFeedback("");
    setIsOpen(false);
  };

  return (
    <>
      {/* Open Modal Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 m-8"
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
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}