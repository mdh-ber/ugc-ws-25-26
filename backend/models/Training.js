const mongoose = require("mongoose");

const TrainingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String },
  url: { type: String },
  thumbnail: { type: String },
  category: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Training", TrainingSchema);
