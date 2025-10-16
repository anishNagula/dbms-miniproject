import React from 'react';
import { Link } from 'react-router-dom';
import './ProjectCard.css'; // We'll create this file next

const ProjectCard = ({ project }) => {
  return (
    <div className="project-card">
      <h3>{project.title}</h3>
      <p className="project-creator">Created by: {project.creator_fname} {project.creator_lname}</p>
      <p className="project-status">Status: {project.status_name}</p>
      <p>{project.description.substring(0, 100)}...</p>
      <Link to={`/projects/${project.project_id}`} className="details-button">
        View Details
      </Link>
    </div>
  );
};

export default ProjectCard;