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

  // 1. Fetch the project's current data to fill the form
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

  // 2. Handle the update submission
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
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Project Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        
        <label htmlFor="description">Project Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          rows="6"
          onChange={handleChange}
          required
          style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'inherit' }}
        ></textarea>

        <label htmlFor="status_id">Project Status</label>
        <select
          id="status_id"
          name="status_id"
          value={formData.status_id}
          onChange={handleChange}
          style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          {/* In a real app, you might fetch these from the DB */}
          <option value="1">Open for Applications</option>
          <option value="2">In Progress</option>
          <option value="3">Completed</option>
          <option value="4">On Hold</option>
        </select>

        <button type="submit">Update Project</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default EditProjectPage;