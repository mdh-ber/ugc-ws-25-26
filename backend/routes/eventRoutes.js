import express from "express";
const router = express.Router();

import { getEvents, createEvent, deleteEvent, updateEvent } 
  from "../controllers/eventController.js";

import checkRole from "../middleware/checkRole.js";

// Public Route (Everyone can see events)
router.get("/", getEvents);

// Protected Routes (Only Marketing Manager can Create, Update, Delete)
router.post("/", checkRole, createEvent);
router.delete("/:id", checkRole, deleteEvent);
router.put("/:id", checkRole, updateEvent);

export default router;