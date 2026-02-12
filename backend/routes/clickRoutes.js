const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const clickController = require("../controllers/clickController");

// Rate limiter for click logging - allows 100 requests per 15 minutes per IP
const clickLogLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many click events from this IP, please try again later."
});

// Rate limiter for stats - allows 30 requests per 15 minutes per IP
const statsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: "Too many requests from this IP, please try again later."
});

// Log a new click
router.post("/", clickLogLimiter, clickController.logClick);

// Get click statistics with filters
router.get("/stats", statsLimiter, clickController.getClickStats);

// Get all clicks
router.get("/", statsLimiter, clickController.getClicks);

module.exports = router;
