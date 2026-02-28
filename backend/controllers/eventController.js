<<<<<<< HEAD
// backend/controllers/eventController.js
import Event from "../models/Event.js";

// GET /api/events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    return res.json(events);
  } catch (err) {
    console.error("getEvents error:", err);
    return res.status(500).json({ message: "Failed to fetch events" });
  }
};

// POST /api/events
export const createEvent = async (req, res) => {
  try {
    const created = await Event.create(req.body);
    return res.status(201).json(created);
  } catch (err) {
    console.error("createEvent error:", err);
    return res.status(500).json({ message: "Failed to create event" });
  }
};

// PUT /api/events/:id
export const updateEvent = async (req, res) => {
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
export const deleteEvent = async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Event not found" });
    return res.json({ message: "Event deleted" });
  } catch (err) {
    console.error("deleteEvent error:", err);
    return res.status(500).json({ message: "Failed to delete event" });
=======
const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 }); // Newest first
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new event
// @route   POST /api/events
exports.createEvent = async (req, res) => {
  const { title, image, date, time, place, type, description, speakers } = req.body;

  try {
    const newEvent = new Event({
      title,
      image,
      date,
      time,
      place,
      type,
      description,
      speakers
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    await event.deleteOne();
    res.json({ message: "Event removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add this to the existing file imports/exports

// ... existing getEvents, createEvent, deleteEvent ...

// @desc    Update an event
// @route   PUT /api/events/:id
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Update fields
    const { title, image, date, time, place, type, description, speakers } = req.body;
    
    event.title = title || event.title;
    event.image = image || event.image;
    event.date = date || event.date;
    event.time = time || event.time;
    event.place = place || event.place;
    event.type = type || event.type;
    event.description = description || event.description;
    event.speakers = speakers || event.speakers;

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
  }
};