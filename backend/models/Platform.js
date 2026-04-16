const mongoose = require("mongoose");

const platformSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true, // This will store the "/uploads/filename.png" URL
  },
}, { timestamps: true });

module.exports = mongoose.model("Platform", platformSchema);