const db = require('../config/db');
exports.markAttendance = async (req, res) => {
    const { eventId, attendees } = req.body; 
    const adminId = req.user.id;
    const adminGroupId = req.user.group_id;

    if (!eventId || !attendees || !Array.isArray(attendees)) {
        return res.status(400).json({ message: 'Please provide eventId and an array of attendees.' });
    }

    try {
        const [groupMembers] = await db.query('SELECT id FROM `users` WHERE group_id = ?', [adminGroupId]);
        const memberIdsInGroup = groupMembers.map(member => member.id);

        for (const attendee of attendees) {
            if (!memberIdsInGroup.includes(attendee.userId)) {
                return res.status(403).json({ message: `Access denied. You cannot mark attendance for user ID ${attendee.userId}.` });
            }
        }

        const attendanceData = attendees.map(att => [att.userId, eventId, att.status, adminId]);

        const sql = 'INSERT INTO `attendance` (user_id, event_id, status, marked_by) VALUES ? ON DUPLICATE KEY UPDATE status = VALUES(status)';

        await db.query(sql, [attendanceData]);

        res.status(200).json({ message: 'Attendance marked successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while marking attendance.' });
    }
};

exports.getMyAttendance = async (req, res) => {
    const userId = req.user.id;

    try {
        const sql = `
            SELECT 
                e.name, 
                e.event_date, 
                e.hours, 
                a.status 
            FROM \`attendance\` a
            JOIN \`events\` e ON a.event_id = e.id
            WHERE a.user_id = ?
            ORDER BY e.event_date DESC
        `;
        const [records] = await db.query(sql, [userId]);

        let totalHoursAttended = 0;
        let totalEventHours = 0;

        records.forEach(record => {
            totalEventHours += record.hours;
            if (record.status === 'present') {
                totalHoursAttended += record.hours;
            }
        });
        
        const attendancePercentage = totalEventHours > 0 ? (totalHoursAttended / totalEventHours) * 100 : 0;

        res.json({
            records,
            totalHoursAttended,
            attendancePercentage: parseFloat(attendancePercentage.toFixed(2))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching attendance records.' });
    }
};

exports.getGroupAttendanceReport = async (req, res) => {
    const adminGroupId = req.user.group_id;

    try {
        const summarySql = `
            SELECT
                u.id,
                u.username,
                u.name,
                COALESCE(SUM(IF(a.status = 'present', e.hours, 0)), 0) AS totalHoursAttended,
                COALESCE(ROUND((SUM(IF(a.status = 'present', e.hours, 0)) / NULLIF(SUM(e.hours), 0)) * 100, 2), 0) AS attendancePercentage
            FROM \`users\` u
            LEFT JOIN \`attendance\` a ON u.id = a.user_id
            LEFT JOIN \`events\` e ON a.event_id = e.id
            WHERE u.group_id = ?
            GROUP BY u.id
            ORDER BY u.role DESC, u.name ASC;
        `;
        const [summary] = await db.query(summarySql, [adminGroupId]);

        const detailsSql = `
            SELECT 
                u.id AS userId,
                u.name AS userName,
                e.id AS eventId,
                e.name AS eventName,
                e.event_date AS eventDate,
                a.status
            FROM \`attendance\` a
            JOIN \`users\` u ON a.user_id = u.id
            JOIN \`events\` e ON a.event_id = e.id
            WHERE u.group_id = ?
            ORDER BY e.event_date DESC;
        `;
        const [details] = await db.query(detailsSql, [adminGroupId]);

        res.json({ summary, details });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while generating report.' });
    }
};

exports.getGroupAttendanceForEvent = async (req, res) => {
    const { eventId } = req.params;
    const adminGroupId = req.user.group_id;

    try {
        const sql = `
            SELECT a.user_id, a.status
            FROM \`attendance\` a
            JOIN \`users\` u ON a.user_id = u.id
            WHERE a.event_id = ? AND u.group_id = ?
        `;
        const [records] = await db.query(sql, [eventId, adminGroupId]);
        res.json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching attendance records for event.' });
    }
};

// ADD THIS NEW FUNCTION
// @desc    Get attendance report for a specific group by ID
// @route   GET /api/attendance/group-report/:groupId
// @access  Private/Faculty
exports.getGroupReportById = async (req, res) => {
    const { groupId } = req.params;

    try {
        const summarySql = `
            SELECT
                u.id, u.username, u.name,
                COALESCE(SUM(IF(a.status = 'present', e.hours, 0)), 0) AS totalHoursAttended,
                COALESCE(ROUND((SUM(IF(a.status = 'present', e.hours, 0)) / NULLIF(SUM(e.hours), 0)) * 100, 2), 0) AS attendancePercentage
            FROM \`users\` u
            LEFT JOIN \`attendance\` a ON u.id = a.user_id
            LEFT JOIN \`events\` e ON a.event_id = e.id
            WHERE u.group_id = ?
            GROUP BY u.id ORDER BY u.role DESC, u.name ASC;
        `;
        const [summary] = await db.query(summarySql, [groupId]);

        const detailsSql = `
            SELECT u.id AS userId, u.name AS userName, e.id AS eventId, e.name AS eventName, e.event_date AS eventDate, a.status
            FROM \`attendance\` a
            JOIN \`users\` u ON a.user_id = u.id
            JOIN \`events\` e ON a.event_id = e.id
            WHERE u.group_id = ? ORDER BY e.event_date DESC;
        `;
        const [details] = await db.query(detailsSql, [groupId]);

        res.json({ summary, details });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while generating report.' });
    }
};

