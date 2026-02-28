const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  rewardId: mongoose.Schema.Types.ObjectId,
  pointsUsed: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("rewardTransaction", transactionSchema);
