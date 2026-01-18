const db = require('../config/db');

// Create a new public event
exports.createWebsiteEvent = async (req, res) => {
    const { title, event_date, time, location, description, faculty } = req.body;

    if (!title || !event_date) {
        return res.status(400).json({ message: 'Title and Date are required' });
    }

    try {
        const sql = 'INSERT INTO website_events (title, event_date, time, location, description, faculty) VALUES (?, ?, ?, ?, ?, ?)';
        await db.query(sql, [title, event_date, time, location, description, faculty]);
        res.status(201).json({ message: 'Website Event published successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error publishing event' });
    }
};

// Get all public events (for the website)
exports.getWebsiteEvents = async (req, res) => {
    try {
        // Order by newest date first
        const [events] = await db.query('SELECT * FROM website_events ORDER BY event_date DESC');
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching events' });
    }
};

// Delete a public event
exports.deleteWebsiteEvent = async (req, res) => {
    try {
        await db.query('DELETE FROM website_events WHERE id = ?', [req.params.id]);
        res.json({ message: 'Event deleted from website' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting event' });
    }
};