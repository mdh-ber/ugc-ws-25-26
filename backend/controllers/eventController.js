// backend/controllers/eventController.js
const Event = require("../models/Event.js");

// GET /api/events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    return res.json(events);
  } catch (err) {
    console.error("getEvents error:", err);
    return res.status(500).json({ message: "Failed to fetch events" });
  }
};

// POST /api/events
exports.createEvent = async (req, res) => {
  try {
    const created = await Event.create(req.body);
    return res.status(201).json(created);
  } catch (err) {
    console.error("createEvent error:", err);
    return res.status(500).json({ message: "Failed to create event" });
  }
};

// PUT /api/events/:id
exports.updateEvent = async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) return res.status(404).json({ message: "Event not found" });
    return res.json(updated);
  } catch (err) {
    console.error("updateEvent error:", err);
    return res.status(500).json({ message: "Failed to update event" });
  }
};

// DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Event not found" });
    return res.json({ message: "Event deleted" });
  } catch (err) {
    console.error("deleteEvent error:", err);
    return res.status(500).json({ message: "Failed to delete event" });
  }
};