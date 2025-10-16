const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, getAllUsers } = require('../controllers/userController.js');
const { protect } = require('../middleware/authMiddleware.js');
const { admin } = require('../middleware/adminMiddleware.js'); // <-- IMPORT ADMIN

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private Routes
router.get('/profile', protect, getUserProfile);

// Admin Routes
router.get('/', protect, admin, getAllUsers); // <-- ADD THIS ROUTE

module.exports = router;