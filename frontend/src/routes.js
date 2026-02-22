import React from "react";
import { Routes, Route } from "react-router-dom";

 HEAD
<Route path="/rewards" element={<Rewards />} />

import Milestones from "./pages/Milestones";

<Route path="/milestones" element={<Milestones />} />

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Rewards from "./pages/Rewards";
import AssetPage from "./pages/AssetPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/rewards" element={<Rewards />} />
      <Route path="/assets" element={<AssetPage />} />
    </Routes>
  );
};

export default AppRoutes;
 main
