// routes/groupRoutes.js
const express = require('express');
const router = express.Router();
const { getAllGroups } = require('../controllers/groupController');
const { protect, isFaculty } = require('../middleware/authMiddleware');

router.route('/').get([protect, isFaculty], getAllGroups);

module.exports = router;