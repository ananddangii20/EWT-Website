const express = require('express');
const router = express.Router();
const {
    createEvent,
    getAllEvents,
    updateEvent,
    deleteEvent
} = require('../controllers/eventController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getAllEvents)
    .post([protect, isAdmin], createEvent);


router.route('/:id')
    .put([protect, isAdmin], updateEvent)
    .delete([protect, isAdmin], deleteEvent);

module.exports = router;