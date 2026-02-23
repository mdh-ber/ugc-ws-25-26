const mongoose = require("mongoose");

const CampaignMetricSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true,
    },

    // store as YYYY-MM-DD for easy grouping
    day: { type: String, required: true, index: true },

    platform: { type: String, default: "unknown" },

    spend: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// prevent duplicates per campaign per day per platform
CampaignMetricSchema.index({ campaignId: 1, day: 1, platform: 1 }, { unique: true });

module.exports = mongoose.model("CampaignMetric", CampaignMetricSchema);