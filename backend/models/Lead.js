const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  platform: { 
    type: String, 
    required: true,
    // Expanded to include all major platforms
    enum: [
      'tiktok', 'instagram', 'youtube', 'facebook', 
      'twitter', 'linkedin', 'snapchat', 'pinterest', 
      'reddit', 'threads'
    ] 
  },
  clickedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Lead", leadSchema);