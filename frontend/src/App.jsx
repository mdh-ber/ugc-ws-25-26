import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import TrackLead from "./pages/TrackLead";
import Layout from "./components/Layout";
import LeadTracking from "./pages/LeadTracking";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ContentCreation from "./pages/ContentCreation";
import Trainings from "./pages/Trainings";
import Guidelines from "./pages/Guidelines";
import Reviews from "./pages/Reviews";
import UuOverview from "./pages/UuOverview";
import Rewards from "./pages/Rewards";
import CertificatesPage from "./pages/CertificatesPage";
import Milestones from "./pages/Milestones";
import ReferralList from "./pages/ReferralList";


import WebsiteAnalytics from "./pages/WebsiteAnalytics";
import Footer from "./components/Footer";
import CampaignsList from "./pages/CampaignsList";
import CampaignForm from "./pages/CampaignForm";
import CampaignROI from "./pages/CampaignROI";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const isMarketingManager = params.get("mode") === "manager";

  // AUTO add ?mode=manager after load so sidebar shows Campaigns automatically
  useEffect(() => {
    const mode = params.get("mode");
    if (!mode) {
      navigate(`${location.pathname}?mode=manager`, { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <>
      <Routes>
        {/* Redirect root and login straight to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="/register" element={<Navigate to="/dashboard" replace />} />

        {/* Render the Layout and all pages directly with NO login required */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create" element={<ContentCreation />} />
          <Route path="/trainings" element={<Trainings />} />
          <Route path="/guidelines" element={<Guidelines />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/uu-overview" element={<UuOverview />} />
          <Route path="/referrals" element={<ReferralList />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="/milestones" element={<Milestones />} />

          {/* Campaigns */}
          <Route path="/campaigns" element={<CampaignsList />} />
          <Route path="/campaigns/new" element={<CampaignForm />} />
          <Route path="/campaigns/:id/edit" element={<CampaignForm />} />
          <Route path="/campaigns/:id/roi" element={<CampaignROI />} />
          <Route path="/leads" element={<LeadTracking />} />
          {/* NEW: The silent tracking route */}
        <Route path="/track/:platform" element={<TrackLead />} />

        {/* Redirect root and login straight to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Website Analytics */}
          <Route
            path="/website-analytics"
            element={
              isMarketingManager ? (
                <WebsiteAnalytics />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          {/* fallback inside protected area */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>

      <Footer />
    </>
  );
}

export default App;