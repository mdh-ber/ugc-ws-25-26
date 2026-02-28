import { useEffect, useState } from "react";
import { getClicksPerCreator } from "../services/analysticsService";
import { getCreatorPerformance } from "../services/analysticsService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function ClicksPerCreator() {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getClicksPerCreator();
    setData(res);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Clicks Per Creator</h1>

      <div style={{ display: "flex", gap: "40px" }}>
        <div style={{ width: "40%" }}>
          {data.map((c) => (
            <div
              key={c.creatorId}
              onClick={() => setSelected(c)}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
                cursor: "pointer",
              }}
            >
              <strong>{c.creatorName}</strong>
              <div>Total Clicks: {c.totalClicks}</div>
            </div>
          ))}
        </div>

        <div style={{ width: "60%" }}>
          {!selected ? (
            <div>Select a creator</div>
          ) : (
            <>
              <h2>Platform Breakdown</h2>

              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={selected.platforms}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="clicks" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClicksPerCreator;