// editprojectpage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const EditProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status_id: '1',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ... (useEffect logic remains the same)
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/${id}`);
        const { title, description, status_id } = response.data;
        setFormData({ title, description, status_id: status_id.toString() });
      } catch (err) {
        setError('Failed to load project data.');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ... (handleSubmit logic remains the same)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.put(`/projects/${id}`, formData);
      navigate(`/projects/${id}`); // Redirect back to the details page
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <h2>Edit Project</h2>
      
      {/* Use the .card and .form-container utility classes */}
      <form onSubmit={handleSubmit} className="card form-container">
        
        {/* Use .form-group for proper spacing and labels */}
        <div className="form-group">
          <label htmlFor="title">Project Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="input" // <-- USE CLASS
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Project Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            rows="6"
            onChange={handleChange}
            required
            className="input" // <-- USE CLASS
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="status_id">Project Status</label>
          {/* Use .input class on <select> */}
          <select
            id="status_id"
            name="status_id"
            value={formData.status_id}
            onChange={handleChange}
            className="input" // <-- USE CLASS
          >
            <option value="1">Open for Applications</option>
            <option value="2">In Progress</option>
            <option value="3">Completed</option>
            <option value="4">On Hold</option>
          </select>
        </div>

        {/* Use .btn utility classes */}
        <button type="submit" className="btn btn-primary">
          Update Project
        </button>
        
        {error && <p style={{ color: 'var(--destructive)' }}>{error}</p>}
      </form>
    </div>
  );
};

export default EditProjectPage;