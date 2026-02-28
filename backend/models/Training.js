const mongoose = require("mongoose");

const trainingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    link: { type: String, default: "" },
    linkText: { type: String, default: "Read File" },
    linkType: { type: String, enum: ["video", "file"], default: "file" },
    category: { type: String, default: "general" },
    isActive: { type: Boolean, default: true },
    date: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Training || mongoose.model("Training", trainingSchema);
