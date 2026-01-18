const express = require('express');
const router = express.Router();
const { addImpactStory, getImpactStories, deleteImpactStory } = require('../controllers/impactController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- MULTER CONFIG ---
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {
        // Simple safe filename
        const safeName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, safeName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } 
});

// --- DEBUG MIDDLEWARE ---
const logUpload = (req, res, next) => {
    console.log("📂 Multer finished. File:", req.file ? "YES" : "NO");
    console.log("📝 Body:", req.body);
    next();
};

// --- ROUTES ---
router.get('/', getImpactStories);

router.post('/', 
    protect, 
    isAdmin, 
    upload.single('video'), 
    logUpload, // <--- Added this to trace the request
    addImpactStory
); 

router.delete('/:id', protect, isAdmin, deleteImpactStory);

module.exports = router;