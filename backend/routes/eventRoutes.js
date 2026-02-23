const express = require("express");
const router = express.Router();
const multer = require("multer");

// ✅ Add Multer to parse the incoming form data and images
const upload = multer({ storage: multer.memoryStorage() });

const { getEvents, createEvent, deleteEvent, updateEvent } = require("../controllers/eventController.js");

// Public Route
router.get("/", getEvents);

// ✅ Add 'upload.any()' so the backend can read the React form data
router.post("/", upload.any(), createEvent);
router.delete("/:id", deleteEvent);
router.put("/:id", upload.any(), updateEvent);

module.exports = router;