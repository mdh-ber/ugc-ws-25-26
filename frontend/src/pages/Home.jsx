import { useEffect } from "react";
import { createDummyLead } from "../services/leadService";

function Home() {
  useEffect(() => {
    // 1. Look for the platform in the URL (e.g., ?utm_source=Facebook)
    const urlParams = new URLSearchParams(window.location.search);
    const platform = urlParams.get("utm_source");

    if (platform) {
      // 2. Automatically record this "Click Lead" in the database
      createDummyLead({
        name: "Anonymous Click", 
        email: "visitor@mdh.edu", 
        platform: platform 
      })
      .then(() => {
        // 3. Clean the URL so refreshing the page doesn't count as a new lead
        window.history.replaceState({}, document.title, window.location.pathname);
        console.log(`Marketing Lead Tracked: ${platform}`);
      })
      .catch(err => console.error("Tracking Error:", err));
    }
  }, []);

  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold text-blue-900">MDH University Portal</h1>
      <p className="text-gray-600 mt-2">Connecting future leaders to world-class education.</p>
    </div>
  );
}

export default Home;
