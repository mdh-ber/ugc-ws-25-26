import { useEffect, useState } from "react";
import axios from "axios";

const DEFAULT_DOS = [
  "Follow university branding rules",
  "Use clear audio and video",
  "Be respectful and professional",
];

const DEFAULT_DONTS = [
  "Do not post offensive content",
  "Do not share private information",
  "Do not violate copyright rules",
];

export default function UI_Guidelines() {
  const [dos, setDos] = useState(DEFAULT_DOS);
  const [donts, setDonts] = useState(DEFAULT_DONTS);
  const [loading, setLoading] = useState(true);

  const loadFromLocalStorage = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("mdh_guidelines") || "{}");
      if (Array.isArray(saved.dos)) setDos(saved.dos);
      if (Array.isArray(saved.donts)) setDonts(saved.donts);
    } catch (e) {
      // ignore
    }
  };

  const loadFromApi = async () => {
    // when backend is ready, they should provide something like:
    // GET http://localhost:5000/api/guidelines
    // response: { dos: [...], donts: [...] }
    const res = await axios.get("http://localhost:5000/api/guidelines");
    if (Array.isArray(res.data?.dos)) setDos(res.data.dos);
    if (Array.isArray(res.data?.donts)) setDonts(res.data.donts);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await loadFromApi(); // future ready
      } catch (err) {
        // backend not ready -> use localStorage fallback
        loadFromLocalStorage();
      } finally {
        setLoading(false);
      }
    })();

    // If manager updates localStorage, user page can refresh automatically
    const onStorage = (e) => {
      if (e.key === "mdh_guidelines") loadFromLocalStorage();
    };
    window.addEventListener("storage", onStorage);

    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Content Guidelines</h1>

      {loading && <p className="text-gray-500">Loading guidelines...</p>}

      <h2 className="text-xl font-semibold mt-4 text-green-700">Do&apos;s</h2>
      <div className="bg-white rounded-lg shadow p-4 mt-2">
        <ul className="list-disc ml-6 space-y-2">
          {dos.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <h2 className="text-xl font-semibold mt-8 text-red-700">Don&apos;ts</h2>
      <div className="bg-white rounded-lg shadow p-4 mt-2">
        <ul className="list-disc ml-6 space-y-2">
          {donts.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
