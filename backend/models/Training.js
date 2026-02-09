const mongoose = require('mongoose');

const TrainingSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Title is required'],
    trim: true 
  },
  type: { 
    type: String, 
    enum: ['video', 'pdf'], // VALIDATION: Only allows these two words
    required: true 
  },
  url: { 
    type: String, 
    required: true,
    match: [/^(http|https):\/\//, 'Must be a valid URL'] // VALIDATION: Checks for http
  },
  category: { 
    type: String, 
    enum: ['Onboarding', 'Content Tips', 'Guidelines'], 
    default: 'Content Tips'
  },
  thumbnail: { 
    type: String,
    default: 'https://via.placeholder.com/150' // Default image if none provided
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Training', TrainingSchema);