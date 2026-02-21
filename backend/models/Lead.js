const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  platform: { type: String, required: true },
  creatorId: { type: String, default: 'Internal' } // ✅ Added this to track the person
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);