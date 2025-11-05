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

// @desc    Get a user's own skills
// @route   GET /api/users/profile/skills
// @access  Private
const getUserSkills = async (req, res) => {
  const student_id = req.user.student_id;
  try {
    const query = `
      SELECT s.skill_id, s.skill_name, ss.proficiency, ss.rating 
      FROM Student_Skills AS ss
      JOIN Skills AS s ON ss.skill_id = s.skill_id
      WHERE ss.student_id = ?;
    `;
    const [skills] = await pool.query(query, [student_id]);
    res.status(200).json(skills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching user skills' });
  }
};

// @desc    Add or update a skill on a user's profile
// @route   POST /api/users/profile/skills
// @access  Private
const addUserSkill = async (req, res) => {
  const student_id = req.user.student_id;
  const { skill_id, proficiency, rating } = req.body; // <-- Added rating

  if (!skill_id || !proficiency || rating === undefined) {
    return res.status(400).json({ message: 'Skill ID, proficiency, and rating are required' });
  }

  if (rating < 0 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 0 and 5' });
  }

  try {
    // This query will INSERT a new row, or UPDATE the existing row
    // if a duplicate key (student_id, skill_id) is found.
    const query = `
      INSERT INTO Student_Skills (student_id, skill_id, proficiency, rating) 
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        proficiency = VALUES(proficiency),
        rating = VALUES(rating);
    `;

    await pool.query(query, [student_id, skill_id, proficiency, rating]);
    res.status(201).json({ message: 'Skill added/updated successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error adding or updating skill' });
  }
};

// @desc    Remove a skill from a user's profile
// @route   DELETE /api/users/profile/skills/:skillId
// @access  Private
const removeUserSkill = async (req, res) => {
  const student_id = req.user.student_id;
  const { skillId } = req.params;

  try {
    await pool.query(
      'DELETE FROM Student_Skills WHERE student_id = ? AND skill_id = ?',
      [student_id, skillId]
    );
    res.status(200).json({ message: 'Skill removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error removing skill' });
  }
};


// @desc    Get all projects created by the logged-in user
// @route   GET /api/users/projects/created
// @access  Private
const getMyCreatedProjects = async (req, res) => {
  try {
    // This query is from your old AdminDashboard, but filtered for the current user
    const query = `
      SELECT p.project_id, p.title, p.description, ps.status_name, s.f_name AS creator_fname, s.l_name AS creator_lname
      FROM Project AS p
      JOIN Project_Status AS ps ON p.status_id = ps.status_id
      JOIN Student AS s ON p.created_student_id = s.student_id
      WHERE p.created_student_id = ?
      ORDER BY p.created_at DESC;
    `;
    const [projects] = await pool.query(query, [req.user.student_id]);
    res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching created projects' });
  }
};

// @desc    Get all projects the logged-in user is participating in
// @route   GET /api/users/projects/participating
// @access  Private
const getMyParticipatingProjects = async (req, res) => {
  try {
    const query = `
      SELECT p.project_id, p.title, p.description, ps.status_name, s.f_name AS creator_fname, s.l_name AS creator_lname
      FROM Project AS p
      JOIN Project_Status AS ps ON p.status_id = ps.status_id
      JOIN Student AS s ON p.created_student_id = s.student_id
      JOIN Project_Team AS pt ON p.project_id = pt.project_id
      WHERE pt.student_id = ? AND p.created_student_id != ?
      ORDER BY p.created_at DESC;
    `;
    const [projects] = await pool.query(query, [req.user.student_id, req.user.student_id]);
    res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching participating projects' });
  }
};

// @desc    Get a user's full profile details
// @route   GET /api/users/profile/details
// @access  Private
const getUserProfileDetails = async (req, res) => {
  const student_id = req.user.student_id;
  try {
    // Call the new SQL Function 'CountUserSkills'
    const query = "SELECT project_completed_count, CountUserSkills(?) AS total_skills FROM Student WHERE student_id = ?;";
    const [details] = await pool.query(query, [student_id, student_id]);

    res.status(200).json(details[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching profile details' });
  }
};


module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
  getUserSkills,
  addUserSkill,
  removeUserSkill,
  getMyCreatedProjects,
  getMyParticipatingProjects,
  getUserProfileDetails,
};