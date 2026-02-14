const mongoose = require("mongoose");

const RefereeUuSchema = new mongoose.Schema({
  refereeId: { type: String, required: true },
  date: { type: String, required: true }, // "YYYY-MM-DD"
  uu: { type: Number, required: true },
}, { timestamps: true });

RefereeUuSchema.index({ refereeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("RefereeUu", RefereeUuSchema);