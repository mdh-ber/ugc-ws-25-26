import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

function CampaignROI() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState(null);
  const [series, setSeries] = useState([]);

  // ✅ keep query string (?mode=manager)
  const withQuery = (path) => `${path}${location.search || ""}`;

  const fetchROI = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/roi/${id}?days=7`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSeries = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/roi/${id}/timeseries?days=7`
      );
      const json = await res.json();
      setSeries(json.series || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchROI();
    fetchSeries();

    const interval = setInterval(() => {
      fetchROI();
      fetchSeries();
    }, 5000); // refresh every 5s

    return () => clearInterval(interval);
  }, [id]);

  if (!data) return <div>Loading ROI...</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(withQuery("/campaigns"))}
          className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
        >
          ← Back
        </button>

        <h2 className="text-xl font-bold">Campaign ROI</h2>

        <span className="ml-auto text-sm text-gray-500">
          Last updated:{" "}
          {data?.lastUpdatedAt
            ? new Date(data.lastUpdatedAt).toLocaleString()
            : "-"}
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card title="Spend" value={data.spend} />
        <Card title="Revenue" value={data.revenue} />
        <Card title="Profit" value={data.profit} />
        <Card title="ROI" value={data.roi} />
        <Card title="Clicks" value={data.clicks} />
        <Card title="Conversions" value={data.conversions} />
      </div>

      {/* Table */}
      <h3 className="font-semibold mb-2">Last 7 days</h3>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Date</th>
            <th className="p-2">Spend</th>
            <th className="p-2">Revenue</th>
            <th className="p-2">Clicks</th>
            <th className="p-2">Conversions</th>
          </tr>
        </thead>
        <tbody>
          {series.map((d, i) => (
            <tr key={i} className="text-center border-t">
              <td className="p-2">{d.day}</td>
              <td className="p-2">{formatMoney(d.spend)}</td>
              <td className="p-2">{formatMoney(d.revenue)}</td>
              <td className="p-2">{d.clicks}</td>
              <td className="p-2">{d.conversions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatMoney(n) {
  const num = Number(n || 0);

  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(num);
}

function Card({ title, value }) {
  const isMoney = title === "Spend" || title === "Revenue" || title === "Profit";

  return (
    <div className="bg-white shadow p-4 rounded">
      <div className="text-gray-500">{title}</div>
      <div className="text-xl font-bold">
        {isMoney ? formatMoney(value) : value}
      </div>
    </div>
  );
}

export default CampaignROI;