import React from "react";
import { Routes, Route } from "react-router-dom";

import Rewards from "./pages/Rewards";
import Milestones from "./pages/Milestones";
import CreatorPerformanceDashboard from "./pages/CreatorPerformanceDashboard";

// import other pages that already exist in main...
// import Home from "./pages/Home";
// import Login from "./pages/Login";
// etc...

export default function AppRoutes() {
  return (
    <Routes>
      {/* existing routes from main */}
      <Route path="/rewards" element={<Rewards />} />
      <Route path="/milestones" element={<Milestones />} />

      {/* your new route */}
      <Route
        path="/mdh/creator-performance"
        element={<CreatorPerformanceDashboard />}
      />

      {/* keep other routes that were already here */}
    </Routes>
  );
}