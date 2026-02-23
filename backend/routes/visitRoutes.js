const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Visit = require("../models/visit");

// API สำหรับบันทึกการเข้าชม
router.post("/track", async (req, res) => {
  try {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || "0.0.0.0";
    const ipHash = crypto.createHash("sha256").update(clientIp).digest("hex");

    await Visit.create({ 
      ipHash, 
      userAgent: req.get("User-Agent") 
    });

    res.status(200).json({ message: "Visit tracked" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API สำหรับดึงสถิติ (เอา await กลับเข้ามาไว้ในนี้)
router.get("/stats", async (req, res) => {
  try {
    const totalVisits = await Visit.countDocuments();
    const uniqueIps = await Visit.distinct("ipHash");

    const dailyStats = await Visit.aggregate([
      {
        $group: {
          _id: { 
            $dateToString: { 
              format: "%Y-%m-%d", 
              date: "$timestamp",
              timezone: "Europe/Berlin"
            } 
          },
          total: { $sum: 1 },
          uniqueIps: { $addToSet: "$ipHash" }
        }
      },
      {
        $project: {
          date: "$_id",
          total: 1,
          unique: { $size: "$uniqueIps" },
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.json({
      totalVisits,
      uniqueVisits: uniqueIps.length,
      dailyStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;