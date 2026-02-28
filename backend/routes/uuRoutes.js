const express = require("express");
const router = express.Router();

const {
<<<<<<< HEAD
  getRefereeMembers,
  getReferralMembers,
=======
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
  getRefereeOverview,
  getRefereeDetails,
  getReferralOverview,
  getReferralDetails,
} = require("../controllers/uuController");

<<<<<<< HEAD
// Members (dynamic)
router.get("/referee/members", getRefereeMembers);
router.get("/referral/members", getReferralMembers);

// Overview
router.get("/referee/overview", getRefereeOverview);
router.get("/referral/overview", getReferralOverview);

// Details
router.get("/referee/:refereeId", getRefereeDetails);
router.get("/referral/:referralId", getReferralDetails);

module.exports = router;
=======
// ✅ MUST BE ABOVE "/referee/:refereeId"
router.get("/referee/members", async (req, res) => {
  const days = Number(req.query.days || 7);

  // TEMP dummy data (should show in UI immediately)
  const members = [
    { id: "RF-101", name: "Referee A" },
    { id: "RF-102", name: "Referee B" },
    { id: "RL-203", name: "Referral C" },
    { id: "RL-204", name: "Referral D" },
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
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
