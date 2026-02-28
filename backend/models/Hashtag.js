const mongoose = require('mongoose');

const hashtagSchema = new mongoose.Schema({
    tag: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['general', 'trending', 'niche', 'location', 'brand'],
        default: 'general'
    },
    popularity: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    usageCount: {
        type: Number,
        default: 0
    },
    relatedTags: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

hashtagSchema.index({ tag: 'text', category: 1 });

module.exports = mongoose.model('Hashtag', hashtagSchema);