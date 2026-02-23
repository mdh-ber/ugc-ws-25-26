<<<<<<< HEAD
const mongoose = require("mongoose");
=======
// backend/models/Training.js
import mongoose from "mongoose";
>>>>>>> 9c7478ea2d4b0fddd8a5db23bc54a2da25ecc049

const trainingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    link: { type: String, default: "" },
    date: { type: Date },
  },
  { timestamps: true }
);

<<<<<<< HEAD
module.exports =
  mongoose.models.Training || mongoose.model("Training", trainingSchema);
=======
const Training =
  mongoose.models.Training || mongoose.model("Training", trainingSchema);

export default Training;
>>>>>>> 9c7478ea2d4b0fddd8a5db23bc54a2da25ecc049
