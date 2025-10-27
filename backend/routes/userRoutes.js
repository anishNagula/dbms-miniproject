const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    getAllUsers,
    getUserSkills,
    addUserSkill,
    removeUserSkill,
    getMyCreatedProjects,
    getMyParticipatingProjects
} = require('../controllers/userController.js');
const { protect } = require('../middleware/authMiddleware.js');
const { admin } = require('../middleware/adminMiddleware.js'); // <-- IMPORT ADMIN

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private Routes
router.get('/profile', protect, getUserProfile);

router.get('/profile/skills', protect, getUserSkills);
router.post('/profile/skills', protect, addUserSkill);
router.delete('/profile/skills/:skillId', protect, removeUserSkill);

// Dashboard Routes
router.get('/projects/created', protect, getMyCreatedProjects);
router.get('/projects/participating', protect, getMyParticipatingProjects);

// Admin Routes
router.get('/', protect, admin, getAllUsers);

module.exports = router;