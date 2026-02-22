import React, { useState, useEffect } from 'react';
import { getFinancialReport, exportFinancialReportCSV } from '../services/financialReportService';
import Button from '../components/Button';
import Card from '../components/Card';

function FinancialReport() {
  console.log('FinancialReport component rendered');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    creator: '',
    platform: '',
    allTime: true
  });

  useEffect(() => {
    console.log('useEffect triggered, calling fetchData');
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    console.log('fetchData called with filters:', filters);
    setLoading(true);
    setError(null);
    try {
      const reportData = await getFinancialReport(filters);
      console.log('Received data:', reportData);
      setData(reportData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch financial report data.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleExportCSV = async () => {
    try {
      await exportFinancialReportCSV(filters);
    } catch (err) {
      alert('Failed to export CSV.');
    }
  };

  const calculateROI = (revenue, cost) => {
    if (cost === 0) return 'N/A';
    return ((revenue - cost) / cost * 100).toFixed(2) + '%';
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Financial Report</h1>

      {/* Filters */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Content Creator</label>
            <input
              type="text"
              name="creator"
              value={filters.creator}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
              placeholder="Filter by creator"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Platform</label>
            <input
              type="text"
              name="platform"
              value={filters.platform}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
              placeholder="Filter by platform"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="allTime"
              checked={filters.allTime}
              onChange={handleFilterChange}
              className="mr-2"
            />
            <label className="text-sm font-medium">All-time data</label>
          </div>
        </div>
      </Card>

      {/* Export Button */}
      <div className="mb-6">
        <Button onClick={handleExportCSV} className="bg-blue-500 hover:bg-blue-600 text-white">
          Export to CSV
        </Button>
      </div>

      {/* Data Display */}
      {data.length === 0 ? (
        <div className="text-center py-10">No data available.</div>
      ) : (
        <Card>
          <h2 className="text-xl font-semibold mb-4">Report Data</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Creator</th>
                  <th className="px-4 py-2 text-left">Platform</th>
                  <th className="px-4 py-2 text-left">Campaign</th>
                  <th className="px-4 py-2 text-left">Revenue</th>
                  <th className="px-4 py-2 text-left">Cost</th>
                  <th className="px-4 py-2 text-left">ROI</th>
                  <th className="px-4 py-2 text-left">Impressions</th>
                  <th className="px-4 py-2 text-left">Engagement</th>
                  <th className="px-4 py-2 text-left">Clicks</th>
                  <th className="px-4 py-2 text-left">Conversions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={item._id || index} className="border-t">
                    <td className="px-4 py-2">{item.creator}</td>
                    <td className="px-4 py-2">{item.platform}</td>
                    <td className="px-4 py-2">{item.campaignName || 'N/A'}</td>
                    <td className="px-4 py-2">${item.revenue?.toLocaleString() || 0}</td>
                    <td className="px-4 py-2">${item.cost?.toLocaleString() || 0}</td>
                    <td className="px-4 py-2">{typeof item.roi === 'number' ? item.roi.toFixed(2) + '%' : item.roi || 'N/A'}</td>
                    <td className="px-4 py-2">{item.impressions?.toLocaleString() || 0}</td>
                    <td className="px-4 py-2">{item.engagement?.toLocaleString() || 0}</td>
                    <td className="px-4 py-2">{item.clicks?.toLocaleString() || 0}</td>
                    <td className="px-4 py-2">{item.conversions?.toLocaleString() || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

export default FinancialReport;