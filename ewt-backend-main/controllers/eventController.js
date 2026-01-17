const db = require('../config/db');

exports.createEvent = async (req, res) => {
    const { name, event_date, hours } = req.body;
    const created_by = req.user.id; 

    if (!name || !event_date || !hours) {
        return res.status(400).json({ message: 'Please provide name, event_date, and hours' });
    }

    try {
        const sql = 'INSERT INTO `events` (name, event_date, hours, created_by) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(sql, [name, event_date, hours, created_by]);
        res.status(201).json({ message: 'Event created successfully', eventId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while creating event' });
    }
};

exports.getAllEvents = async (req, res) => {
    try {
        const sql = 'SELECT * FROM `events` ORDER BY event_date DESC';
        const [events] = await db.query(sql);
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching events' });
    }
};

exports.updateEvent = async (req, res) => {
    const { id } = req.params;
    const { name, event_date, hours } = req.body;

    try {
        const sql = 'UPDATE `events` SET name = ?, event_date = ?, hours = ? WHERE id = ?';
        const [result] = await db.query(sql, [name, event_date, hours, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json({ message: 'Event updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while updating event' });
    }
};

exports.deleteEvent = async (req, res) => {
    const { id } = req.params;
    try {
        const sql = 'DELETE FROM `events` WHERE id = ?';
        const [result] = await db.query(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while deleting event' });
    }
};