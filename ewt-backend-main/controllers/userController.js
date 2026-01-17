const db = require('../config/db');

exports.getMyGroupMembers = async (req, res) => {
    const adminGroupId = req.user.group_id;

    if (!adminGroupId) {
        return res.status(400).json({ message: 'Admin is not associated with a group.' });
    }

    try {
        const sql = 'SELECT id, name, username, role FROM `users` WHERE group_id = ? ORDER BY role DESC, name ASC';
        const [members] = await db.query(sql, [adminGroupId]);
        res.json(members);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching group members.' });
    }
};