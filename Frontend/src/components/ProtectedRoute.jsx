import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { token, user, status } = useSelector((s) => s.auth);

  // If we have a token but profile is loading, show nothing (or a spinner)
  if (token && status === 'loading') {
    return null; // app could render a spinner here
  }

  // Not authenticated
  if (!token) return <Navigate to="/login" replace />;

  // If auth succeeded but user not loaded, we allow access (fallback) or block if admin required
  if (requireAdmin && user?.role !== 'admin') return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
