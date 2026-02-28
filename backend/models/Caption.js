const mongoose = require('mongoose');

const captionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['funny', 'inspirational', 'promotional', 'educational', 'personal', 'business'],
        required: true
    },
    tone: {
        type: String,
        enum: ['casual', 'professional', 'humorous', 'emotional', 'motivational'],
        default: 'casual'
    },
    usageCount: {
        type: Number,
        default: 0
    },
    suggestedHashtags: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

captionSchema.index({ text: 'text', category: 1, tone: 1 });

module.exports = mongoose.model('Caption', captionSchema);