<<<<<<< HEAD
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
=======
const express = require('express');
const router = express.Router();
const { getEvents, createEvent, deleteEvent, updateEvent } = require('../controllers/eventController');
const checkRole = require('../middleware/checkRole');

// Public Route (Everyone can see events)
router.get('/', getEvents);

// Protected Routes (Only Marketing Manager can Create, Update, Delete)
// We add 'checkRole' before the controller function
router.post('/', checkRole, createEvent);
router.delete('/:id', checkRole, deleteEvent);
router.put('/:id', checkRole, updateEvent); // New Update Route

module.exports = router;
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
