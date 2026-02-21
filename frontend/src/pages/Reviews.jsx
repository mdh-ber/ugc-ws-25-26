import { useEffect, useState } from "react";
import UI_Guidelines from "./UI_Guidelines";

function Reviews() {
  const [openGuidelines, setOpenGuidelines] = useState(false);

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

  const cardClass = "bg-white p-6 rounded-xl shadow flex flex-col justify-between";
  const buttonClass =
    "mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reviews Overview</h1>

      <div className="grid md:grid-cols-3 gap-6">
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
