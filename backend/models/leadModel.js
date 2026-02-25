const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  source: String, // Facebook, Website, Google, Instagram, Referral
  status: String, // New, Contacted, Qualified, Lost
  country: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Lead", leadSchema);