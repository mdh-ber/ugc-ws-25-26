const express = require('express');
const router = express.Router();
const {
  getGuidelines,
  getGuideline,
  createGuideline,
  updateGuideline,
  deleteGuideline,
  getGuidelinesByCategory,
  searchGuidelines,
  getGuidelineStats,
  likeGuideline
} = require('../controllers/guidelineController');

// Routes
router.get('/', getGuidelines);
router.get('/category/:category', getGuidelinesByCategory);
router.get('/search', searchGuidelines);
router.get('/stats', getGuidelineStats);
router.get('/:id', getGuideline);
router.post('/', createGuideline);
router.put('/:id', updateGuideline);
router.delete('/:id', deleteGuideline);
router.post('/:id/like', likeGuideline);

module.exports = router;