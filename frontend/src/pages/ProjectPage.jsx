import React from 'react';

const ProjectPage = ({ projectId, navigateTo }) => {
  return (
    <div>
      <h2>Project Details</h2>
      <p>Displaying details for Project ID: <strong>{projectId}</strong></p>
      <p>Here you would fetch and display the full project description, team members, required skills, etc.</p>
      <button onClick={() => navigateTo('dashboard')} className="btn" style={{width: 'auto', marginTop: '1rem'}}>Back to Dashboard</button>
    </div>
  );
};

export default ProjectPage;
