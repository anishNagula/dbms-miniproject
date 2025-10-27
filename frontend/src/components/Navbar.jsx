import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">PESU Skill-Connect</Link>
      </div>
      <div className="navbar-links">
        {user ? (
          <>
            <span>Welcome, {user.f_name}!</span>
            
            {/* THIS IS THE MISSING PART */}
            {user.role === 'admin' && (
              <Link to="/admin/dashboard" style={{ color: '#ffc107', fontWeight: 'bold' }}>
                Admin Panel
              </Link>
            )}

            <Link to="/profile">My Profile</Link>
            <Link to="/create-project">Create Project</Link>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;