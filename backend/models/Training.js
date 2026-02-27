const mongoose = require("mongoose");

const TrainingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Video', 'PDF','Link'], 
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
   isactive: {
    type: Boolean,
    default: true
  },
  createdby: {
    type: String,
    required: false
  },
  updatedby: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
   updatedAt: {
    type: Date,
    default: Date.now
  }
});
/*
const TrainingScheduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  instructor: {
    type: String,
    required: true,
    trim: true
  },
  trainingDate: {
    type: Date,
    required: true
  }, 
  type: {
    type: String,
    enum: ['online', 'onsite','vdo'], // This restricts inputs to ONLY these two types
    required: true
  },
  location: {
    type: String,
    required: false
  },
  captacity: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String,
    required: false
  },  
  hashtags: {
    type: Array,
    required: false
  },  
  status: {
    type: String,
    enum: ['Open', 'Closed', 'Cancelled'],
    default: 'Open'
  }, 
  thumbnail: {
    type: String, // URL to the image
    default: 'https://placehold.co/600x400'
  },
  isactive: {
    type: Boolean,
    default: true
  },
  createdby: {
    type: String,
    required: false
  },
  updatedby: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
   updatedAt: {
    type: Date,
    default: Date.now
  },
});

const TrainingProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  trainingScheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingSchedule',
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  progressPercentage: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
   updatedAt: {
    type: Date,
    default: Date.now
  }
});
*/

module.exports =
  mongoose.models.Training || mongoose.model("Training", TrainingSchema);
