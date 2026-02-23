import { useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";

export default function WebsiteAnalytics() {
  const location = useLocation();

  // URL-based switch: only allow access when ?mode=manager
  const params = new URLSearchParams(location.search);
  const isMarketingManager = params.get("mode") === "manager";

  const [totalVisits, setTotalVisits] = useState(0);
  const [uniqueVisitors, setUniqueVisitors] = useState(0);

  useEffect(() => {
    if (!isMarketingManager) return;

    const token =
      sessionStorage.getItem("token") || localStorage.getItem("token");

    (async () => {
      try {
        const res = await fetch("/api/analytics/website-visits", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        // If backend isn't ready, fail silently (no UI warning)
        if (!res.ok) return;

        const data = await res.json();
        setTotalVisits(Number(data.totalVisits ?? 0));
        setUniqueVisitors(Number(data.uniqueVisitors ?? 0));
      } catch {
        // Fail silently
      }
    })();
  }, [isMarketingManager]);

  // If not manager mode, redirect away
  if (!isMarketingManager) {
    return <Navigate to="/dashboard" replace />;
  }

  const Card = ({ title, value }) => (
    <div className="bg-white rounded-xl shadow p-6 border">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-4xl font-bold mt-2">{value.toLocaleString()}</div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-semibold">Website Analytics</h2>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Total number of website visits" value={totalVisits} />
        <Card title="Unique number of website visits" value={uniqueVisitors} />
      </div>
    </div>
  );
}