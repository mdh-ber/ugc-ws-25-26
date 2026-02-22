import AppRoutes from "./routes";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ContentCreation from "./pages/ContentCreation";
import Login from "./pages/Login";
import Trainings from "./pages/Trainings";
import Guidelines from "./pages/Guidelines";
import Footer from "./components/Footer";

import Reviews from "./pages/Reviews";
import UuOverview from "./pages/UuOverview";
import UI_Guidelines from "./pages/UI_Guidelines";
import Rewards from "./pages/Rewards";
import CertificatesPage from "./pages/CertificatesPage";
function App() {
  return (
    <div className="min-h-screen flex flex-col">
     
      <div className="flex-1">
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create" element={<ContentCreation />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/trainings" element={<Trainings />} />
            <Route path="/guidelines" element={<Guidelines />} />
            <Route path="/ui_guidelines" element={<UI_Guidelines />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/uu-overview" element={<UuOverview />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/certificates" element={<CertificatesPage />}/>
          </Routes>
        </Layout>
      </div>

      <Footer />
    </div>
  );
}

export default App;
