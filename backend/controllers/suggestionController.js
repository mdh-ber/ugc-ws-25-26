const Hashtag = require('../models/Hashtag');
const Caption = require('../models/Caption');

// Get suggested hashtags
exports.getHashtags = async (req, res) => {
    try {
        const { keyword, category, limit = 10 } = req.query;
        
        let query = {};
        
        if (keyword) {
            query.$text = { $search: keyword };
        }
        
        if (category && category !== 'all') {
            query.category = category;
        }
        
        const hashtags = await Hashtag.find(query)
            .sort({ popularity: -1, usageCount: -1 })
            .limit(parseInt(limit));
        
        res.json({
            success: true,
            count: hashtags.length,
            data: hashtags
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching hashtags',
            error: error.message
        });
    }
};

// Get suggested captions
exports.getCaptions = async (req, res) => {
    try {
        const { category, tone, limit = 5 } = req.query;
        
        let query = {};
        
        if (category && category !== 'all') {
            query.category = category;
        }
        
        if (tone && tone !== 'all') {
            query.tone = tone;
        }
        
        const captions = await Caption.find(query)
            .sort({ usageCount: -1 })
            .limit(parseInt(limit));
        
        res.json({
            success: true,
            count: captions.length,
            data: captions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching captions',
            error: error.message
        });
    }
};

// Get trending hashtags
exports.getTrendingHashtags = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const trendingHashtags = await Hashtag.find({ category: 'trending' })
            .sort({ popularity: -1, usageCount: -1 })
            .limit(parseInt(limit));
        
        res.json({
            success: true,
            count: trendingHashtags.length,
            data: trendingHashtags
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching trending hashtags',
            error: error.message
        });
    }
};

// Add new hashtag (for seeding/admin purposes)
exports.addHashtag = async (req, res) => {
    try {
        const hashtag = new Hashtag(req.body);
        await hashtag.save();
        
        res.status(201).json({
            success: true,
            data: hashtag
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error adding hashtag',
            error: error.message
        });
    }
};

// Add new caption (for seeding/admin purposes)
exports.addCaption = async (req, res) => {
    try {
        const caption = new Caption(req.body);
        await caption.save();
        
        res.status(201).json({
            success: true,
            data: caption
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error adding caption',
            error: error.message
        });
    }
};

// Increment usage count for hashtag
exports.incrementHashtagUsage = async (req, res) => {
    try {
        const { id } = req.params;
        
        const hashtag = await Hashtag.findByIdAndUpdate(
            id,
            { $inc: { usageCount: 1 } },
            { new: true }
        );
        
        res.json({
            success: true,
            data: hashtag
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating hashtag usage',
            error: error.message
        });
    }
};

// Increment usage count for caption
exports.incrementCaptionUsage = async (req, res) => {
    try {
        const { id } = req.params;
        
        const caption = await Caption.findByIdAndUpdate(
            id,
            { $inc: { usageCount: 1 } },
            { new: true }
        );
        
        res.json({
            success: true,
            data: caption
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating caption usage',
            error: error.message
        });
    }
};