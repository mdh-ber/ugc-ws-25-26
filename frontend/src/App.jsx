import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Trainings from "./pages/Trainings";
import Profile from "./pages/Profile";
import Reviews from "./pages/Reviews";
import UuOverview from "./pages/UuOverview";
import Rewards from "./pages/Rewards";
import CertificatesPage from "./pages/CertificatesPage";
import Milestones from "./pages/Milestones";
import LeadTracking from "./pages/LeadTracking";

function App() {
  return (
    <Routes>
      {/* ✅ Login and Register routes are REMOVED */}
      
      {/* All routes are now open and inside the Layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trainings" element={<Trainings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/uu-overview" element={<UuOverview />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/certificates" element={<CertificatesPage />} />
        <Route path="/milestones" element={<Milestones />} />
        <Route path="/lead-tracking" element={<LeadTracking />} />
      </Route>
    </Routes>
  );
}

export default App;