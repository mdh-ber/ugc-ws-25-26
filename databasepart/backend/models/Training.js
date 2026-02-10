const mongoose = require("mongoose");

const ContentSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  title: { type: String, required: true },
  description: { type: String },

  type: {
    type: String,
    enum: ["video", "photo"],
    required: true
  },

  mediaUrl: { type: String, required: true },
  thumbnail: { type: String },

  category: { type: String },
  tags: [String],

  reviewSummary: {
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Content", ContentSchema);
