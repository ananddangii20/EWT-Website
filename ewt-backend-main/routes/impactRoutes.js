const express = require('express');
const router = express.Router();
const { addImpactStory, getImpactStories, deleteImpactStory } = require('../controllers/impactController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// --- MULTER CONFIG ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure this folder exists in backend root
    },
    filename: (req, file, cb) => {
        // Unique filename: fieldname-timestamp.ext
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// --- ROUTES ---
router.get('/', getImpactStories);
router.post('/', protect, isAdmin, upload.single('video'), addImpactStory); // Handle 'video' file
router.delete('/:id', protect, isAdmin, deleteImpactStory);

module.exports = router;