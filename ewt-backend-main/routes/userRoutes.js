const express = require('express');
const router = express.Router();
const { getMyGroupMembers } = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.route('/my-group').get([protect, isAdmin], getMyGroupMembers);

module.exports = router;