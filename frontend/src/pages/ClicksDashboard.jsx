import React, { useEffect, useState } from "react";
import ClicksChart from "../components/ClicksChart";
import { fetchPlatforms } from "../services/clicksService";

const ClicksDashboard = () => {
  const [platforms, setPlatforms] = useState([]);
  const [platform, setPlatform] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const loadPlatforms = async () => {
      const data = await fetchPlatforms();
      setPlatforms(data);
    };

    loadPlatforms();
  }, []);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Clicks Analytics Dashboard</h2>

      <div style={{ marginBottom: "20px" }}>
        <select onChange={(e) => setPlatform(e.target.value)}>
          <option value="">Select Platform</option>
          {platforms.map((p, i) => (
            <option key={i} value={p}>
              {p}
            </option>
          ))}
        </select>

        <input type="date" onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" onChange={(e) => setEndDate(e.target.value)} />
      </div>

      <ClicksChart
        platform={platform}
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  );
};

export default ClicksDashboard;