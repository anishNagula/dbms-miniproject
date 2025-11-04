// loginpage.jsx
// No new CSS file needed. This uses 100% utility classes.
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
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
      const response = await api.post('/users/login', formData);
      login(response.data); // Use the login function from context
      navigate('/'); // Redirect to homepage on successful login
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your entered credentials.');
    }
  };

  return (
    // Use .page-container for consistent centering and max-width
    <div className="page-container">
      {/* Use .card and .form-container utility classes */}
      <form onSubmit={handleSubmit} className="card form-container">
        <h2 style={{ textAlign: 'center' }}>Login</h2>
        
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
        
        <button type="submit" className="btn btn-primary">Login</button>
        
        {error && <p style={{ color: 'var(--destructive)', textAlign: 'center' }}>{error}</p>}

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;