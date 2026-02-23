import { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";
// Importing the official brand logos! (Snapchat fixed)
import { 
  FaTiktok, FaInstagram, FaYoutube, FaFacebook, 
  FaTwitter, FaLinkedin, FaSnapchat, 
  FaPinterest, FaReddit, FaThreads 
} from "react-icons/fa6";
import api from "../services/api";

function LeadTracking() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // The expanded list with official icons and brand colors
  const platforms = [
    { name: "TikTok", id: "tiktok", icon: FaTiktok, color: "text-black", bg: "bg-gray-200" },
    { name: "Instagram", id: "instagram", icon: FaInstagram, color: "text-pink-600", bg: "bg-pink-100" },
    { name: "YouTube", id: "youtube", icon: FaYoutube, color: "text-red-600", bg: "bg-red-100" },
    { name: "Facebook", id: "facebook", icon: FaFacebook, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "Twitter", id: "twitter", icon: FaTwitter, color: "text-blue-400", bg: "bg-blue-50" },
    { name: "LinkedIn", id: "linkedin", icon: FaLinkedin, color: "text-blue-800", bg: "bg-blue-100" },
    { name: "Snapchat", id: "snapchat", icon: FaSnapchat, color: "text-yellow-500", bg: "bg-yellow-100" },
    { name: "Pinterest", id: "pinterest", icon: FaPinterest, color: "text-red-500", bg: "bg-red-100" },
    { name: "Reddit", id: "reddit", icon: FaReddit, color: "text-orange-500", bg: "bg-orange-100" },
    { name: "Threads", id: "threads", icon: FaThreads, color: "text-black", bg: "bg-gray-200" }
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
  const getCount = (platformId) => {
    const found = stats.find((s) => s._id === platformId);
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

      {/* Stats Cards - 5-column grid with REAL LOGOS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <div key={platform.id} className="bg-white p-5 rounded-xl shadow border flex flex-col justify-between hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-2">
                <p className="text-gray-500 font-medium text-sm">{platform.name}</p>
                {/* Dynamically applying the brand's background and icon color */}
                <div className={`${platform.bg} p-2 rounded-lg ${platform.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-800">
                {loading ? "..." : getCount(platform.id)}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Marketing Tip Banner */}
      <div className="bg-[#213588] text-white p-6 rounded-xl shadow-md mt-8">
        <h3 className="font-bold text-lg mb-1">Marketing Tip</h3>
        <p className="text-sm text-blue-100">
          The platform with the highest count currently has the best engagement. Consider increasing ad spend or creator collaboration on that specific channel.
        </p>
      </div>
    </div>
  );
}

export default LeadTracking;