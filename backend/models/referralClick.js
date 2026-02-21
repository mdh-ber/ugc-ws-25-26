const mongoose = require("mongoose");

const referralClickSchema = new mongoose.Schema({
  creatorId: { type: String, required: true },
  referralCode: { type: String, required: true },
  clickedAt: { type: Date, default: Date.now },
  ipAddress: String
});

module.exports = mongoose.model("ReferralClick", referralClickSchema);