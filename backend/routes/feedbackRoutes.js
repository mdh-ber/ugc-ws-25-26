<<<<<<< HEAD
const router = require("express").Router();
const Feedback = require("../models/feedback.model.js"); 

// ✅ Save feedback (supports both "message" and "feedback" from frontend)
router.post("/", async (req, res) => {
  try {
    const text = (req.body.feedback ?? req.body.message ?? "").trim();

    if (!text || text.length < 2) {
      return res.status(400).json({ message: "Feedback is required" });
    }

    // IMPORTANT: your schema requires "feedback"
    await Feedback.create({ feedback: text });

    return res.status(201).json({ message: "Feedback saved" });
  } catch (err) {
    console.error("feedback POST error:", err);
    return res.status(500).json({ message: "Failed to save feedback" });
  }
});

// ✅ View feedbacks
router.get("/", async (req, res) => {
  try {
    const items = await Feedback.find().sort({ createdAt: -1 });
    return res.json({ items });
  } catch (err) {
    console.error("feedback GET error:", err);
    return res.status(500).json({ message: "Failed to load feedbacks" });
  }
});

module.exports = router;
=======
const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");

// POST /api/feedback
router.post("/", feedbackController.submitFeedback);

module.exports = router;
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
