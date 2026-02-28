const express = require("express");
const router = express.Router();

const {
  getRefereeMembers,
  getReferralMembers,
  getRefereeOverview,
  getRefereeDetails,
  getReferralOverview,
  getReferralDetails,
} = require("../controllers/uuController");

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