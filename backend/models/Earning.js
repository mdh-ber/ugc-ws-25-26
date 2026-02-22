const mongoose = require('mongoose');

const earningSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  creator: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'Twitter']
  },
  revenue: {
    type: Number,
    required: true,
    min: 0
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  impressions: {
    type: Number,
    default: 0
  },
  engagement: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  conversions: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate ROI
earningSchema.virtual('roi').get(function() {
  if (this.cost === 0) return 0;
  return ((this.revenue - this.cost) / this.cost) * 100;
});

// Ensure virtual fields are serialized
earningSchema.set('toJSON', { virtuals: true });
earningSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Earning', earningSchema);