const Guideline = require('../models/Guideline');
const { validationResult } = require('express-validator');

// @desc    Get all guidelines
// @route   GET /api/guidelines
// @access  Public
exports.getGuidelines = async (req, res) => {
  try {
    const {
      category,
      priority,
      status,
      tag,
      search,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    // Build query
    let query = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by priority
    if (priority) {
      query.priority = priority;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by tag
    if (tag) {
      query.tags = tag;
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;

    const guidelines = await Guideline.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('relatedGuidelines', 'title category')
      .lean();

    // Get total count for pagination
    const total = await Guideline.countDocuments(query);

    // Increment view count
    await Guideline.updateMany(
      { _id: { $in: guidelines.map(g => g._id) } },
      { $inc: { 'metadata.views': 1 } }
    );

    res.json({
      success: true,
      count: guidelines.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: guidelines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single guideline
// @route   GET /api/guidelines/:id
// @access  Public
exports.getGuideline = async (req, res) => {
  try {
    const guideline = await Guideline.findById(req.params.id)
      .populate('relatedGuidelines', 'title category priority')
      .populate('createdBy', 'name email')
      .populate('lastUpdatedBy', 'name email');

    if (!guideline) {
      return res.status(404).json({
        success: false,
        message: 'Guideline not found'
      });
    }

    // Increment view count
    guideline.metadata.views += 1;
    await guideline.save();

    res.json({
      success: true,
      data: guideline
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new guideline
// @route   POST /api/guidelines
// @access  Private (add authentication middleware)
exports.createGuideline = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const guideline = await Guideline.create(req.body);

    res.status(201).json({
      success: true,
      data: guideline
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating guideline',
      error: error.message
    });
  }
};

// @desc    Update guideline
// @route   PUT /api/guidelines/:id
// @access  Private
exports.updateGuideline = async (req, res) => {
  try {
    let guideline = await Guideline.findById(req.params.id);

    if (!guideline) {
      return res.status(404).json({
        success: false,
        message: 'Guideline not found'
      });
    }

    // Update guideline
    guideline = await Guideline.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        'metadata.lastReviewed': new Date()
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      data: guideline
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating guideline',
      error: error.message
    });
  }
};

// @desc    Delete guideline
// @route   DELETE /api/guidelines/:id
// @access  Private
exports.deleteGuideline = async (req, res) => {
  try {
    const guideline = await Guideline.findById(req.params.id);

    if (!guideline) {
      return res.status(404).json({
        success: false,
        message: 'Guideline not found'
      });
    }

    await guideline.deleteOne();

    res.json({
      success: true,
      message: 'Guideline deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting guideline',
      error: error.message
    });
  }
};

// @desc    Get guidelines by category
// @route   GET /api/guidelines/category/:category
// @access  Public
exports.getGuidelinesByCategory = async (req, res) => {
  try {
    const guidelines = await Guideline.find({ 
      category: req.params.category,
      status: 'Active'
    }).sort('priority');

    res.json({
      success: true,
      count: guidelines.length,
      data: guidelines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Search guidelines
// @route   GET /api/guidelines/search
// @access  Public
exports.searchGuidelines = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }

    const guidelines = await Guideline.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });

    res.json({
      success: true,
      count: guidelines.length,
      data: guidelines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get guidelines statistics
// @route   GET /api/guidelines/stats
// @access  Public
exports.getGuidelineStats = async (req, res) => {
  try {
    const stats = await Guideline.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
          },
          averageViews: { $avg: '$metadata.views' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const totalGuidelines = await Guideline.countDocuments();
    const needsReview = await Guideline.countDocuments({
      $expr: {
        $lt: [
          { $add: ['$metadata.lastReviewed', { $multiply: ['$metadata.reviewCycleDays', 24 * 60 * 60 * 1000] }] },
          new Date()
        ]
      }
    });

    res.json({
      success: true,
      data: {
        totalGuidelines,
        needsReview,
        byCategory: stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Like a guideline
// @route   POST /api/guidelines/:id/like
// @access  Public (consider adding authentication)
exports.likeGuideline = async (req, res) => {
  try {
    const guideline = await Guideline.findByIdAndUpdate(
      req.params.id,
      { $inc: { 'metadata.likes': 1 } },
      { new: true }
    );

    if (!guideline) {
      return res.status(404).json({
        success: false,
        message: 'Guideline not found'
      });
    }

    res.json({
      success: true,
      likes: guideline.metadata.likes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};