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