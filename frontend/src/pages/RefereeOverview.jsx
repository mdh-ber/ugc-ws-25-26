import { useEffect, useState } from "react";
<<<<<<< HEAD
=======
import api from "../services/api"; // uses http://localhost:5000/api
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
<<<<<<< HEAD
import { getRefereeOverview } from "../services/uuService";
=======
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1

export default function RefereeOverview() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      setLoading(true);
<<<<<<< HEAD

      // example: last 7 days
      const res = await getRefereeOverview({ days: 7 });
      const series = res?.series || [];

      setData(
        series.map((item) => ({
          date: item.date,
          uu: item.uu,
        })),
      );
=======
      const res = await api.get("/uu/referee/overview"); // ✅ backend endpoint
      const series = res.data?.series || [];

      // Convert backend format → recharts format
      const chartData = series.map((item) => ({
        date: item.date,
        uu: item.uu,
      }));

      setData(chartData);
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
    } catch (err) {
      console.error("Error loading referee overview:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Referee Unique Users Overview</h1>

      {loading && <p>Loading...</p>}

      {!loading && data.length === 0 && <p>No data yet...</p>}

      {!loading && data.length > 0 && (
        <div className="bg-white p-4 rounded shadow" style={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="uu" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}