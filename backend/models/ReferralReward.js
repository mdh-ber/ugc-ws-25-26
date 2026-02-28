const mongoose = require("mongoose");

const referralRewardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  referralCode: { type: String, required: true },
  referredUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  pointsAwarded: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "completed", "expired"], default: "pending" },
  completedAt: { type: Date },
  expiresAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.models.ReferralReward || mongoose.model("ReferralReward", referralRewardSchema);
