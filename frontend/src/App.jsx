import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import LeadTracking from "./pages/LeadTracking";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";

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

import ReportsDownload from "./pages/ReportsDownload";

function App() {
  // keep your existing auth gate (still requires login to access protected pages)
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");

  // ✅ URL-based mode switch
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const isMarketingManager = params.get("mode") === "manager";

  // ✅ AUTO add ?mode=manager after login (so sidebar shows Campaigns automatically)
  useEffect(() => {
    if (!token) return;

    const mode = params.get("mode");
    if (!mode) {
      // preserve current path; add manager mode
      navigate(`${location.pathname}?mode=manager`, { replace: true });
    }
  }, [token, location.pathname]); // keep minimal deps

  return (
    <>
      <Routes>
        {/* Entry */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes */}
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={token ? <Navigate to="/dashboard" replace /> : <Register />}
        />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/create" element={<ContentCreation />} />
            <Route path="/trainings" element={<Trainings />} />
            <Route path="/leads" element={<LeadTracking />} />
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

            {/* Website Analytics: ONLY when URL has ?mode=manager */}
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

            {/* Reports Download: ONLY when URL has ?mode=manager */}
            <Route
              path="/reports"
              element={
                isMarketingManager ? (
                  <ReportsDownload />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />

            {/* fallback inside protected area */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        {/* global fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {token ? <Footer /> : null}
    </>
  );
}

export default App;