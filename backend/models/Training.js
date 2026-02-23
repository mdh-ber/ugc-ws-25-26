// backend/models/Training.js
import mongoose from "mongoose";

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

export default Training;