import React from 'react';

const DashboardPage = ({ navigateTo }) => {
  // Dummy data for projects
  const projects = [
    { id: 'p001', title: 'AI-Powered Chatbot' },
    { id: 'p002', title: 'E-commerce Website' },
    { id: 'p003', title: 'Mobile Fitness App' },
  ];

  return (
    <div>
      <h2>Your Dashboard</h2>
      <p>Here are the projects you are involved in or can apply to.</p>
      
      <div>
        <h3>All Projects</h3>
        <ul>
          {projects.map(project => (
            <li key={project.id} onClick={() => navigateTo('project', project.id)} style={{cursor: 'pointer', margin: '0.5rem 0', color: 'blue'}}>
              {project.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;
