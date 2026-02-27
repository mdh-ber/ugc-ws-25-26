const mongoose = require("mongoose");

// =======================
// Campaign Schema
// =======================
const CampaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },

    // single platform (because your UI uses platform dropdown)
    platform: { type: String, default: "Instagram", trim: true },

    targetAudience: { type: String, default: "", trim: true },
    goals: { type: String, default: "", trim: true },

    budget: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    assignedCreators: { type: [String], default: [] },

    // used by ROI
    utmCampaign: { type: String, required: true, lowercase: true, trim: true },

    status: { type: String, default: "active" }, // active | archived
  },
  { timestamps: true }
);

// =======================
// Campaign Metric Schema (ROI)
// =======================
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
CampaignMetricSchema.index(
  { campaignId: 1, day: 1, platform: 1 },
  { unique: true }
);

// =======================
// Safe model creation (prevents overwrite errors in watch mode)
// =======================
const Campaign =
  mongoose.models.Campaign || mongoose.model("Campaign", CampaignSchema);

const CampaignMetric =
  mongoose.models.CampaignMetric ||
  mongoose.model("CampaignMetric", CampaignMetricSchema);

// Export BOTH from one file
module.exports = { Campaign, CampaignMetric };