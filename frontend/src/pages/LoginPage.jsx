import React from 'react';

const LoginPage = ({ navigateTo }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic to call login API will go here
    console.log('Logging in...');
    // On successful login:
    // navigateTo('dashboard');
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="Enter your email" required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="Enter your password" required />
        </div>
        <button type="submit" className="btn">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
