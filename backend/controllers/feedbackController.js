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
 
// GET /api/feedback?page=1&limit=10&resolved=true|false|all
// Admin use (pagination)
const getFeedbackPaginated = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
 
    const resolved = (req.query.resolved || "all").toLowerCase();
 
    const filter = {};
    if (resolved === "true") filter.resolved = true;
    if (resolved === "false") filter.resolved = false;
 
    const skip = (page - 1) * limit;
 
    const [items, total] = await Promise.all([
      Feedback.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Feedback.countDocuments(filter),
    ]);
 
    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      items,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
// PATCH /api/feedback/:id/resolve
const toggleResolveFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolved } = req.body; // boolean
 
    if (typeof resolved !== "boolean") {
      return res.status(400).json({ message: "`resolved` must be boolean" });
    }
 
    const updated = await Feedback.findByIdAndUpdate(
      id,
      {
        resolved,
        resolvedAt: resolved ? new Date() : null,
      },
      { new: true }
    );
 
    if (!updated) return res.status(404).json({ message: "Feedback not found" });
 
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
// DELETE /api/feedback/:id
const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Feedback.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Feedback not found" });
    res.json({ message: "Deleted", id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
module.exports = {
  createFeedback,
  getFeedbackPaginated,
  toggleResolveFeedback,
  deleteFeedback,
};
 