import { useState, useEffect } from "react";
import { Link2, TrendingUp, BarChart3 } from "lucide-react";
import api from "../services/api";

function LeadTracking() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // The expanded list of ALL major platforms
  const platforms = [
    "TikTok", "Instagram", "YouTube", "Facebook", 
    "Twitter", "LinkedIn", "Snapchat", "Pinterest", 
    "Reddit", "Threads"
  ];

  useEffect(() => {
    const fetchLeadStats = async () => {
      try {
        const res = await api.get("/leads/stats");
        setStats(res.data);
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadStats();
  }, []);

  // Helper to find the count for a specific platform from the database array
  const getCount = (platformName) => {
    const found = stats.find((s) => s._id === platformName.toLowerCase());
    return found ? found.count : 0;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="text-blue-600" />
          Marketing Channel Performance
        </h2>
        <p className="text-gray-500 mt-1">
          Track which social media platforms are generating the most interest.
        </p>
      </div>

      {/* Stats Cards - Updated to a 5-column grid for better fitting */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {platforms.map((platform) => (
          <div key={platform} className="bg-white p-5 rounded-xl shadow border flex flex-col justify-between hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-2">
              <p className="text-gray-500 font-medium text-sm">{platform}</p>
              <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                <TrendingUp size={16} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">
              {loading ? "..." : getCount(platform)}
            </h3>
          </div>
        ))}
      </div>

      {/* Tracking Link Generator for Creators */}
      <div className="bg-white p-6 rounded-xl shadow border mt-8">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Link2 className="text-blue-600" />
          Creator Tracking Links
        </h3>
        <p className="text-gray-600 mb-6 text-sm">
          Give these unique links to your content creators. When a user clicks one of these links on their social media, the counter above will automatically update, and the user will be redirected to the app.
        </p>

        {/* Scrollable container so the page doesn't stretch too far down */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 border-t pt-4">
          {platforms.map((platform) => {
            // The URL pointing directly to your backend tracker
           const trackingUrl = `http://localhost:3000/track/${platform.toLowerCase()}`;
            
            return (
              <div key={platform} className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition">
                <span className="font-semibold text-gray-700 w-28">{platform}</span>
                <code className="bg-white px-3 py-1.5 rounded border text-xs text-blue-600 flex-1 mx-0 md:mx-4 my-2 md:my-0 break-all shadow-sm">
                  {trackingUrl}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(trackingUrl);
                    alert(`${platform} tracking link copied to clipboard!`);
                  }}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition text-sm font-medium whitespace-nowrap"
                >
                  Copy Link
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LeadTracking;