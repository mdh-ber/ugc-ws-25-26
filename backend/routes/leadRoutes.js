const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");

// GET Lead Stats (For Marketing Dashboard)
router.get("/stats", async (req, res) => {
  try {
    const stats = await Lead.aggregate([
      { $group: { _id: "$platform", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// GET Track Lead (For Creator Links)
router.get("/track/:platform", async (req, res) => {
  try {
    const platform = req.params.platform.toLowerCase();
    await Lead.create({ platform });
    res.json({ success: true, message: "Lead tracked" });
  } catch (err) {
    res.status(500).json({ message: "Failed to track" });
  }
});

module.exports = router;