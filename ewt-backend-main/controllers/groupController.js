// controllers/groupController.js
const db = require('../config/db');

exports.getAllGroups = async (req, res) => {
    try {
        const [groups] = await db.query('SELECT id, name FROM `groups` ORDER BY name ASC');
        res.json(groups);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching groups.' });
    }
};