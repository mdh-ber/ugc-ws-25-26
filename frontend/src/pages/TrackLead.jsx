import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function TrackLead() {
  const { platform } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const recordClick = async () => {
      try {
        // Silently tell the backend: "Add +1 to this platform!"
        await api.get(`/leads/track/${platform}`);
      } catch (error) {
        console.error("Failed to track lead", error);
      } finally {
        // Instantly redirect the user to the dashboard so they don't notice a thing
        navigate("/dashboard", { replace: true });
      }
    };

    recordClick();
  }, [platform, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500 font-medium animate-pulse">Redirecting...</p>
    </div>
  );
}

export default TrackLead;