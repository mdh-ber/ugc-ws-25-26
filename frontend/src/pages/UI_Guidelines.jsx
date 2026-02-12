import { useEffect, useState } from "react";

const UI_Guidelines = () => {
  const [dos, setDos] = useState([]);
  const [donts, setDonts] = useState([]);

  useEffect(() => {
    // TEMPORARY (until backend ready)
    const stored = localStorage.getItem("guidelines");

    if (stored) {
      const data = JSON.parse(stored);
      setDos(data.dos || []);
      setDonts(data.donts || []);
    } else {
      // default
      setDos([
        "Follow university branding rules",
        "Use clear audio and video",
        "Be respectful and professional"
      ]);

      setDonts([
        "Do not post offensive content",
        "Do not share private information",
        "Do not violate copyright rules"
      ]);
    }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Content Guidelines</h1>

      {/* DO */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Do's</h2>
        <ul className="list-disc ml-6">
          {dos.map((item, index) => (
            <li key={index} className="mb-1">{item}</li>
          ))}
        </ul>
      </div>

      {/* DON'T */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Don'ts</h2>
        <ul className="list-disc ml-6">
          {donts.map((item, index) => (
            <li key={index} className="mb-1">{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UI_Guidelines;
