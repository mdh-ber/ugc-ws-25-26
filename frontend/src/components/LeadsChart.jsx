import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  FaInstagram,
  FaYoutube,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";

// Placeholder data
const initialData = [
  { platform: "Instagram", leads: 120, icon: <FaInstagram /> },
  { platform: "YouTube", leads: 80, icon: <FaYoutube /> },
  { platform: "LinkedIn", leads: 60, icon: <FaLinkedin /> },
  { platform: "Twitter", leads: 40, icon: <FaTwitter /> },
];

export default function LeadsChart() {
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [darkMode, setDarkMode] = useState(false);
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [leadsData, setLeadsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const colors = ["#E1306C", "#FF0000", "#0077B5", "#1DA1F2"];

  useEffect(() => {
    setLoading(true);
    // Simulated API call
    setTimeout(() => {
      setLeadsData(initialData);
      setLoading(false);
    }, 800);
  }, []);

  const filteredData =
    selectedPlatform === "All"
      ? leadsData
      : leadsData.filter((item) => item.platform === selectedPlatform);

  const totalLeads =
    selectedPlatform === "All"
      ? leadsData.reduce((sum, item) => sum + item.leads, 0)
      : filteredData[0]?.leads || 0;

  // Animated total
  useEffect(() => {
    let start = 0;
    const duration = 600;
    const increment = totalLeads / (duration / 16);

    const counter = setInterval(() => {
      start += increment;
      if (start >= totalLeads) {
        setAnimatedTotal(totalLeads);
        clearInterval(counter);
      } else {
        setAnimatedTotal(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(counter);
  }, [totalLeads]);

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 to-black"
          : "bg-gradient-to-br from-indigo-100 to-white"
      }`}
    >
      <div
        className={`max-w-4xl mx-auto backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl shadow-xl p-4 sm:p-6 transition-all duration-500 ${
          darkMode ? "text-white" : "text-gray-800"
        }`}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Leads Analytics
            </h2>
            <p className="opacity-70 mt-1 text-xs sm:text-sm">
              Filter and analyze social media leads
            </p>
          </div>

          <div className="flex gap-2 sm:gap-3 mt-2 sm:mt-0">
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-3 py-1 sm:px-3 sm:py-1.5 rounded-lg text-black text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Platforms</option>
              {leadsData.map((item) => (
                <option key={item.platform} value={item.platform}>
                  {item.platform}
                </option>
              ))}
            </select>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg bg-indigo-600 text-white text-xs sm:text-sm hover:scale-105 transition"
            >
              {darkMode ? "☀ Light" : "🌙 Dark"}
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center h-48 sm:h-64">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Platform Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
              {leadsData.map((item, index) => (
                <div
                  key={item.platform}
                  className="rounded-xl p-3 sm:p-4 text-center bg-white/30 backdrop-blur-lg shadow-md hover:scale-105 transition duration-300"
                >
                  <div
                    className="text-xl sm:text-2xl mb-1"
                    style={{ color: colors[index] }}
                  >
                    {item.icon}
                  </div>
                  <div className="font-medium text-xs sm:text-sm">{item.platform}</div>
                  <div className="text-lg sm:text-xl font-bold mt-1">{item.leads}</div>
                </div>
              ))}
            </div>

            {/* Animated Total */}
            <div className="mb-4 sm:mb-6 text-center">
              <p className="opacity-70 text-xs sm:text-sm">Total Leads</p>
              <h3 className="text-3xl sm:text-4xl font-bold mt-1">{animatedTotal}</h3>
              <p className="opacity-60 mt-1 text-xs sm:text-sm">
                {selectedPlatform === "All"
                  ? "Across all platforms"
                  : `From ${selectedPlatform}`}
              </p>
            </div>

            {/* Chart */}
            <div className="w-full h-48 sm:h-64">
              <ResponsiveContainer>
                <BarChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="platform"
                    stroke={darkMode ? "#fff" : "#000"}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis stroke={darkMode ? "#fff" : "#000"} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      backdropFilter: "blur(5px)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="leads" radius={[15, 15, 0, 0]}>
                    {filteredData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}