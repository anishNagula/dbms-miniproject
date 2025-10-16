import React from 'react';

const RegisterPage = ({ navigateTo }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic to call register API will go here
    console.log('Registering...');
     // On successful registration:
    // navigateTo('dashboard');
  };

  return (
    <div className="form-container">
      <h2>Create an Account</h2>
      <form onSubmit={handleSubmit}>
         <div className="form-group">
          <label>Student ID</label>
          <input type="text" placeholder="e.g., s001" required />
        </div>
        <div className="form-group">
          <label>First Name</label>
          <input type="text" placeholder="Enter your first name" required />
        </div>
         <div className="form-group">
          <label>Last Name</label>
          <input type="text" placeholder="Enter your last name" required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="Enter your email" required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="Create a password" required />
        </div>
        <button type="submit" className="btn">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;
