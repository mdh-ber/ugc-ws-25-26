const mongoose = require("mongoose");

const clickSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Creator",
  },
  platform: String,
  reach: Number,
  clickedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Click", clickSchema);