import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage = () => {
  const [myProjects, setMyProjects] = useState([]);
  const [applications, setApplications] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch all projects
        const projectsResponse = await api.get('/projects');
        // 2. Filter to find projects created by the current user
        const userProjects = projectsResponse.data.filter(p => p.creator_fname === user.f_name && p.creator_lname === user.l_name);
        setMyProjects(userProjects);

        // 3. For each of my projects, fetch its applications
        const appPromises = userProjects.map(p => api.get(`/projects/${p.project_id}/applications`));
        const appResults = await Promise.all(appPromises);
        
        const appsByProject = {};
        appResults.forEach((result, index) => {
          const projectId = userProjects[index].project_id;
          appsByProject[projectId] = result.data;
        });
        setApplications(appsByProject);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleAccept = async (appId, projectId) => {
    try {
      await api.post('/projects/applications/accept', {
        application_id: appId,
        role: 'Member'
      });
      // Refresh applications for that project
      const updatedApps = applications[projectId].filter(app => app.application_id !== appId);
      setApplications({ ...applications, [projectId]: updatedApps });
    } catch (error) {
      alert('Failed to accept application.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <h2>My Dashboard</h2>
      <h3>Projects I've Created</h3>
      {myProjects.length === 0 ? <p>You have not created any projects yet.</p> : (
        myProjects.map(project => (
          <div key={project.project_id} className="project-card">
            <h4>{project.title}</h4>
            <h5>Pending Applications</h5>
            {applications[project.project_id] && applications[project.project_id].length > 0 ? (
              <ul>
                {applications[project.project_id].map(app => (
                  <li key={app.application_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{app.f_name} {app.l_name} ({app.email})</span>
                    <button onClick={() => handleAccept(app.application_id, project.project_id)}>Accept</button>
                  </li>
                ))}
              </ul>
            ) : <p>No pending applications.</p>}
          </div>
        ))
      )}
    </div>
  );
};

export default DashboardPage;