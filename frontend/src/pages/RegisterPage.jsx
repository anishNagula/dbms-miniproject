// registerpage.jsx
// No new CSS file needed. This uses 100% utility classes.
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    f_name: '',
    l_name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    // ... (handleSubmit logic remains the same)
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/users/register', formData);
      login(response.data); // Use the login function from context
      navigate('/'); // Redirect to homepage on successful registration
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    // Use .page-container for consistent centering and max-width
    <div className="page-container">
      {/* Use .card and .form-container utility classes */}
      <form onSubmit={handleSubmit} className="card form-container">
        <h2 style={{ textAlign: 'center' }}>Create Account</h2>
        
        <div className="form-group">
          <label htmlFor="f_name">First Name</label>
          <input
            type="text"
            id="f_name"
            name="f_name"
            placeholder="Jane"
            onChange={handleChange}
            required
            className="input" // <-- USE CLASS
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="l_name">Last Name</label>
          <input
            type="text"
            id="l_name"
            name="l_name"
            placeholder="Doe"
            onChange={handleChange}
            required
            className="input" // <-- USE CLASS
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="you@email.com"
            onChange={handleChange}
            required
            className="input" // <-- USE CLASS
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="••••••••"
            onChange={handleChange}
            required
            className="input" // <-- USE CLASS
          />
        </div>
        
        <button type="submit" className="btn btn-primary">Register</button>
        
        {error && <p style={{ color: 'var(--destructive)', textAlign: 'center' }}>{error}</p>}
        
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;