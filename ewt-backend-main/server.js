require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const xss = require('xss'); // Use the modern 'xss' library

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const userRoutes = require('./routes/userRoutes'); 
const groupRoutes = require('./routes/groupRoutes');
const websiteEventRoutes = require('./routes/websiteEventRoutes');
const impactRoutes = require('./routes/impactRoutes');

const app = express();

// --- 1. AUTO-CREATE UPLOADS FOLDER ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
    console.log('📂 Created "uploads" folder successfully.');
}

// --- 2. SECURE HEADERS ---
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } // Allows video playback
}));

// --- 3. RATE LIMITING ---
// Increased limit to prevent blocking yourself during testing
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 500, // 500 requests per 15 min
    message: { message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// --- 4. CORS ---
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// --- 5. BODY PARSERS ---
// Increase limit for text fields
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- 6. ROUTES (Register BEFORE custom XSS to let Multer handle files) ---
// We move XSS sanitization inside controllers or use it specifically for text routes
// Global XSS middleware often breaks Multipart/Form-Data (File Uploads)
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/groups', groupRoutes);
app.use('/api/website-events', websiteEventRoutes);
app.use('/api/impact', impactRoutes); 

// --- 7. PARAMETER POLLUTION ---
app.use(hpp());

// --- 8. SERVE UPLOADS PUBLICLY ---
app.use('/uploads', express.static(uploadDir));

app.get('/health', (req, res) => res.json({ status: 'UP' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));