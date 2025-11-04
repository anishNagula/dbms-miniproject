import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import TeamChat from '../components/TeamChat';

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { user } = useAuth(); // Get the current logged-in user

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true); // Ensure loading is true at the start of fetch
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
    try {
      await api.post(`/projects/${id}/apply`);
      setMessage('Application submitted successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to apply.');
    }
  };

  // --- START OF FIX ---
  // 1. All loading and error checks must happen FIRST.
  if (loading) return <LoadingSpinner />;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!project) return <p>Project not found.</p>; // This prevents any null access

  // 2. All this logic is now MOVED to AFTER the guards above.
  // We can be 100% sure that 'project' is not null here.
  const isOwner = user && user.student_id === project.created_student_id;
  const isInTeam = user && project.teamMembers.some(member => member.student_id === user.student_id);
  const isTeamMember = isOwner || isInTeam;
  const canApply = user && !isOwner && !isInTeam;
  // --- END OF FIX ---

  return (
    <div className="page-container">
      <h2>{project.title}</h2>
      
      {canApply && (
        <button onClick={handleApply} style={{ marginBottom: '1rem' }}>
          Apply to this Project
        </button>
      )}

      {isOwner && (
        <Link to={`/projects/${id}/edit`}>
          <button style={{ marginBottom: '1rem', backgroundColor: '#ffc107' }}>
            Edit Project
          </button>
        </Link>
      )}
      
      {message && <p style={{ color: message.includes('successfully') ? 'green' : 'red' }}>{message}</p>}
      
      <p><strong>Status:</strong> {project.status_name}</p>
      <p><strong>Created by:</strong> {project.creator_fname} {project.creator_lname}</p>
      
      <h3>Description</h3>
      <p>{project.description}</p>

      <h3>Required Skills</h3>
      <ul>
        {project.requiredSkills.map((skill, index) => (
          <li key={index}>
            {skill.skill_name} ({skill.required_proficiency})
          </li>
        ))}
      </ul>

      <h3>Team Members</h3>
       {project.teamMembers.length > 0 ? (
        <ul>
          {project.teamMembers.map((member) => (
            <li key={member.student_id}>
              {member.f_name} {member.l_name} - {member.role}
            </li>
          ))}
        </ul>
      ) : <p>No team members yet.</p>}

      <hr style={{ margin: '2rem 0' }} />
      {isTeamMember ? (
        <TeamChat projectId={id} />
      ) : (
        <p>You must be a member of the project team to view the chat.</p>
      )}
    </div>
  );
};

export default ProjectDetailsPage;