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