const express = require("express");
const router = express.Router();
const clickController = require("../controllers/clickController");

// Log a new click
router.post("/", clickController.logClick);

// Get click statistics with filters
router.get("/stats", clickController.getClickStats);

// Get all clicks
router.get("/", clickController.getClicks);

module.exports = router;
