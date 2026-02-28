const mongoose = require("mongoose");

const marketingMetricSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    campaignName: {
      type: String,
      required: true,
      trim: true,
    },
    impressions: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    ctr: {
      type: Number,
      default: 0,
      comment: "Click-through rate as percentage",
    },
    conversions: {
      type: Number,
      default: 0,
    },
    conversionRate: {
      type: Number,
      default: 0,
      comment: "Conversion rate as percentage",
    },
    spend: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
    roi: {
      type: Number,
      default: 0,
      comment: "Return on investment as percentage",
    },
  },
  { timestamps: true },
);

// Index for fast date-range queries
marketingMetricSchema.index({ createdAt: -1 });
marketingMetricSchema.index({ campaignId: 1, createdAt: -1 });

module.exports = mongoose.model("MarketingMetric", marketingMetricSchema);
