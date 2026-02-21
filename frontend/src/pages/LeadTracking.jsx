import React, { useEffect, useState } from 'react';
import { getLeadStats, createDummyLead } from '../services/leadService';
import { PieChart, Users, TrendingUp } from 'lucide-react';

export default function LeadTracking() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const data = await getLeadStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSimulateLead = async (platform) => {
    await createDummyLead({
      name: "Test User",
      email: `test${Math.floor(Math.random() * 1000)}@example.com`,
      platform: platform
    });
    fetchStats(); // Refresh the dashboard instantly
  };

  const platforms = ['Facebook', 'LinkedIn', 'Google Ads', 'Organic'];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
        <PieChart className="text-blue-600" /> Lead Source Tracking
      </h1>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <p className="text-gray-500">Loading metrics...</p>
        ) : stats.length === 0 ? (
          <p className="text-gray-500">No leads tracked yet.</p>
        ) : (
          stats.map((stat) => (
            <div key={stat._id} className="bg-white p-6 rounded-xl shadow border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat._id}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.count}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <Users size={24} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Testing Simulator */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <TrendingUp className="text-green-600" size={20} /> Simulate Incoming Leads
        </h2>
        <p className="text-sm text-gray-500 mb-6">Click a button below to simulate a user filling out your landing page form from a specific platform.</p>
        
        <div className="flex gap-3 flex-wrap">
          {platforms.map(platform => (
            <button 
              key={platform}
              onClick={() => handleSimulateLead(platform)}
              className="px-4 py-2 border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 rounded-lg text-sm font-medium transition cursor-pointer"
            >
              + Add {platform} Lead
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}