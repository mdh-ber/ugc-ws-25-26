const express = require('express');
const router = express.Router();
const suggestionController = require('../controllers/suggestionController');

router.get('/hashtags', suggestionController.getHashtags);
router.get('/captions', suggestionController.getCaptions);
router.get('/hashtags/trending', suggestionController.getTrendingHashtags);
router.post('/hashtags', suggestionController.addHashtag);
router.post('/captions', suggestionController.addCaption);
router.patch('/hashtags/:id/usage', suggestionController.incrementHashtagUsage);
router.patch('/captions/:id/usage', suggestionController.incrementCaptionUsage);

module.exports = router;