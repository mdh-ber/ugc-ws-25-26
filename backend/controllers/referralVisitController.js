const ReferralVisit = require("../models/referralVisit");

exports.trackVisit = async (req, res) => {
  try {
    const { code } = req.params;

    const berlinTime = new Date().toLocaleString("sv-SE", {
      timeZone: "Europe/Berlin"
    });

    const visit = await ReferralVisit.create({
      userId: req.user?.id || "guest-user",
      creatorId: "creator1", // later fetch dynamically
      referralCode: code,
      hubspotTrackingId: req.headers["x-hubspot-id"] || "dummy-hs-id",
      capturedAt: berlinTime
    });

    res.json(visit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUniqueAudience = async (req, res) => {
  try {
    const data = await ReferralVisit.aggregate([
      {
        $group: {
          _id: {
            creatorId: "$creatorId",
            hubspotTrackingId: "$hubspotTrackingId"
          }
        }
      },
      {
        $group: {
          _id: "$_id.creatorId",
          uniqueUsers: { $sum: 1 }
        }
      }
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getClicksPerCreator = async (req, res) => {
  try {
    const data = await ReferralVisit.aggregate([
      {
        $group: {
          _id: "$creatorId",
          totalClicks: { $sum: 1 }
        }
      },
      {
        $project: {
          creatorId: "$_id",
          creatorName: "$_id", // replace later with real name
          totalClicks: 1,
          _id: 0
        }
      },
      {
        $sort: { totalClicks: -1 }
      }
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};