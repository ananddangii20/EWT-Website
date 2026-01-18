const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // ✅ DEBUG: Verify if 'log_id' exists in the token
            console.log("Decoded Token:", decoded); 

            // Fetch user details including group_id and role
            const sql = 'SELECT id, name, username, role, group_id FROM users WHERE id = ?';
            const [rows] = await db.query(sql, [decoded.sub]);
            
            if (rows.length === 0) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            
            req.user = rows[0];

            // ✅ NEW: Attach the session log ID from the token to the request object
            // This allows the logout controller to know specifically which session to close.
            req.sessionId = decoded.log_id; 

            next();
        } catch (error) {
            console.error("Token verification failed:", error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Requires admin role.' });
    }
};

exports.isFaculty = (req, res, next) => {
    if (req.user && req.user.role === 'faculty') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Requires faculty role.' });
    }
};