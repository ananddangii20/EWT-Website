// routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const {
    markAttendance,
    getMyAttendance,
    getGroupAttendanceReport,
    getGroupAttendanceForEvent,
    getGroupReportById
} = require('../controllers/attendanceController');
// The line below is the corrected one
const { protect, isAdmin, isFaculty } = require('../middleware/authMiddleware');

router.route('/mark').post([protect, isAdmin], markAttendance);
router.route('/my-records').get(protect, getMyAttendance);
router.route('/group-report').get([protect, isAdmin], getGroupAttendanceReport);
router.route('/event/:eventId/group').get([protect, isAdmin], getGroupAttendanceForEvent);
router.route('/group-report/:groupId').get([protect, isFaculty], getGroupReportById);

module.exports = router;