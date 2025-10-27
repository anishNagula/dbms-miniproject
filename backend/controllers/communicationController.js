// In /server/controllers/communicationController.js
const pool = require('../config/db');

// @desc    Get all messages for a project
// @route   GET /api/communication/:projectId/messages
// @access  Private (Team members or Creator)
const getMessages = async (req, res) => {
    const { projectId } = req.params;
    const student_id = req.user.student_id;

    try {
        // --- START OF FIX ---
        // Security: Check if user is on the project team OR is the project creator
        const [teamMember] = await pool.query(
            'SELECT * FROM Project_Team WHERE project_id = ? AND student_id = ?',
            [projectId, student_id]
        );
        
        const [projectCreator] = await pool.query(
            'SELECT * FROM Project WHERE project_id = ? AND created_student_id = ?',
            [projectId, student_id]
        );

        if (teamMember.length === 0 && projectCreator.length === 0) {
            return res.status(403).json({ message: 'Forbidden: You are not a member or creator of this project team.' });
        }
        // --- END OF FIX ---

        // Fetch messages
        const query = `
            SELECT tc.message_id, tc.message_text, tc.timestamp, s.student_id, s.f_name, s.l_name
            FROM Team_Communication AS tc
            JOIN Student AS s ON tc.sender_id = s.student_id
            WHERE tc.project_id = ?
            ORDER BY tc.timestamp ASC;
        `;
        const [messages] = await pool.query(query, [projectId]);

        res.status(200).json(messages);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching messages' });
    }
};

// @desc    Post a new message to a project chat
// @route   POST /api/communication/:projectId/messages
// @access  Private (Team members or Creator)
const postMessage = async (req, res) => {
    const { projectId } = req.params;
    const { message_text } = req.body;
    const sender_id = req.user.student_id;

    if (!message_text) {
        return res.status(400).json({ message: 'Message text cannot be empty.' });
    }

    try {
        // --- START OF FIX ---
        // Security: Check if user is on the project team OR is the project creator
        const [teamMember] = await pool.query(
            'SELECT * FROM Project_Team WHERE project_id = ? AND student_id = ?',
            [projectId, sender_id]
        );
        
        const [projectCreator] = await pool.query(
            'SELECT * FROM Project WHERE project_id = ? AND created_student_id = ?',
            [projectId, sender_id]
        );

        if (teamMember.length === 0 && projectCreator.length === 0) {
            return res.status(403).json({ message: 'Forbidden: You are not a member or creator of this project team.' });
        }
        // --- END OF FIX ---
        
        // Insert new message
        const [result] = await pool.query(
            'INSERT INTO Team_Communication (project_id, sender_id, message_text) VALUES (?, ?, ?)',
            [projectId, sender_id, message_text]
        );

        res.status(201).json({ message: 'Message sent successfully', messageId: result.insertId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error sending message' });
    }
};

module.exports = {
    getMessages,
    postMessage,
};