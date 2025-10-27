// In /controllers/projectController.js

const pool = require('../config/db');

// @desc    Fetch all projects
// @route   GET /api/projects
// @access  Public
const getAllProjects = async (req, res) => {
  try {
    let query;
    let queryParams = [];

    if (req.user) {
      // USER IS LOGGED IN
      // Fetch projects that the user has NOT applied to AND is NOT a team member of.
      query = `
        SELECT 
          p.project_id, p.title, p.description, p.created_at,
          ps.status_name,
          s.f_name AS creator_fname, s.l_name AS creator_lname
        FROM Project AS p
        JOIN Project_Status AS ps ON p.status_id = ps.status_id
        JOIN Student AS s ON p.created_student_id = s.student_id
        WHERE p.project_id NOT IN (
          SELECT project_id FROM Project_Application WHERE student_id = ?
        )
        AND p.project_id NOT IN (
          SELECT project_id FROM Project_Team WHERE student_id = ?
        )
        ORDER BY p.created_at DESC;
      `;
      queryParams = [req.user.student_id, req.user.student_id];
    } else {
      // USER IS A GUEST
      // Fetch all projects normally.
      query = `
        SELECT 
          p.project_id, p.title, p.description, p.created_at,
          ps.status_name,
          s.f_name AS creator_fname, s.l_name AS creator_lname
        FROM Project AS p
        JOIN Project_Status AS ps ON p.status_id = ps.status_id
        JOIN Student AS s ON p.created_student_id = s.student_id
        ORDER BY p.created_at DESC;
      `;
    }

    const [projects] = await pool.query(query, queryParams);
    res.status(200).json(projects);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching projects' });
  }
};

