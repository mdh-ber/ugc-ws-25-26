const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },

    // single platform (because your UI uses platform dropdown)
    platform: { type: String, default: "Instagram", trim: true },

    targetAudience: { type: String, default: "", trim: true },
    goals: { type: String, default: "", trim: true },

    // ✅ IMPORTANT (this was not updating)
    budget: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    assignedCreators: { type: [String], default: [] },

    // used by ROI
    utmCampaign: { type: String, required: true, lowercase: true, trim: true },

    status: { type: String, default: "active" }, // active | archived
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
