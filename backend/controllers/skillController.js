const pool = require('../config/db');

// @desc    Get all skills from the master list
// @route   GET /api/skills
// @access  Public
const getAllSkills = async (req, res) => {
  try {
    const [skills] = await pool.query('SELECT * FROM Skills ORDER BY skill_name');
    res.status(200).json(skills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching skills' });
  }
};

module.exports = {
  getAllSkills,
};