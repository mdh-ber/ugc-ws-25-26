const express = require('express');
const router = express.Router();
const { getEvents, createEvent, deleteEvent } = require('../controllers/eventController');
// const { protect, marketingManager } = require('../middleware/auth'); // Uncomment if you have auth middleware

// Valid routes: GET to fetch, POST to create
router.route('/').get(getEvents).post(createEvent);

// Valid route: DELETE by ID
router.route('/:id').delete(deleteEvent);

module.exports = router;