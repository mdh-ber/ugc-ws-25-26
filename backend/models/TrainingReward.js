const mongoose = require("mongoose");

const trainingRewardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  link: { type: String, default: "" },
  date: { type: Date, required: true },
  duration: { type: String, default: "" },
  pointsAwarded: { type: Number, default: 0 },
  category: { type: String, enum: ["technical", "soft", "management"], default: "technical" },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

module.exports = mongoose.models.TrainingReward || mongoose.model("TrainingReward", trainingRewardSchema);
