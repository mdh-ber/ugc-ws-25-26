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

function App() {
  const token = sessionStorage.getItem("token");

  return (
    <Routes>
      {/* Default */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Public */}
      <Route
        path="/login"
        element={token ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/register"
        element={token ? <Navigate to="/dashboard" /> : <Register />}
      />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create" element={<ContentCreation />} />
          <Route path="/trainings" element={<Trainings />} />
          <Route path="/guidelines" element={<Guidelines />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/uu-overview" element={<UuOverview />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="/milestones" element={<Milestones />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;