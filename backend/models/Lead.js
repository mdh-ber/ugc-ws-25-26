const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  platform: { 
    type: String, 
    required: true,
    enum: ['Facebook', 'LinkedIn', 'Google Ads', 'Organic', 'Other'],
    default: 'Organic'
  }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);