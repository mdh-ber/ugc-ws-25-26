import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ContentCreation from "./pages/ContentCreation";
import Login from "./pages/Login";
import Trainings from "./pages/Trainings";
import Guidelines from "./pages/Guidelines";
import Footer from "./components/Footer";
import Register from "./pages/Register";
import Reviews from "./pages/Reviews";
import UuOverview from "./pages/UuOverview";
import UI_Guidelines from "./pages/UI_Guidelines";
import Rewards from "./pages/Rewards";
import CertificatesPage from "./pages/CertificatesPage";
import Milestones from "./pages/Milestones";

function App() {
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <Layout>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected group */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create" element={<ContentCreation />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/trainings" element={<Trainings />} />
              <Route path="/guidelines" element={<Guidelines />} />
              <Route path="/ui_guidelines" element={<UI_Guidelines />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/uu-overview" element={<UuOverview />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/certificates" element={<CertificatesPage />} />
              <Route path="/milestones" element={<Milestones />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Optional: fallback */}
            <Route path="*" element={<Login />} />
          </Routes>
        </Layout>
      </div>

      {/* Optional: hide footer when logged out */}
      {token ? <Footer /> : null}
    </div>
  );
}

export default App;