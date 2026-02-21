const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const auth = require('../middleware/auth'); // Ensure only logged-in users see stats

router.post('/', leadController.createLead); // Public: Landing page form submission
router.get('/stats', auth, leadController.getLeadStats); // Protected: Dashboard stats

module.exports = router;