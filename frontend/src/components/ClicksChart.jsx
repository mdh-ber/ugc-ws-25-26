import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { clickService } from '../services/clickService';
import { format, subDays } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

function ClicksChart() {
  const [stats, setStats] = useState({
    totalClicks: 0,
    clicksByDay: [],
    clicksByType: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('line');
  
  // Filter states
  const [startDate, setStartDate] = useState(
    format(subDays(new Date(), 30), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [resourceType, setResourceType] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        startDate,
        endDate
      };
      
      if (resourceType) {
        params.resourceType = resourceType;
      }

      const response = await clickService.getClickStats(params);
      setStats(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch click statistics');
      console.error('Error fetching click stats:', err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, resourceType]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleApplyFilters = () => {
    fetchStats();
  };

  const handleResetFilters = () => {
    setStartDate(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
    setEndDate(format(new Date(), 'yyyy-MM-dd'));
    setResourceType('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
        <button 
          onClick={fetchStats}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-bold mb-4">Filters</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource Type
            </label>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="training">Training</option>
              <option value="guideline">Guideline</option>
              <option value="profile">Profile</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="flex items-end gap-2">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold text-gray-700">Total Clicks</h3>
          <p className="text-3xl font-bold mt-2 text-blue-600">
            {stats.totalClicks}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold text-gray-700">Date Range</h3>
          <p className="text-sm mt-2 text-gray-600">
            {format(new Date(startDate), 'MMM dd, yyyy')} - {format(new Date(endDate), 'MMM dd, yyyy')}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold text-gray-700">Average Daily Clicks</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">
            {stats.clicksByDay.length > 0
              ? Math.round(stats.totalClicks / stats.clicksByDay.length)
              : 0}
          </p>
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="bg-white p-4 rounded-xl shadow">
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('line')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              chartType === 'line'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Line Chart
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              chartType === 'bar'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Bar Chart
          </button>
        </div>
      </div>

      {/* Clicks Over Time Chart */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-bold mb-4">Clicks Over Time</h3>
        {stats.clicksByDay.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'line' ? (
              <LineChart data={stats.clicksByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Clicks"
                />
              </LineChart>
            ) : (
              <BarChart data={stats.clicksByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Clicks" />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No click data available for the selected period
          </div>
        )}
      </div>

      {/* Clicks by Type */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-bold mb-4">Clicks by Resource Type</h3>
        {stats.clicksByType.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.clicksByType}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.type}: ${entry.count}`}
                >
                  {stats.clicksByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="flex flex-col justify-center space-y-2">
              {stats.clicksByType.map((item, index) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="capitalize">{item.type}</span>
                  </div>
                  <span className="font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No click data available by type
          </div>
        )}
      </div>
    </div>
  );
}

export default ClicksChart;
