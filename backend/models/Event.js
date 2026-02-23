<<<<<<< HEAD
const mongoose = require("mongoose");
=======
// backend/models/Event.js
import mongoose from "mongoose";
>>>>>>> 9c7478ea2d4b0fddd8a5db23bc54a2da25ecc049

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    date: { type: Date, required: true },
    location: { type: String, default: "" },

    // optional fields (keep if your UI sends them)
    imageUrl: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

<<<<<<< HEAD
module.exports = mongoose.models.Event || mongoose.model("Event", eventSchema);
=======
const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);

export default Event;
>>>>>>> 9c7478ea2d4b0fddd8a5db23bc54a2da25ecc049
