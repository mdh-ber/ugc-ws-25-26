const express = require("express");
const router = express.Router();

const { getEvents, createEvent, deleteEvent, updateEvent } = require("../controllers/eventController.js");

const checkRole = require("../middleware/checkRole.js");

// Public Route (Everyone can see events)
router.get("/", getEvents);

// Protected Routes (Only Marketing Manager can Create, Update, Delete)
router.post("/", checkRole, createEvent);
router.delete("/:id", checkRole, deleteEvent);
router.put("/:id", checkRole, updateEvent);

module.exports = router;