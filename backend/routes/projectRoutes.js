// In /server/routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createProject, 
  getAllProjects, 
  getProjectById, 
  updateProject,      // <-- NEW
  deleteProject,      // <-- NEW
  applyToProject, 
  getProjectApplications, 
  acceptApplication 
} = require('../controllers/projectController.js');
const { protect } = require('../middleware/authMiddleware.js');

// Public routes
router.get('/', getAllProjects);
router.get('/:id', getProjectById);

// Protected routes (require a valid token)
router.post('/', protect, createProject);
router.put('/:id', protect, updateProject);      // <-- NEW
router.delete('/:id', protect, deleteProject);  // <-- NEW

// Application management routes
router.post('/:id/apply', protect, applyToProject);
router.get('/:id/applications', protect, getProjectApplications);
router.post('/applications/accept', protect, acceptApplication);

module.exports = router;