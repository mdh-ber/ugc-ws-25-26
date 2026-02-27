const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");

// 1. THE TRACKING LINK (Creators put this on their social media)
// Example URL: http://localhost:5000/api/leads/track/tiktok
router.get("/track/:platform", async (req, res) => {
  try {
    const platform = req.params.platform.toLowerCase();
    
    // Save the click to the database
    await Lead.create({ platform });

    // Send a success message back to React
    res.status(200).json({ success: true, message: "Lead tracked successfully" });
  } catch (error) {
    console.error("Tracking error:", error);
    res.status(500).json({ message: "Failed to track lead" });
  }
});

// 2. THE STATS ROUTE (For your Marketing Manager Dashboard)
// URL: http://localhost:5000/api/leads/stats
router.get("/stats", async (req, res) => {
  try {
    // This groups all clicks by platform and counts them up
    const stats = await Lead.aggregate([
      { $group: { _id: "$platform", count: { $sum: 1 } } },
      { $sort: { count: -1 } } // Sorts highest to lowest
    ]);
    
    res.status(200).json(stats);
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

module.exports = router;