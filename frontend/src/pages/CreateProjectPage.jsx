import React, { useState } from 'react';

const CreateProjectPage = ({ navigateTo, token }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    reference_link: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create project');
      }

      console.log('Project created successfully:', data);
      navigateTo('dashboard'); // Go back to dashboard after creation

    } catch (err) {
      console.error('Project creation error:', err);
      setError(err.message);
    }
  };

  return (
    <div className="form-container">
      <h2>Create a New Project</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #dddfe2', borderRadius: '6px', fontSize: '1rem', minHeight: '100px' }}></textarea>
        </div>
        <div className="form-group">
          <label>Start Date</label>
          <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Reference Link (Optional)</label>
          <input type="url" name="reference_link" value={formData.reference_link} onChange={handleChange} />
        </div>
        <button type="submit" className="btn">Create Project</button>
      </form>
    </div>
  );
};

export default CreateProjectPage;
