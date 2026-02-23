const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const auth = require('../middleware/auth'); // Ensure only logged-in users see stats

router.post('/', leadController.createLead); // Public: Landing page form submission
router.get('/stats', leadController.getLeadStats); // Protected: Dashboard stats

module.exports = router;
const express = require("express");
const router = express.Router();
const leadController = require("../controllers/leadController");

router.post("/create", leadController.createLead);
router.get("/count", leadController.countLeads);
router.get("/chart", leadController.getChartData);

module.exports = router;