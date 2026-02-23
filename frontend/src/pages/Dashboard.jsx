import { useState, useEffect } from "react";
import api from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState({
    trainings: 0,
    events: 0,
    campaigns: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to fetch real data from your backend
    const fetchDashboardData = async () => {
      try {
        // Fetch all three endpoints at the same time
        const [trainingsRes, eventsRes, campaignsRes] = await Promise.all([
          api.get("/trainings"),
          api.get("/events"),
          api.get("/campaigns")
        ]);

        // Update the state with the total counts from the database arrays
        setStats({
          trainings: trainingsRes.data.length || 0,
          events: eventsRes.data.length || 0,
          campaigns: campaignsRes.data.length || 0,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Empty dependency array means this runs once when the page loads

  // Show a loading state while fetching
  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500">
          <h3 className="font-bold text-gray-600">Total Trainings</h3>
          <p className="text-3xl mt-2 font-bold text-blue-600">{stats.trainings}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
          <h3 className="font-bold text-gray-600">Total Events</h3>
          <p className="text-3xl mt-2 font-bold text-green-600">{stats.events}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-purple-500">
          <h3 className="font-bold text-gray-600">Active Campaigns</h3>
          <p className="text-3xl mt-2 font-bold text-purple-600">{stats.campaigns}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;