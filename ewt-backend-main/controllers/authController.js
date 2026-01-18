const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide username and password' });
    }

    try {
        // 1. Check User
        const sql = 'SELECT * FROM users WHERE username = ?';
        const [rows] = await db.query(sql, [username]);
        const user = rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 2. ✅ CREATE SESSION LOG ENTRY
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        
        const [logResult] = await db.query(
            'INSERT INTO session_logs (user_id, ip_address, user_agent) VALUES (?, ?, ?)',
            [user.id, ip, userAgent]
        );
        
        const logId = logResult.insertId; // This is our Session ID

        // 3. ✅ GENERATE TOKEN WITH LOG_ID
        const payload = {
            sub: user.id,
            role: user.role,
            group_id: user.group_id,
            log_id: logId // <--- Embed the session ID in the token
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Login successful!',
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                role: user.role,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

exports.logout = async (req, res) => {
    // Debug Log: Check your terminal for this message when you click Logout
    console.log("🔴 Logout Request Received for Session ID:", req.sessionId); 

    try {
        const sessionId = req.sessionId; 

        if (sessionId) {
            await db.query(
                `UPDATE session_logs 
                 SET logout_time = NOW(), 
                     duration = TIMEDIFF(NOW(), login_time) 
                 WHERE id = ?`,
                [sessionId]
            );
            console.log("✅ Database Updated for Session:", sessionId);
        } else {
            console.log("⚠️ No Session ID found in request");
        }
        
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Server error during logout' });
    }
};

// ... keep changePassword and other exports same as before
exports.changePassword = async (req, res) => {
    // ... (Your existing changePassword code)
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; 

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Please provide both old and new passwords' });
    }
    if (newPassword.length < 8) {
        return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    try {
        const sqlSelect = 'SELECT password_hash FROM users WHERE id = ?';
        const [rows] = await db.query(sqlSelect, [userId]);
        const user = rows[0];

        const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect old password' });
        }

        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        const sqlUpdate = 'UPDATE users SET password_hash = ? WHERE id = ?';
        await db.query(sqlUpdate, [newPasswordHash, userId]);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};