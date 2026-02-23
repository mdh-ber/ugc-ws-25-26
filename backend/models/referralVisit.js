const mongoose = require("mongoose");

const referralVisitSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  creatorId: { type: String, required: true },
  referralCode: String,
  hubspotTrackingId: String,
  capturedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ReferralVisit", referralVisitSchema);