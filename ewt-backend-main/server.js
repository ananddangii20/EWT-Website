require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const xss = require('xss'); // Ensure you ran: npm install xss

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const userRoutes = require('./routes/userRoutes'); 
const groupRoutes = require('./routes/groupRoutes');
const websiteEventRoutes = require('./routes/websiteEventRoutes');
const impactRoutes = require('./routes/impactRoutes'); // <--- Import the new route

const app = express();

// --- 1. AUTO-CREATE UPLOADS FOLDER ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
    console.log('📂 Created "uploads" folder successfully.');
}

// --- 2. SECURE HEADERS (Allow Video Playback) ---
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } 
}));

// --- 3. RATE LIMITING ---
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, 
    max: 100,
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
app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// --- 6. XSS SANITIZATION (Fixed) ---
app.use((req, res, next) => {
    if (req.body) {
        for (let key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = xss(req.body[key]); 
            }
        }
    }
    next();
});

// --- 7. PARAMETER POLLUTION ---
app.use(hpp());

// --- 8. SERVE UPLOADS PUBLICLY (Crucial for Video) ---
app.use('/uploads', express.static(uploadDir));

// --- 9. ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/groups', groupRoutes);
app.use('/api/website-events', websiteEventRoutes);
app.use('/api/impact', impactRoutes); // <--- Register the route

app.get('/health', (req, res) => res.json({ status: 'UP' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));