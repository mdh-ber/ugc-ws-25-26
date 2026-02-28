const mongoose = require("mongoose");

const TrainingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["video", "pdf", "article"], // add whatever you need
      required: true,
    },
    category: String,
    url: String,
    thumbnail: String,
    description: { type: String, default: "" }, // make optional
  },
  { timestamps: true },
);

module.exports = {
  Training: mongoose.model("Training", TrainingSchema),
};
