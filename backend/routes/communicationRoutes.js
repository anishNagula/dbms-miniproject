// In /server/routes/communicationRoutes.js
const express = require('express');
const router = express.Router();
const { getMessages, postMessage } = require('../controllers/communicationController.js');
const { protect } = require('../middleware/authMiddleware.js');

// All communication routes are protected and require team membership (checked in controller)
router.route('/:projectId/messages')
    .get(protect, getMessages)
    .post(protect, postMessage);

module.exports = router;