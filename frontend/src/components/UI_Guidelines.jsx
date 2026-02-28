import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:500/api";

export default function UI_Guidelines() {
  const [dos, setDos] = useState([]);
  const [donts, setDonts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/guidelines`);
        const list = Array.isArray(res.data) ? res.data : [];

        setDos(list.filter((g) => g.type === "do"));
        setDonts(list.filter((g) => g.type === "dont"));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-4">
      {loading && <p className="text-sm text-gray-500">Loading guidelines...</p>}

      <div className="grid md:grid-cols-2 gap-4">
        {/* DO'S */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-green-700">Do&apos;s</h3>
          </div>
          <div className="p-4">
            <ul className="list-disc ml-5 space-y-2">
              {dos.map((g) => (
                <li key={g._id} className="text-sm text-gray-800">
                  {g.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* DON'TS */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-red-700">Don&apos;ts</h3>
          </div>
          <div className="p-4">
            <ul className="list-disc ml-5 space-y-2">
              {donts.map((g) => (
                <li key={g._id} className="text-sm text-gray-800">
                  {g.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
