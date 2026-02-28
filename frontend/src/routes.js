import React from "react";
import { Routes, Route } from "react-router-dom";

import Rewards from "./pages/Rewards";
import Milestones from "./pages/Milestones";
import CreatorPerformanceDashboard from "./pages/CreatorPerformanceDashboard";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/rewards" element={<Rewards />} />
      <Route path="/milestones" element={<Milestones />} />

      <Route
        path="/mdh/creator-performance"
        element={<CreatorPerformanceDashboard />}
      />

      {/* keep other routes that were already here (add them below) */}
    </Routes>
  );
}
