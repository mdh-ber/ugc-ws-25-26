const express = require("express");
const router = express.Router();

const {
  getRefereeOverview,
  getRefereeDetails,
  getReferralOverview,
  getReferralDetails,
} = require("../controllers/uuController");

// Referee
router.get("/referee/overview", getRefereeOverview);
router.get("/referee/:refereeId", getRefereeDetails);

// Referral
router.get("/referral/overview", getReferralOverview);
router.get("/referral/:referralId", getReferralDetails);

module.exports = router;