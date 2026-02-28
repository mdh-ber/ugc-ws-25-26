const mongoose = require("mongoose");

const conversionSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
    },
    type: {
      type: String,
      enum: ["purchase", "signup", "download", "form_submit", "call", "other"],
      required: true,
      default: "purchase",
    },
    value: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
      trim: true,
    },
    source: {
      type: String,
      enum: ["website", "social", "email", "referral", "other"],
      default: "website",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

conversionSchema.index({ campaignId: 1 });
conversionSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Conversion", conversionSchema);