// @desc    Fetch a single project by ID with details
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = async (req, res) => {
  const { id } = req.params;
  try {
    // Query 1: Get main project details
    const projectQuery = `
      SELECT 
        p.*, ps.status_name, s.f_name AS creator_fname, s.l_name AS creator_lname
      FROM Project AS p
      JOIN Project_Status AS ps ON p.status_id = ps.status_id
      JOIN Student AS s ON p.created_student_id = s.student_id
      WHERE p.project_id = ?;
    `;
    const [projectResult] = await pool.query(projectQuery, [id]);

    if (projectResult.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    const project = projectResult[0];

    // Query 2: Get required skills
    const skillsQuery = `
      SELECT s.skill_name, prs.required_proficiency 
      FROM Project_Required_Skills AS prs
      JOIN Skills AS s ON prs.skill_id = s.skill_id
      WHERE prs.project_id = ?;
    `;
    const [requiredSkills] = await pool.query(skillsQuery, [id]);

    // Query 3: Get team members
    const teamQuery = `
      SELECT s.student_id, s.f_name, s.l_name, pt.role 
      FROM Project_Team AS pt
      JOIN Student AS s ON pt.student_id = s.student_id
      WHERE pt.project_id = ?;
    `;
    const [teamMembers] = await pool.query(teamQuery, [id]);

    // Combine results
    const responseData = {
      ...project,
      requiredSkills,
      teamMembers
    };

    res.status(200).json(responseData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching project details' });
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  const { title, description, status_id, requiredSkills } = req.body;
  const created_student_id = req.user.student_id; // from authMiddleware

  if (!title || !description || !status_id || !requiredSkills) {
    return res.status(400).json({ message: 'Please provide all project details' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Insert into Project table
    const [projectResult] = await connection.query(
      'INSERT INTO Project (title, description, created_student_id, status_id) VALUES (?, ?, ?, ?)',
      [title, description, created_student_id, status_id]
    );
    const newProjectId = projectResult.insertId;

    // 2. Insert required skills
    if (requiredSkills && requiredSkills.length > 0) {
      const skillValues = requiredSkills.map(skill => [newProjectId, skill.skill_id, skill.required_proficiency]);
      await connection.query(
        'INSERT INTO Project_Required_Skills (project_id, skill_id, required_proficiency) VALUES ?',
        [skillValues]
      );
    }
    
    await connection.commit();
    res.status(201).json({ message: 'Project created successfully', projectId: newProjectId });

  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Server error during project creation' });
  } finally {
    connection.release();
  }
};


// @desc    Apply to a project
// @route   POST /api/projects/:id/apply
// @access  Private
const applyToProject = async (req, res) => {
  const project_id = req.params.id;
  const student_id = req.user.student_id;

  try {
    // Check if user is the project creator
    const [projectRows] = await pool.query('SELECT created_student_id FROM Project WHERE project_id = ?', [project_id]);
    if (projectRows.length > 0 && projectRows[0].created_student_id === student_id) {
        return res.status(400).json({ message: "You cannot apply to your own project" });
    }

    // Attempt to insert application
    await pool.query(
      'INSERT INTO Project_Application (project_id, student_id) VALUES (?, ?)',
      [project_id, student_id]
    );
    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'You have already applied to this project' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error while applying' });
  }
};


// @desc    Get all applications for a specific project
// @route   GET /api/projects/:id/applications
// @access  Private (Owner only)
const getProjectApplications = async (req, res) => {
    const project_id = req.params.id;
    const user_id = req.user.student_id;

    try {
        // 1. Verify if the logged-in user is the owner of the project
        const [projectOwner] = await pool.query('SELECT created_student_id FROM Project WHERE project_id = ?', [project_id]);
        if (projectOwner.length === 0 || projectOwner[0].created_student_id !== user_id) {
            return res.status(403).json({ message: 'Forbidden: You are not the owner of this project.' });
        }

        // 2. Fetch all applications for this project
        const query = `
            SELECT pa.application_id, s.student_id, s.f_name, s.l_name, s.email, pa.application_date
            FROM Project_Application AS pa
            JOIN Student AS s ON pa.student_id = s.student_id
            WHERE pa.project_id = ?;
        `;
        const [applications] = await pool.query(query, [project_id]);
        res.status(200).json(applications);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching applications' });
    }
};


// @desc    Accept a project application
// @route   POST /api/projects/applications/accept
// @access  Private (Owner only)
const acceptApplication = async (req, res) => {
  const { application_id, role } = req.body;
  const user_id = req.user.student_id;

  if (!application_id || !role) {
    return res.status(400).json({ message: 'Application ID and role are required' });
  }
  
  try {
    // Security Check: Verify the current user owns the project this application belongs to
    const [ownerCheck] = await pool.query(`
      SELECT p.created_student_id 
      FROM Project_Application pa 
      JOIN Project p ON pa.project_id = p.project_id 
      WHERE pa.application_id = ?`, 
      [application_id]
    );

    if (ownerCheck.length === 0 || ownerCheck[0].created_student_id !== user_id) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to accept this application.' });
    }

    // Call the stored procedure
    await pool.query('CALL AcceptApplication(?, ?)', [application_id, role]);
    res.status(200).json({ message: 'Application accepted and student added to the team.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while accepting application' });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (Owner only)
const updateProject = async (req, res) => {
  const { title, description, status_id } = req.body;
  const project_id = req.params.id;
  const user_id = req.user.student_id;

  if (!title || !description || !status_id) {
      return res.status(400).json({ message: 'Title, description, and status are required.' });
  }

  try {
      // First, verify the user owns the project
      const [projectOwner] = await pool.query('SELECT created_student_id FROM Project WHERE project_id = ?', [project_id]);

      if (projectOwner.length === 0) {
          return res.status(404).json({ message: 'Project not found.' });
      }
      if (projectOwner[0].created_student_id !== user_id) {
          return res.status(403).json({ message: 'Forbidden: You are not the owner of this project.' });
      }

      // User is the owner, proceed with update
      await pool.query(
          'UPDATE Project SET title = ?, description = ?, status_id = ? WHERE project_id = ?',
          [title, description, status_id, project_id]
      );

      res.status(200).json({ message: 'Project updated successfully.' });

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error while updating project.' });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Owner only)
const deleteProject = async (req, res) => {
    const project_id = req.params.id;
    const user_id = req.user.student_id;

    try {
        // Verify the user owns the project before deleting
        const [projectOwner] = await pool.query('SELECT created_student_id FROM Project WHERE project_id = ?', [project_id]);

        if (projectOwner.length === 0) {
            return res.status(404).json({ message: 'Project not found.' });
        }
        if (projectOwner[0].created_student_id !== user_id) {
            return res.status(403).json({ message: 'Forbidden: You are not the owner of this project.' });
        }

        // Delete the project
        await pool.query('DELETE FROM Project WHERE project_id = ?', [project_id]);

        res.status(200).json({ message: 'Project deleted successfully.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while deleting project.' });
    }
};

const deleteProjectAsAdmin = async (req, res) => {
  const project_id = req.params.id;

  try {
      // Because this is an admin route, we don't need to check for ownership.
      // We just check if the project exists before deleting.
      const [project] = await pool.query('SELECT * FROM Project WHERE project_id = ?', [project_id]);

      if (project.length === 0) {
          return res.status(404).json({ message: 'Project not found.' });
      }

      // Delete the project
      await pool.query('DELETE FROM Project WHERE project_id = ?', [project_id]);

      res.status(200).json({ message: 'Project deleted successfully by admin.' });

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error while deleting project.' });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  applyToProject,
  getProjectApplications,
  acceptApplication,
  deleteProjectAsAdmin, // <-- ADD THIS LINE
};