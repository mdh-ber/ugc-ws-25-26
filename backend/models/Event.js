<<<<<<< HEAD
const mongoose = require("mongoose");

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

module.exports = mongoose.models.Event || mongoose.model("Event", eventSchema);
=======
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  date: {
    type: String, // Storing as String for flexibility (e.g., "Oct 24, 2025")
    required: true
  },
  time: {
    type: String,
    required: true
  },
  place: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Online', 'On-site'],
    default: 'On-site'
  },
  description: {
    type: String,
    required: true
  },
  speakers: {
    type: String // Comma-separated names
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
