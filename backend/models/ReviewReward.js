const mongoose = require("mongoose");

const reviewRewardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  trainingId: { type: mongoose.Schema.Types.ObjectId, ref: "Training" },
  reviewText: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  pointsAwarded: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  reviewedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.ReviewReward || mongoose.model("ReviewReward", reviewRewardSchema);
