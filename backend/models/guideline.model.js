const mongoose = require('mongoose');

const guidelineSchema = new mongoose.Schema(
{
  title: { type: String, required: true },
  category: { type: String },
  type: { type: String, enum: ['do', 'dont'] },
  content: { type: String, required: true },
  tags: [String],
  audience: { type: String, default: 'all' },
  status: { type: String, default: 'published' }
},
{ timestamps: true }
);

module.exports = mongoose.model('Guideline', guidelineSchema);
