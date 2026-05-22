import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminQuestionManager from './pages/AdminQuestionManager';
import AdminUserManager from './pages/AdminUserManager';
import TestConfig from './pages/TestConfig';
import TestEngine from './pages/TestEngine';
import Result from './pages/Result';
import useAuthStore from './store/useAuthStore';
import Profile from './pages/Profile';

// Simple Role Guard Component
const RoleGuard = ({ children, allowedRole, userRole }) => {
  if (!userRole) return <Navigate to="/login" replace />;

  if (userRole !== allowedRole) {
    // If student tries admin -> dashboard
    // If admin tries dashboard -> admin
    return <Navigate to={userRole === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  return children;
};

function App() {
  const { user } = useAuthStore();
  // Ensure we have the user from store (which syncs with local storage on init)
  // If store is empty but local storage has token, we might need to rely on store's init logic

  const role = user?.role;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={
            <RoleGuard allowedRole="admin" userRole={role}>
              <AdminDashboard />
            </RoleGuard>
          } />
          <Route path="/admin/questions" element={
            <RoleGuard allowedRole="admin" userRole={role}>
              <AdminQuestionManager />
            </RoleGuard>
          } />
          <Route path="/admin/users" element={
            <RoleGuard allowedRole="admin" userRole={role}>
              <AdminUserManager />
            </RoleGuard>
          } />
        </Route>

        {/* Student Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={
              <RoleGuard allowedRole="student" userRole={role}>
                <Dashboard />
              </RoleGuard>
            } />
            <Route path="/test/config" element={<TestConfig />} />
            <Route path="/test/attempt/:id" element={<TestEngine />} />
            <Route path="/test/result/:id" element={<Result />} />
            <Route path="/profile" element={<Profile />} />
            {/* Default Redirect based on role */}
            <Route path="/" element={<Navigate to={role === 'admin' ? "/admin" : "/dashboard"} replace />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
