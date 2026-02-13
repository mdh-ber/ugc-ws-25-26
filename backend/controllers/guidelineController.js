const Guideline = require('../models/guideline.model');

// @desc    Get all guidelines
// @route   GET /api/guidelines
const getGuidelines = async (req, res) => {
  try {
    const guidelines = await Guideline.find({ isActive: true })
      .populate('createdBy', 'name email');
    res.json(guidelines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single guideline
// @route   GET /api/guidelines/:id
const getGuideline = async (req, res) => {
  try {
    const guideline = await Guideline.findById(req.params.id)
      .populate('createdBy', 'name email');
    if (!guideline) {
      return res.status(404).json({ message: 'Guideline not found' });
    }
    res.json(guideline);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new guideline
// @route   POST /api/guidelines
const createGuideline = async (req, res) => {
  try {
    const { text, type, category } = req.body;
    
    // For now, use a default user ID (you'll need to get this from auth later)
    const createdBy = req.user?.id || '507f1f77bcf86cd799439011'; // Temporary default ID
    
    const guideline = new Guideline({
      text,
      type,
      category,
      createdBy
    });
    
    const savedGuideline = await guideline.save();
    res.status(201).json(savedGuideline);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update guideline
// @route   PUT /api/guidelines/:id
const updateGuideline = async (req, res) => {
  try {
    const guideline = await Guideline.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!guideline) {
      return res.status(404).json({ message: 'Guideline not found' });
    }
    res.json(guideline);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete guideline (soft delete)
// @route   DELETE /api/guidelines/:id
const deleteGuideline = async (req, res) => {
  try {
    const guideline = await Guideline.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!guideline) {
      return res.status(404).json({ message: 'Guideline not found' });
    }
    res.json({ message: 'Guideline deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get guidelines by category/type
// @route   GET /api/guidelines/category/:category
const getGuidelinesByCategory = async (req, res) => {
  try {
    const guidelines = await Guideline.find({ 
      type: req.params.category,
      isActive: true 
    });
    res.json(guidelines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search guidelines
// @route   GET /api/guidelines/search
const searchGuidelines = async (req, res) => {
  try {
    const { q } = req.query;
    const guidelines = await Guideline.find({
      $text: { $search: q },
      isActive: true
    });
    res.json(guidelines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get guideline stats
// @route   GET /api/guidelines/stats
const getGuidelineStats = async (req, res) => {
  try {
    const stats = await Guideline.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like a guideline
// @route   POST /api/guidelines/:id/like
const likeGuideline = async (req, res) => {
  try {
    const guideline = await Guideline.findById(req.params.id);
    if (!guideline) {
      return res.status(404).json({ message: 'Guideline not found' });
    }
    
    await guideline.like();
    res.json(guideline);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGuidelines,
  getGuideline,
  createGuideline,
  updateGuideline,
  deleteGuideline,
  getGuidelinesByCategory,
  searchGuidelines,
  getGuidelineStats,
  likeGuideline
};