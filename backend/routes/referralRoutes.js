const express = require("express");
const router = express.Router();
const { getReferrals, addReferrals, getReferralById, updateReferral, deleteReferral
   } = require("../controllers/referralController");

// Referral routes
router.get("/", getReferrals);
router.get("/:id", getReferralById);
router.post("/", addReferrals);
router.put("/:id", updateReferral);
router.delete("/:id", deleteReferral);

module.exports = router;
