// dashboardpage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './DashboardPage.css'; // <-- IMPORT THE NEW CSS

const DashboardPage = () => {
  const [participatingProjects, setParticipatingProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [applications, setApplications] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ... (fetch logic remains the same)
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
    // ... (handler logic remains the same)
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
      <h1>My Dashboard</h1>

      {/* SECTION 1: PARTICIPATING PROJECTS */}
      <section className="dashboard-section">
        <h3>Projects I'm Participating In</h3>
        {participatingProjects.length === 0 ? <p>You are not a member of any projects yet.</p> : (
          participatingProjects.map(project => (
            <Link to={`/projects/${project.project_id}`} key={project.project_id} className="project-card-link">
              {/* .dashboard-card is from globals.css */}
              <div className="card dashboard-card">
                <h3>{project.title}</h3>
                <p className="project-creator">
                  Creator: {project.creator_fname} {project.creator_lname}
                </p>
                <p className="project-status">Status: {project.status_name}</p>
              </div>
            </Link>
          ))
        )}
      </section>

      {/* SEPARATOR (styled by globals.css) */}
      <hr />

      {/* SECTION 2: CREATED PROJECTS */}
      <section className="dashboard-section">
        <h3>Projects I've Created</h3>
        {myProjects.length === 0 ? <p>You have not created any projects yet.</p> : (
          myProjects.map(project => (
            // Use .card and .dashboard-card from globals.css
            <div key={project.project_id} className="card dashboard-card">
              <h3>{project.title}</h3>
              <p className="project-status">Status: {project.status_name}</p>
              
              {/* h5 is styled by DashboardPage.css */}
              <h5>Pending Applications</h5>
              
              {/* .application-list is from globals.css */}
              {applications[project.project_id] && applications[project.project_id].length > 0 ? (
                <ul className="application-list">
                  {applications[project.project_id].map(app => (
                    // .application-item is from globals.css
                    <li key={app.application_id} className="application-item">
                      <span>{app.f_name} {app.l_name} ({app.email})</span>
                      {/* Use the new .btn-sm class from globals.css */}
                      <button 
                        onClick={() => handleAccept(app.application_id, project.project_id)}
                        className="btn btn-primary btn-sm"
                      >
                        Accept
                      </button>
                    </li>
                  ))}
                </ul>
              ) : <p>No pending applications.</p>}

              {/* .details-button is from ProjectCard.css (which is fine) */}
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