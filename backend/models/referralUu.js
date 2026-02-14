const mongoose = require("mongoose");

const ReferralUuSchema = new mongoose.Schema({
  referralId: { type: String, required: true },
  date: { type: String, required: true },
  uu: { type: Number, required: true },
}, { timestamps: true });

ReferralUuSchema.index({ referralId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("ReferralUu", ReferralUuSchema);