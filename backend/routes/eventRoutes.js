const express = require('express');
const router = express.Router();
const { getEvents, createEvent, deleteEvent, updateEvent } = require('../controllers/eventController');
const checkRole = require('../middleware/checkRole');
const upload = require('../middleware/upload'); // Import the multer config

// Public Route (Everyone can see events)
router.get('/', getEvents);

// Protected Routes (Only Marketing Manager can Create, Update, Delete)
// Added 'upload.single('image')' middleware to handle the file upload
// This must come BEFORE the controller so the file is processed first
router.post('/', checkRole, upload.single('image'), createEvent);

router.delete('/:id', checkRole, deleteEvent);

// Also added to PUT in case you want to update the image later
router.put('/:id', checkRole, upload.single('image'), updateEvent); 

module.exports = router;