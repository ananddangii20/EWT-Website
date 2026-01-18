const db = require('../config/db');

exports.addImpactStory = async (req, res) => {
    // Check if file was uploaded
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a video file' });
    }

    const { title, description } = req.body;
    // Store relative path (e.g., "uploads/video-123456.mp4")
    const video_url = 'uploads/' + req.file.filename;

    if (!title || !description) {
        return res.status(400).json({ message: 'Title and Description are required' });
    }

    try {
        const sql = 'INSERT INTO impact_stories (title, description, video_url) VALUES (?, ?, ?)';
        await db.query(sql, [title, description, video_url]);
        res.status(201).json({ message: 'Impact story added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding story' });
    }
};

exports.getImpactStories = async (req, res) => {
    try {
        const [stories] = await db.query('SELECT * FROM impact_stories ORDER BY created_at DESC');
        res.json(stories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching stories' });
    }
};

exports.deleteImpactStory = async (req, res) => {
    try {
        await db.query('DELETE FROM impact_stories WHERE id = ?', [req.params.id]);
        res.json({ message: 'Story deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting story' });
    }
};