<<<<<<< Updated upstream
import React, { useEffect, useState } from "react";
import { getClicksPerCreator } from "../services/analyticsService";

const ClicksPerCreatorCard = () => {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getClicksPerCreator();

        // Sort highest clicks first
        const sortedData = [...data].sort(
          (a, b) => b.totalClicks - a.totalClicks
        );

        setCreators(sortedData);
      } catch (err) {
        setError("Failed to load click data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={cardStyle}>
      <h2 style={titleStyle}>Clicks Per Creator</h2>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && creators.length === 0 && (
        <p>No data available.</p>
      )}

      {!loading && !error && creators.length > 0 && (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Creator</th>
              <th style={thStyle}>Total Clicks</th>
            </tr>
          </thead>
          <tbody>
            {creators.map((creator) => (
              <tr key={creator.creatorId}>
                <td style={tdStyle}>{creator.creatorName}</td>
                <td style={tdStyle}>{creator.totalClicks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const cardStyle = {
  background: "#ffffff",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  marginBottom: "20px",
};

const titleStyle = {
  marginBottom: "15px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle = {
  textAlign: "left",
  borderBottom: "2px solid #ddd",
  padding: "8px",
};

const tdStyle = {
  padding: "8px",
  borderBottom: "1px solid #eee",
};

export default ClicksPerCreatorCard;
=======
import { useEffect, useState } from "react";
import { getClicksPerCreator } from "../services/creatorPerformanceService";

export default function ClicksPerCreatorCard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    getClicksPerCreator()
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <div className="bg-white shadow p-4 rounded">
      <h2 className="text-xl font-bold mb-4">Clicks Per Creator</h2>

      {data.map((creator) => (
        <div key={creator.creatorId} className="mb-2">
          <p className="font-semibold">{creator.creatorName}</p>
          <p>Total Clicks: {creator.totalClicks}</p>
        </div>
      ))}
    </div>
  );
}
>>>>>>> Stashed changes
