const db = require('../config/db');

exports.addImpactStory = async (req, res) => {
    console.log("🚀 Controller Started");

    // 1. Validate File
    if (!req.file) {
        console.log("❌ No file uploaded");
        return res.status(400).json({ message: 'Please upload a video file' });
    }

    // 2. Validate Body
    const { title, description } = req.body;
    if (!title || !description) {
        console.log("❌ Missing fields. Title:", title, "Desc:", description);
        return res.status(400).json({ message: 'Title and Description are required' });
    }

    // 3. Prepare Data
    // Use forward slashes for URLs, even on Windows
    const video_url = 'uploads/' + req.file.filename;
    
    console.log("💾 Attempting DB Insert:", { title, video_url });

    try {
        const sql = 'INSERT INTO impact_stories (title, description, video_url) VALUES (?, ?, ?)';
        const [result] = await db.query(sql, [title, description, video_url]);
        
        console.log("✅ Success! Insert ID:", result.insertId);
        res.status(201).json({ message: 'Impact story added successfully' });

    } catch (error) {
        console.error("🔥 DATABASE ERROR:", error);
        res.status(500).json({ message: 'Database error: ' + error.message });
    }
};

// ... keep getImpactStories and deleteImpactStory same as before ...
exports.getImpactStories = async (req, res) => {
    try {
        const [stories] = await db.query('SELECT * FROM impact_stories ORDER BY created_at DESC');
        res.json(stories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Fetch error' });
    }
};

exports.deleteImpactStory = async (req, res) => {
    try {
        await db.query('DELETE FROM impact_stories WHERE id = ?', [req.params.id]);
        res.json({ message: 'Story deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Delete error' });
    }
};