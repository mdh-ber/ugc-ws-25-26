const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  clickedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Lead", leadSchema);