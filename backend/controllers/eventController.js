const Event = require("../models/Event.js");
const fs = require("fs");
const path = require("path");

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
    const eventData = { ...req.body };

    // Check if Multer caught an uploaded image from React
    if (req.files && req.files.length > 0) {
      const file = req.files[0];
      
      // Create a unique, web-safe filename
      const filename = Date.now() + "-" + file.originalname.replace(/\s+/g, '-');
      const uploadDir = path.join(__dirname, "../uploads");
      
      // Safety Check: Auto-create the 'uploads' folder if it is missing
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }

      // Save the actual image file to the disk
      fs.writeFileSync(path.join(uploadDir, filename), file.buffer);

      // Tell MongoDB where to find the image!
      eventData.image = `/uploads/${filename}`;
    }

    const created = await Event.create(eventData);
    return res.status(201).json(created);
  } catch (err) {
    console.error("createEvent error:", err);
    return res.status(500).json({ message: "Failed to create event" });
  }
};

// PUT /api/events/:id
exports.updateEvent = async (req, res) => {
  try {
    const eventData = { ...req.body };

    // We do the exact same logic here so you can update an event's image later!
    if (req.files && req.files.length > 0) {
      const file = req.files[0];
      const filename = Date.now() + "-" + file.originalname.replace(/\s+/g, '-');
      const uploadDir = path.join(__dirname, "../uploads");
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }

      fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
      eventData.image = `/uploads/${filename}`;
    }

    const updated = await Event.findByIdAndUpdate(req.params.id, eventData, {
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