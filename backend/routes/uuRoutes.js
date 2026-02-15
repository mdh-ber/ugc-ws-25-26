const express = require("express");
const router = express.Router();

const {
  getRefereeOverview,
  getRefereeDetails,
  getReferralOverview,
  getReferralDetails,
} = require("../controllers/uuController");

// ✅ MUST BE ABOVE "/referee/:refereeId"
router.get("/referee/members", async (req, res) => {
  const days = Number(req.query.days || 7);

  // TEMP dummy data (should show in UI immediately)
  const members = [
    { id: "RF-101", name: "Referee A" },
    { id: "RF-102", name: "Referee B" },
  ];

  return res.json({ count: members.length, members, days });
});

// ✅ MUST BE ABOVE "/referral/:referralId"
router.get("/referral/members", async (req, res) => {
  const days = Number(req.query.days || 7);

  const members = [
    { id: "RL-201", name: "Referral A" },
    { id: "RL-202", name: "Referral B" },
  ];

  return res.json({ count: members.length, members, days });
});

// Referee
router.get("/referee/overview", getRefereeOverview);
router.get("/referee/:refereeId", getRefereeDetails);

// Referral
router.get("/referral/overview", getReferralOverview);
router.get("/referral/:referralId", getReferralDetails);

module.exports = router;