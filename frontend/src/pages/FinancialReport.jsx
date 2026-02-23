import React, { useState, useEffect, useRef } from 'react';
import {
  compareCampaigns,
  spentVsROI,
  getTimeSeries,
  getCostPerClick,
  getClickThroughRate,
} from '../services/financialReportService';
import Card from '../components/Card';
import FinancialReportGraph from '../components/FinancialReportGraph';

function FinancialReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ creator: '', platform: '', allTime: true });
  const [debouncedFilters, setDebouncedFilters] = useState(filters); // ← new
  const [selectedOption, setSelectedOption] = useState('timeseries');
  const [interval, setInterval] = useState('month');
  const [campaignIds, setCampaignIds] = useState([]);
  const [campaignId, setCampaignId] = useState('');
  const debounceTimer = useRef(null);// Separate local input state (never triggers fetch directly)
const [inputValues, setInputValues] = useState({ creator: '', platform: '' });

// Committed filter state (triggers fetch)


  // Debounce text inputs — only update debouncedFilters 500ms after user stops typing
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500);
    return () => clearTimeout(debounceTimer.current);
  }, [filters]);

  // Only fetch when debouncedFilters changes (not on every keystroke)
  useEffect(() => {
    fetchData();
  }, [debouncedFilters, selectedOption, interval, campaignIds, campaignId]);

  const handleInputChange = (e) => {
  const { name, value } = e.target;
  setInputValues(prev => ({ ...prev, [name]: value })); // only updates local input, no fetch
};

const handleSearch = () => {
  setFilters(prev => ({ ...prev, ...inputValues })); // commits to fetch-triggering state
};

const handleCheckbox = (e) => {
  setFilters(prev => ({ ...prev, allTime: e.target.checked })); // checkbox is fine to fetch immediately
};

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let reportData = [];
      switch (selectedOption) {
        case 'compare':   reportData = await compareCampaigns(campaignIds); break;
        case 'roi':       reportData = await spentVsROI();                  break;
        case 'timeseries':reportData = await getTimeSeries(interval);       break;
        case 'cpc':       reportData = await getCostPerClick(campaignId);   break;
        case 'ctr':       reportData = await getClickThroughRate(campaignId); break;
        default:          reportData = [];
      }
      setData(Array.isArray(reportData) ? reportData : []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch financial report data.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Map raw API fields → graph fields (pass ALL fields through)
  const graphData = data.map(d => ({
    label:       d.campaign  ? String(d.campaign)  : String(d._id ?? ''),
    revenue:     d.totalRevenue     ?? 0,
    cost:        d.totalCost        ?? 0,
    clicks:      d.totalClicks      ?? 0,
    impressions: d.totalImpressions ?? 0,
  }));

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error)   return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Financial Report</h1>

      {/* Filters */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div>
            <label className="block text-sm font-medium mb-1">Graph Option</label>
            <select
              value={selectedOption}
              onChange={e => setSelectedOption(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="compare">Campaign Comparison</option>
              <option value="roi">Spending vs ROI</option>
              <option value="timeseries">Time Series</option>
              <option value="cpc">Cost Per Click</option>
              <option value="ctr">Click Through Rate</option>
            </select>
          </div>


          <div className="flex items-center">
            <input
              type="checkbox" name="allTime" checked={filters.allTime}
              onChange={handleFilterChange} className="mr-2"
            />
            <label className="text-sm font-medium">All-time data</label>
          </div>

        </div>
      </Card>

      {/* Graph */}
      <FinancialReportGraph
        selectedOption={selectedOption}
        data={graphData}
        interval={interval}
        onIntervalChange={setInterval}
      />
    </div>
  );
}

export default FinancialReport;