const express = require('express');
const router = express.Router();
const { createWebsiteEvent, getWebsiteEvents, deleteWebsiteEvent } = require('../controllers/websiteEventController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Public can view, only Admin can create/delete
router.get('/', getWebsiteEvents);
router.post('/', protect, isAdmin, createWebsiteEvent);
router.delete('/:id', protect, isAdmin, deleteWebsiteEvent);

module.exports = router;