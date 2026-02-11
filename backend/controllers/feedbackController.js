const Feedback = require("../models/feedback");

// ===== SAVE FEEDBACK =====
exports.submitFeedback = async (req, res) => {
  try {
    const { feedback } = req.body;

    if (!feedback || !feedback.trim()) {
      return res.status(400).json({ message: "Feedback is required" });
    }

    const newFeedback = new Feedback({ feedback });
    await newFeedback.save();

    res.status(201).json({
      message: "Feedback saved successfully",
      data: newFeedback,
    });
  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
