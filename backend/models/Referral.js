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
  referralCodeId: {
    type: mongoose.Schema.Types.ObjectId, // Use ObjectId for referencing
    ref: 'ReferralCode', // Reference the ReferralCode model
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  socialMediaPlatform: {
    type: String,
    enum: [ 'Facebook',
  'Instagram',
  'X (Twitter)',
  'Threads',
  'LinkedIn',
  'YouTube',
  'TikTok',
  'Vimeo',
  'Twitch',
  'WhatsApp',
  'Telegram',
  'Discord',
  'WeChat',
  'Pinterest',
  'Snapchat',
  'Reddit',
  'Quora',
  'LINE',
  'KakaoTalk',
  'VK',
  'Other'],
    //required: true
  },
  applicantLocation: {
    type: String,
    enum: [ 'Berlin','Dusseldorf','Munich'],
    //required: true,
    trim: true
  },
  refereeUUID: {
    type: mongoose.Schema.Types.ObjectId, // Use ObjectId for referencing
    ref: 'RefereeUu', // Reference the RefereeUu model
    trim: true
  },
  referrerUUID: {
   type: mongoose.Schema.Types.ObjectId, // Use ObjectId for referencing
    ref: 'ReferralUu', // Reference the ReferralUu model
    trim: true
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

const ReferralCodeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Use ObjectId for referencing
    ref: 'UserProfile', // Reference the User model
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    trim: true
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId, // Use ObjectId for referencing
    ref: 'Campaign', // Reference the Campaign model
    trim: true
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
  ReferralCode: mongoose.model('ReferralCode', ReferralCodeSchema),
};  