const express = require("express");
const mongoose = require("mongoose");
const Click = require("../models/Click");

const router = express.Router();

router.get("/clicks-per-creator", async (req, res) => {
  try {
    const result = await Click.aggregate([
      {
        $group: {
          _id: { creatorId: "$creatorId", platform: "$platform" },
          clicks: { $sum: 1 },
          totalReach: { $sum: "$reach" },
        },
      },
      {
        $group: {
          _id: "$_id.creatorId",
          platforms: {
            $push: {
              name: "$_id.platform",
              clicks: "$clicks",
              reach: "$totalReach",
            },
          },
          totalClicks: { $sum: "$clicks" },
        },
      },
      {
        $project: {
          creatorId: "$_id",
          creatorName: {
            $concat: ["Creator ", { $substr: [{ $toString: "$_id" }, 18, 6] }]
          },
          totalClicks: 1,
          platforms: 1,
          _id: 0,
        },
      },
      { $sort: { totalClicks: -1 } },
    ]);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;