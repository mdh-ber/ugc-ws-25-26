const express = require("express");
const router = express.Router();

const {
  createFeedback,
  getAllFeedback,
} = require("../controllers/feedbackController");

// GET all feedback
router.get("/", getAllFeedback);

// POST new feedback
router.post("/", createFeedback);

module.exports = router;