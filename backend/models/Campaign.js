<<<<<<< 163-frontend-for-mdh-managers-customizable-financial-report
const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  spent: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  platform: {
    type: String,
    required: true,
    enum: ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'Twitter']
  },
  targetAudience: {
    type: String,
    required: true
  },
  goals: {
    type: String,
    required: true
  },
  assignedCreators: [{
    type: String,
    required: true
  }],
  createdBy: {
    type: String,
    required: true
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

// Update the updatedAt field before saving
campaignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Campaign', campaignSchema);
=======
const mongoose = require("mongoose");

const CampaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    target: { type: String, default: "" },

    platforms: { type: [String], default: [] },
    creators: { type: [String], default: [] },

    rewardsDelivered: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },

    // used later for dynamic ROI attribution
    utmCampaign: { type: String, required: true, unique: true },

    status: { type: String, enum: ["active", "archived"], default: "active" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Campaign", CampaignSchema);
>>>>>>> main
