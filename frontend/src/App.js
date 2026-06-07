import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// ── Page Imports ──────────────────────────────────────────────
import Login from './components/Login';
import Register from './components/Register';
import LandingPage from './components/LandingPage';

// Dashboards
import AdminDashboard from './components/dashboards/AdminDashboard';
import StudentDashboard from './components/dashboards/StudentDashboard';
import FacultyDashboard from './components/dashboards/FacultyDashboard';
import ParentDashboard from './components/dashboards/ParentDashboard';

// ── Auth Guard ────────────────────────────────────────────────
const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      const dashMap = {
        student: '/dashboard/student',
        faculty: '/dashboard/faculty',
        parent: '/dashboard/parent',
        admin: '/dashboard/admin',
      };
      return <Navigate to={dashMap[user.role] || '/login'} replace />;
    }
    return children;
  } catch {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }
};

// ── Public Route Guard ────────────────────────────────────────
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      const dashMap = {
        student: '/dashboard/student',
        faculty: '/dashboard/faculty',
        parent: '/dashboard/parent',
        admin: '/dashboard/admin',
      };
      return <Navigate to={dashMap[user.role] || '/dashboard/student'} replace />;
    } catch {
      localStorage.clear();
    }
  }
  return children;
};

// ── App ───────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <Routes>

        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Dashboards */}
        <Route
          path="/dashboard/admin"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/student"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <StudentDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/faculty"
          element={
            <PrivateRoute allowedRoles={['faculty']}>
              <FacultyDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/parent"
          element={
            <PrivateRoute allowedRoles={['parent']}>
              <ParentDashboard />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;