import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectPage from './pages/ProjectPage';

const App = () => {
  const [page, setPage] = useState('home');
  const [projectId, setProjectId] = useState(null);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Check for token in localStorage on initial render
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setPage('dashboard'); // Go to dashboard if already logged in
    }
  }, []);

  const handleLogin = (userData, userToken) => {
    setToken(userToken);
    setUser(userData);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    navigateTo('dashboard');
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigateTo('home');
  };

  const navigateTo = (targetPage, id = null) => {
    setPage(targetPage);
    if (id) {
        setProjectId(id);
    }
  };

  const renderPage = () => {
    switch (page) {
      case 'login':
        return <LoginPage navigateTo={navigateTo} onLogin={handleLogin} />;
      case 'register':
        return <RegisterPage navigateTo={navigateTo} onLogin={handleLogin} />;
      case 'dashboard':
        return <DashboardPage navigateTo={navigateTo} token={token} />;
      case 'project':
        return <ProjectPage projectId={projectId} navigateTo={navigateTo} token={token} />;
      case 'home':
      default:
        return <HomePage navigateTo={navigateTo} />;
    }
  };

  return (
    <div>
      <nav>
        <h1 onClick={() => navigateTo(token ? 'dashboard' : 'home')}>ProjectLink</h1>
        <div>
          {token ? (
            <>
              <span>Welcome, {user?.f_name}!</span>
              <a href="#" onClick={() => navigateTo('dashboard')}>Dashboard</a>
              <a href="#" onClick={handleLogout}>Logout</a>
            </>
          ) : (
            <>
              <a href="#" onClick={() => navigateTo('login')}>Login</a>
              <a href="#" onClick={() => navigateTo('register')}>Register</a>
            </>
          )}
        </div>
      </nav>
      <main>
        {renderPage()}
      </main>
    </div>
  );
};

export default App;

