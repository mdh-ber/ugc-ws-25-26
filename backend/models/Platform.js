const mongoose = require("mongoose");

const platformSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true }, // Will store the Base64 string directly
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Platform", platformSchema);