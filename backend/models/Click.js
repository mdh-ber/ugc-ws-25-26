const mongoose = require('mongoose');

const ClickSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: false,
    default: 'anonymous'
  },
  trainingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Training',
    required: false
  },
  resourceType: {
    type: String,
    enum: ['training', 'guideline', 'profile', 'other'],
    default: 'other'
  },
  resourceId: {
    type: String,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  metadata: {
    page: String,
    action: String,
    userAgent: String
  }
});

// Add compound index for efficient querying
ClickSchema.index({ timestamp: -1, resourceType: 1 });
ClickSchema.index({ trainingId: 1, timestamp: -1 });

module.exports = mongoose.model('Click', ClickSchema);
