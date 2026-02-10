const mongoose = require("mongoose");

const ReviewRequestSchema = new mongoose.Schema({
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Content",
    required: true
  },

  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  message: { type: String },

  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },

  status: {
    type: String,
    enum: ["open", "in_review", "completed", "rejected"],
    default: "open"
  },

  deadline: { type: Date },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ReviewRequest", ReviewRequestSchema);
