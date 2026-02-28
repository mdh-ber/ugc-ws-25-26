const mongoose = require("mongoose");

const eventRewardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  date: { type: Date, required: true },
  location: { type: String, default: "" },
  duration: { type: String, default: "" },
  pointsAwarded: { type: Number, default: 0 },
  category: { type: String, enum: ["conference", "workshop", "networking"], default: "conference" },
  maxAttendees: { type: Number, default: 0 },
  currentAttendees: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

module.exports = mongoose.models.EventReward || mongoose.model("EventReward", eventRewardSchema);
