import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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
    
    // In a real app, you'd have a more complex form for requiredSkills.
    // For this project, we'll hardcode some skills for simplicity.
    const projectData = {
      ...formData,
      status_id: 1, // 'Open for Applications'
      requiredSkills: [
        { skill_id: 1, required_proficiency: 'Intermediate' }, // Python
        { skill_id: 5, required_proficiency: 'Beginner' },     // MySQL
      ],
    };

    try {
      const response = await api.post('/projects', projectData);
      navigate(`/projects/${response.data.projectId}`); // Redirect to the new project's page
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    }
  };

  return (
    <div className="page-container">
      <h2>Create a New Project</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Project Title"
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Project Description"
          rows="6"
          onChange={handleChange}
          required
          style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
        ></textarea>
        <button type="submit">Create Project</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default CreateProjectPage;