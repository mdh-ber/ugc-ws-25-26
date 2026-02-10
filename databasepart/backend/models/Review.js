const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ReviewRequest",
    required: true
  },

  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Content",
    required: true
  },

  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },

  comment: { type: String },

  criteria: {
    quality: Number,
    editing: Number,
    creativity: Number
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Review", ReviewSchema);
