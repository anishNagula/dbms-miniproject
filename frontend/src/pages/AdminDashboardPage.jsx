// admindashboardpage.jsx
// Make sure to import the new CSS file
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminDashboardPage.css'; // <-- IMPORT NEW CSS

const AdminDashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, projectsResponse] = await Promise.all([
          api.get('/users'),
          api.get('/projects'),
        ]);
        setUsers(usersResponse.data);
        setProjects(projectsResponse.data);
      } catch (err) {
        setError('Failed to fetch admin data. Ensure backend endpoints are running.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAdminDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This action is irreversible.')) {
      try {
        await api.delete(`/projects/admin/${projectId}`);
        setProjects(projects.filter(p => p.project_id !== projectId));
      } catch (err) {
        alert('Failed to delete project.');
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="page-container">
      <h1>Admin Dashboard</h1>
      
      {/* Use the new .admin-dashboard-section class */}
      <section className="admin-dashboard-section">
        <h3>All Users ({users.length})</h3>
        
        {/* Use the new .user-list class */}
        <ul className="user-list">
          {users.map(user => (
            // Use the new .user-list-item class
            <li key={user.student_id} className="user-list-item">
              <div className="user-list-item-info">
                {user.f_name} {user.l_name} <span>({user.email})</span>
              </div>
              <span className="user-list-item-role">
                {user.role}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="admin-dashboard-section">
        <h3>All Projects ({projects.length})</h3>

        {/* Use the new .admin-project-list grid */}
        <div className="admin-project-list">
          {projects.map(project => (
            // Use the existing .project-card class from globals.css
            <div key={project.project_id} className="card project-card">
              <h3>{project.title}</h3>
              <p className="project-creator">
                By: {project.creator_fname} {project.creator_lname}
              </p>
              
              {/* Use the .btn utility classes from globals.css */}
              <button 
                onClick={() => handleAdminDeleteProject(project.project_id)}
                className="btn btn-destructive" // <-- USE CLASSES
                style={{marginTop: '1rem'}} // Add spacing if needed
              >
                Delete Project (Admin)
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;