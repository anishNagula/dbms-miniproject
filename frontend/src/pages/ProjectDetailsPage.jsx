// projectdetailspage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import TeamChat from '../components/TeamChat';
import { useAuth } from '../context/AuthContext';
import './ProjectDetailsPage.css'; // <-- IMPORT THE NEW CSS

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  
  // These booleans are now safe to calculate after project loads
  const isOwner = user && project && user.student_id === project.created_student_id;
  const isTeamMember = user && project && project.teamMembers.some(member => member.student_id === user.student_id);
  const canApply = user && !isOwner && !isTeamMember;

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/projects/${id}`);
        setProject(response.data);
      } catch (err) {
        setError('Failed to fetch project details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjectDetails();
  }, [id]);

  const handleApply = async () => {
    setMessage('');
    setError('');
    try {
      await api.post(`/projects/${id}/apply`);
      setMessage('Application submitted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply.');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="form-message form-message-error">{error}</p>;
  if (!project) return <p>Project not found.</p>;

  return (
    <div className="page-container">
      <div className="project-header">
        <h2>{project.title}</h2>
        
        <div className="project-header-actions">
          {canApply && (
            <button onClick={handleApply} className="btn btn-primary">
              Apply to this Project
            </button>
          )}

          {isOwner && (
            <Link to={`/projects/${id}/edit`} className="btn btn-warning">
              Edit Project
            </Link>
          )}
        </div>

        {message && <p className="form-message form-message-success">{message}</p>}
        {/* We reuse the error state for application errors */}
        {error && <p className="form-message form-message-error">{error}</p>}
        
        <div className="project-meta">
          <p><strong>Status:</strong> {project.status_name}</p>
          <p><strong>Created by:</strong> {project.creator_fname} {project.creator_lname}</p>
        </div>
      </div>

      <div className="project-section">
        <h3>Description</h3>
        <p>{project.description}</p>
      </div>

      <div className="project-section">
        <h3>Required Skills</h3>
        <ul className="detail-list">
          {project.requiredSkills.map((skill, index) => (
            <li key={index}>
              {skill.skill_name} ({skill.required_proficiency})
            </li>
          ))}
        </ul>
      </div>

      <div className="project-section">
        <h3>Team Members</h3>
        {project.teamMembers.length > 0 ? (
          <ul className="detail-list">
            {project.teamMembers.map((member) => (
              <li key={member.student_id}>
                {member.f_name} {member.l_name} - <strong>{member.role}</strong>
              </li>
            ))}
          </ul>
        ) : <p>No team members yet.</p>}
      </div>
      
      {/* <hr> is styled by globals.css */}
      <hr /> 
      
      {isTeamMember ? (
        <TeamChat projectId={id} />
      ) : (
        <div className="team-chat-gate">
          <p>You must be a member of the project team to view the chat.</p>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsPage;