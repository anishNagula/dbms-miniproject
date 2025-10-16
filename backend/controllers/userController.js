// In /controllers/userController.js

const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new student
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  const { f_name, l_name, email, password } = req.body;

  if (!f_name || !l_name || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    // Check if user already exists
    const [existingUsers] = await pool.query('SELECT email FROM Student WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert new user into the database
    const [result] = await pool.query(
      'INSERT INTO Student (f_name, l_name, email, password_hash) VALUES (?, ?, ?, ?)',
      [f_name, l_name, email, password_hash]
    );
    const newUserId = result.insertId;

    // Generate JWT
    const token = jwt.sign({ id: newUserId, role: 'student' }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(201).json({
      student_id: newUserId,
      f_name,
      l_name,
      email,
      role: 'student', // <-- ADDED ROLE
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during user registration' });
  }
};

// @desc    Authenticate a student (login)
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Check for user by email
    const [users] = await pool.query('SELECT * FROM Student WHERE email = ?', [email]);
    const user = users[0];

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      // Passwords match, generate token
      const token = jwt.sign({ id: user.student_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

      res.status(200).json({
        student_id: user.student_id,
        f_name: user.f_name,
        l_name: user.l_name,
        email: user.email,
        role: user.role, // <-- ADDED ROLE
        token,
      });
    } else {
      // User not found or password does not match
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};


// @desc    Get logged-in user's profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  // The user object is attached to the request by the `protect` middleware
  // We can just send it back.
  res.status(200).json(req.user);
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT student_id, f_name, l_name, email, role FROM Student ORDER BY f_name');
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
};