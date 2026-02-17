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
  FaTiktok,
} from "react-icons/fa";

// Placeholder data
const initialData = [
  { date: "Jan", Instagram: 30, YouTube: 20, LinkedIn: 10, Twitter: 5, Tiktok: 15 },
  { date: "Feb", Instagram: 40, YouTube: 25, LinkedIn: 20, Twitter: 10, Tiktok: 20 },
  { date: "Mar", Instagram: 50, YouTube: 35, LinkedIn: 30, Twitter: 15, Tiktok: 25 },
];

// Platforms and their colors/icons
const platforms = [
  { name: "Instagram", color: "#E1306C", icon: <FaInstagram /> },
  { name: "YouTube", color: "#FF0000", icon: <FaYoutube /> },
  { name: "LinkedIn", color: "#0077B5", icon: <FaLinkedin /> },
  { name: "Twitter", color: "#1DA1F2", icon: <FaTwitter /> },
  { name: "Tiktok", color: "#69C9D0", icon: <FaTiktok /> },
];

export default function LeadsChart() {
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [darkMode, setDarkMode] = useState(false);
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [leadsData, setLeadsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLeadsData(initialData);
      setLoading(false);
    }, 800);
  }, []);

  // Total leads calculation
  const totalLeads =
    selectedPlatform === "All"
      ? leadsData.reduce(
          (sum, item) =>
            sum +
            item.Instagram +
            item.YouTube +
            item.LinkedIn +
            item.Twitter +
            item.Tiktok,
          0
        )
      : leadsData.reduce(
          (sum, item) => sum + (item[selectedPlatform] || 0),
          0
        );

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
        className={`max-w-7xl mx-auto backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl shadow-xl p-6 sm:p-8 transition-all duration-500 ${
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
              {platforms.map((plat) => (
                <option key={plat.name} value={plat.name}>
                  {plat.name}
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
              {platforms.map((plat, index) => (
                <div
                  key={plat.name}
                  className="rounded-xl p-3 sm:p-4 text-center bg-white/30 backdrop-blur-lg shadow-md hover:scale-105 transition duration-300"
                >
                  <div className="text-xl sm:text-2xl mb-1" style={{ color: plat.color }}>
                    {plat.icon}
                  </div>
                  <div className="font-medium text-xs sm:text-sm">{plat.name}</div>
                  <div className="text-lg sm:text-xl font-bold mt-1">
                    {leadsData.reduce((sum, item) => sum + (item[plat.name] || 0), 0)}
                  </div>
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
            <div className="w-full h-72 sm:h-96">
              <ResponsiveContainer>
                <BarChart data={leadsData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="date"
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
                  {selectedPlatform === "All"
                    ? platforms.map((plat, index) => (
                        <Bar
                          key={plat.name}
                          dataKey={plat.name}
                          radius={[10, 10, 0, 0]}
                        >
                          {leadsData.map((entry, idx) => (
                            <Cell key={idx} fill={plat.color} />
                          ))}
                        </Bar>
                      ))
                    : (
                        <Bar dataKey={selectedPlatform} radius={[10, 10, 0, 0]}>
                          {leadsData.map((entry, idx) => (
                            <Cell key={idx} fill="#6366f1" />
                          ))}
                        </Bar>
                      )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}