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