const mongoose = require('mongoose');

const TrainingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['video', 'pdf'], // This restricts inputs to ONLY these two types
    required: true
  },
  url: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Onboarding', 'Content Strategy', 'Guidelines'],
    default: 'Content Strategy'
  },
  thumbnail: {
    type: String, // URL to the image
    default: 'https://placehold.co/600x400'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Training', TrainingSchema);