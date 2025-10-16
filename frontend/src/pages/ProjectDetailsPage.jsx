import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const ProjectDetailsPage = () => {
  const { id } = useParams(); // Gets the project ID from the URL
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
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

  if (loading) return <LoadingSpinner />;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!project) return <p>Project not found.</p>;

  return (
    <div className="page-container">
      <h2>{project.title}</h2>
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

      {/* We will add an "Apply" button and team chat here in the next phase */}
    </div>
  );
};

export default ProjectDetailsPage;