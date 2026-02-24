const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",   // assuming creators are users
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipHash: {
    type: String,
    required: true
  },
  userAgent: String
});

module.exports = mongoose.model("Visit", visitSchema);