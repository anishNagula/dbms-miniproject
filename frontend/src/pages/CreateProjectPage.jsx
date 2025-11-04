// createprojectpage.jsx
// This page uses 100% utility classes from globals.css. No new CSS file needed.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// You might want a small CSS file just for the error, 
// but it can also be done inline or with a utility class.
// import './CreateProjectPage.css'; 

const CreateProjectPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const projectData = {
      ...formData,
      status_id: 1, 
      requiredSkills: [
        { skill_id: 1, required_proficiency: 'Intermediate' },
        { skill_id: 5, required_proficiency: 'Beginner' },
      ],
    };

    try {
      const response = await api.post('/projects', projectData);
      navigate(`/projects/${response.data.projectId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    }
  };

  return (
    <div className="page-container">
      <h1>Create a New Project</h1>

      {/* Use the .card and .form-container classes from globals.css */}
      <form onSubmit={handleSubmit} className="card form-container">
        
        {/* Use .form-group for proper spacing and labels */}
        <div className="form-group">
          <label htmlFor="title">Project Title</label>
          <input
            type="text"
            name="title"
            id="title"
            placeholder="e.g., Real-time Chat Application"
            onChange={handleChange}
            required
            className="input" // <-- USE CLASS
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Project Description</label>
          <textarea
            name="description"
            id="description"
            placeholder="Describe your project goals, features, and tech stack..."
            rows="6"
            onChange={handleChange}
            required
            className="input" // <-- USE CLASS
          ></textarea>
        </div>

        {/* Use the .btn and .btn-primary classes from globals.css */}
        <button type="submit" className="btn btn-primary">
          Create Project
        </button>
        
        {error && <p style={{ color: 'var(--destructive)', marginTop: '1rem' }}>{error}</p>}
      </form>
    </div>
  );
};

export default CreateProjectPage;