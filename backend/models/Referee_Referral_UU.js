const mongoose = require("mongoose");

const RefereeReferralUuSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      required: true,
      enum: ["referee", "referral"],
      index: true,
    },
    entityName: { 
      type: String, 
      default: "" ,
    },
    entityId: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true, // "YYYY-MM-DD"
      index: true,
    },
    uu: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

RefereeReferralUuSchema.index(
  { entityType: 1, entityId: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model("RefereeReferralUu", RefereeReferralUuSchema);