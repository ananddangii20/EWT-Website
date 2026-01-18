const express = require('express');
const router = express.Router();
const { login, changePassword, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', login);
router.put('/changepassword', protect, changePassword);

// ✅ Add Logout Route (Protected so we know WHO is logging out)
router.post('/logout', protect, logout);

module.exports = router;