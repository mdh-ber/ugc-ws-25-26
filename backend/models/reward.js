const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema({
  title: String,
  description: String,
  pointsRequired: Number,
  stock: Number,
  isActive: Boolean
});

module.exports = mongoose.model("Reward", rewardSchema);
