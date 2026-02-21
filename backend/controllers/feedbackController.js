const Feedback = require("../models/feedback.model");

// POST /api/feedback
const createFeedback = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Feedback message is required" });
    }

    const saved = await Feedback.create({ message: message.trim() });
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/feedback  (get all feedback)
const getAllFeedback = async (req, res) => {
  try {
    const data = await Feedback.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createFeedback,
  getAllFeedback,
};