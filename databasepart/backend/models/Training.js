const mongoose = require("mongoose");

const TrainingSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  type: {
    type: String,
    enum: ["video", "article", "course"],
    default: "video"
  },

  category: {
    type: String
  },

  url: {
    type: String,
    required: true
  },

  thumbnail: {
    type: String
  },

  difficultyLevel: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner"
  },

  durationMinutes: {
    type: Number
  },

  isPublished: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("Training", TrainingSchema);
