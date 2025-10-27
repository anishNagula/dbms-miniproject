const express = require('express');
const router = express.Router();
const { 
  createProject, 
  getAllProjects, 
  getProjectById, 
  updateProject,
  deleteProject,
  applyToProject, 
  getProjectApplications, 
  acceptApplication,
  deleteProjectAsAdmin // <-- IMPORT
} = require('../controllers/projectController.js');

const { protect, identifyUser } = require('../middleware/authMiddleware.js');
const { admin } = require('../middleware/adminMiddleware.js'); // <-- IMPORT

// Public routes
router.get('/', identifyUser, getAllProjects);
router.get('/:id', getProjectById);

// Protected routes (require a valid token)
router.post('/', protect, createProject);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);

// Application management routes
router.post('/:id/apply', protect, applyToProject);
router.get('/:id/applications', protect, getProjectApplications);
router.post('/applications/accept', protect, acceptApplication);

// Admin-only routes
router.delete('/admin/:id', protect, admin, deleteProjectAsAdmin); // <-- THIS IS THE NEW ROUTE

module.exports = router;