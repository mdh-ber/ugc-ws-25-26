// backend/models/Event.js
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String }, // Now accepts the Base64 String
  date: { type: String, required: true },
  time: { type: String, required: true },
  place: { type: String, required: true },
  type: {
    type: String,
    enum: ['Online', 'On-site'],
    default: 'On-site'
  },
  description: { type: String, required: true },
  speakers: { type: String }
}, { timestamps: true });

module.exports = mongoose.models.Event || mongoose.model("Event", eventSchema);