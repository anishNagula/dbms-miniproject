import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage = () => {
  const [participatingProjects, setParticipatingProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [applications, setApplications] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch created and participating projects in parallel
        const [createdRes, participatingRes] = await Promise.all([
          api.get('/users/projects/created'),
          api.get('/users/projects/participating')
        ]);
        
        setMyProjects(createdRes.data);
        setParticipatingProjects(participatingRes.data);

        // 2. For each created project, fetch its applications
        const appPromises = createdRes.data.map(p => api.get(`/projects/${p.project_id}/applications`));
        const appResults = await Promise.all(appPromises);
        
        const appsByProject = {};
        appResults.forEach((result, index) => {
          const projectId = createdRes.data[index].project_id;
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
  }, []);

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

      {/* SECTION 1: PARTICIPATING PROJECTS */}
      <section className="dashboard-section">
        <h3>Projects I'm Participating In</h3>
        {participatingProjects.length === 0 ? <p>You are not a member of any projects yet.</p> : (
          participatingProjects.map(project => (
            <Link to={`/projects/${project.project_id}`} key={project.project_id} className="project-card-link">
              <div className="project-card dashboard-card">
                <h4>{project.title}</h4>
                <p><strong>Creator:</strong> {project.creator_fname} {project.creator_lname}</p>
                <p><strong>Status:</strong> {project.status_name}</p>
              </div>
            </Link>
          ))
        )}
      </section>

      {/* SEPARATOR */}
      <hr style={{ margin: '3rem 0' }} />

      {/* SECTION 2: CREATED PROJECTS */}
      <section className="dashboard-section">
        <h3>Projects I've Created</h3>
        {myProjects.length === 0 ? <p>You have not created any projects yet.</p> : (
          myProjects.map(project => (
            <div key={project.project_id} className="project-card dashboard-card">
              <h4>{project.title}</h4>
              <p><strong>Status:</strong> {project.status_name}</p>
              
              <h5 style={{ marginTop: '1.5rem' }}>Pending Applications</h5>
              {applications[project.project_id] && applications[project.project_id].length > 0 ? (
                <ul className="application-list">
                  {applications[project.project_id].map(app => (
                    <li key={app.application_id} className="application-item">
                      <span>{app.f_name} {app.l_name} ({app.email})</span>
                      <button onClick={() => handleAccept(app.application_id, project.project_id)}>Accept</button>
                    </li>
                  ))}
                </ul>
              ) : <p>No pending applications.</p>}

              {/* Link to view the project */}
              <Link to={`/projects/${project.project_id}`} className="details-button" style={{ marginTop: '1rem' }}>
                View Project
              </Link>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default DashboardPage;