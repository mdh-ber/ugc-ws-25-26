const mongoose = require("mongoose");

const ReviewRequestSchema = new mongoose.Schema({

  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  contentTitle: {
    type: String,
    required: true
  },

  contentType: {
    type: String,
    enum: ["video", "photo"],
    required: true
  },

  contentUrl: {
    type: String,
    required: true
  },

  thumbnailUrl: {
    type: String
  },

  description: {
    type: String
  },

  status: {
    type: String,
    enum: ["pending", "in_review", "approved", "rejected"],
    default: "pending"
  },

  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },

  assignedReviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  submittedAt: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("ReviewRequest", ReviewRequestSchema);
