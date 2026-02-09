const express = require('express');
const router = express.Router();
const GuidelineController = require('../controllers/guidelineController');

// Get all guidelines
router.get('/', GuidelineController.getAllGuidelines);

// Get guideline by ID
router.get('/:id', GuidelineController.getGuidelineById);

// Get guidelines by category
router.get('/category/:category', GuidelineController.getGuidelinesByCategory);

// Create new guideline
router.post('/', GuidelineController.createGuideline);

// Update guideline
router.put('/:id', GuidelineController.updateGuideline);

// Delete guideline
router.delete('/:id', GuidelineController.deleteGuideline);

module.exports = router;
