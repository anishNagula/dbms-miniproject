import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data in parallel for efficiency
        const [usersResponse, projectsResponse] = await Promise.all([
          api.get('/users'), // We'll need to create this new backend route
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
        // Remove the project from the local state to update the UI instantly
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
      <h2>Admin Dashboard</h2>
      
      <section>
        <h3>All Users ({users.length})</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {users.map(user => (
            <li key={user.student_id} style={{ background: '#fff', padding: '0.5rem', border: '1px solid #eee', marginBottom: '0.5rem' }}>
              {user.f_name} {user.l_name} ({user.email}) - Role: <strong>{user.role}</strong>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>All Projects ({projects.length})</h3>
        {projects.map(project => (
          <div key={project.project_id} className="project-card">
            <h4>{project.title}</h4>
            <p>Created by: {project.creator_fname} {project.creator_lname}</p>
            <button 
              onClick={() => handleAdminDeleteProject(project.project_id)}
              style={{ backgroundColor: '#dc3545' }}>
              Delete Project (Admin)
            </button>
          </div>
        ))}
      </section>
    </div>
  );
};

export default AdminDashboardPage;