// In /server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (e.g., "Bearer eyJhbGci...")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the DB using the ID in the token
      const [rows] = await pool.query(
        'SELECT student_id, email, f_name, l_name, role FROM Student WHERE student_id = ?',
         [decoded.id]
      );
      
      if (rows.length === 0) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Attach the user object to the request
      req.user = rows[0];
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const identifyUser = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to the request (excluding the password)
      const [rows] = await pool.query('SELECT student_id, email, f_name, l_name, role FROM Student WHERE student_id = ?', [decoded.id]);
      if (rows.length > 0) {
        req.user = rows[0];
      }
    } catch (error) {
      // Token is invalid or expired, but that's okay.
      // We'll just proceed without a req.user.
    }
  }
  next(); // Always proceed, whether user is logged in or a guest
};

module.exports = { protect,
  identifyUser
};