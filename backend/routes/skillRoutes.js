const express = require('express');
const router = express.Router();
const { getAllSkills } = require('../controllers/skillController.js');

// This route is public, anyone can see the list of available skills
router.get('/', getAllSkills);

module.exports = router;