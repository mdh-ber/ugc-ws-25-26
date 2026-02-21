const mongoose = require('mongoose');

const ReferralSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  surName: {
    type: String,
    required: true,
    trim: true
  },
  intake: {
     type: String,
    enum: ['Winter', 'Summer'], 
    required: true
  },
  year: {
    type: String,
    required: true
  },
  enrolledCourse: {
    type: String,
    required: true
  },
  referredBy: {
    type: String,
    required: true,
    trim: true
  },
   referralDate: {
    type: Date,
    required: true
  },
  enrollmentStatus: {
    type: String,
    enum: ['Enrolled', 'Pending', 'Not Enrolled'],
    required: true
  },
  rewardStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    required: true
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

module.exports = {
  Referral: mongoose.model('Referral', ReferralSchema),
};  