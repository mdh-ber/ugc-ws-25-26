import AppRoutes from "./routes";
import { Routes, Route, Navigate } from "react-router-dom";
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

import Footer from "./components/Footer";

function App() {
  // ✅ support both storages
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");

  return (
    <>
      <Routes>
        {/* Entry */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes (NO layout UI because Layout will not be used here) */}
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
          {/* Layout wraps all protected pages */}
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

            {/* fallback inside protected area */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        {/* global fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {/* ✅ optional: only show footer when logged in */}
      {token ? <Footer /> : null}
    </>
  );
}

export default App;