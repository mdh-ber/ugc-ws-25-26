import React, { useEffect, useState } from 'react';
import { getLeadStats } from '../services/Leadservice';
import { BarChart3, Users, Globe } from 'lucide-react';

export default function LeadTracking() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getLeadStats();
        setStats(data); // Data comes from backend grouped by platform
      } catch (error) {
        console.error("Failed to load marketing stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="text-blue-600" /> Marketing Channel Performance
        </h1>
        <p className="text-gray-500">Track which social media platforms are generating the most interest.</p>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <p>Analyzing channel data...</p>
        ) : (
          stats.map((stat) => (
            <div key={stat._id} className="bg-white border border-gray-100 shadow-sm p-6 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {stat._id}
                </span>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{stat.count}</h3>
                <p className="text-sm text-green-600 font-medium mt-1">Total Leads</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl text-blue-600">
                <Globe size={28} />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-10 p-6 bg-blue-900 text-white rounded-2xl shadow-lg">
        <h3 className="font-bold text-lg">Marketing Tip</h3>
        <p className="text-blue-100 text-sm mt-1">
          The platform with the highest count currently has the best engagement. 
          Consider increasing ad spend or creator collaboration on that specific channel.
        </p>
      </div>
    </div>
  );
}