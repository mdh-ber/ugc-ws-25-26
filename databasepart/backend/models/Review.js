const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({

  reviewRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ReviewRequest",
    required: true
  },

  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  decision: {
    type: String,
    enum: ["approved", "rejected"],
    required: true
  },

  rating: {
    type: Number,
    min: 1,
    max: 5
  },

  comments: {
    type: String
  },

  feedbackTags: [{
    type: String
  }],

  reviewedAt: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("Review", ReviewSchema);
