// backend/models/Training.js
const mongoose = require("mongoose");

const trainingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    link: { type: String, default: "" },
    date: { type: Date },
  },
  { timestamps: true }
);

const Training =
  mongoose.models.Training || mongoose.model("Training", trainingSchema);

module.exports = Training;