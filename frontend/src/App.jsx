import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import CreateProjectPage from './pages/CreateProjectPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProfilePage from './pages/ProfilePage';
import EditProjectPage from './pages/EditProjectPage';

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/projects/:id" element={<ProjectDetailsPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
          />
          <Route
            path="/create-project"
            element={<ProtectedRoute><CreateProjectPage /></ProtectedRoute>}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
          />
          <Route
            path="/projects/:id/edit"
            element={<ProtectedRoute><EditProjectPage /></ProtectedRoute>}
          />
          {/* Admin Route */}
          <Route
            path="/admin/dashboard"
            element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>}
          />
        </Routes>
      </main>
    </>
  );
}

export default App;