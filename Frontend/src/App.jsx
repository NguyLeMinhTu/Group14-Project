import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setTokenFromStorage, fetchProfile, logout as logoutAction } from './store/authSlice';
import api, { setAuthFromLocalStorage, getAccessToken, setAccessToken, removeAccessToken, clearAuth } from './lib/api';
import AuthForm from './components/AuthForm';
import Register from './components/Register';
import Profile from './components/Profile';
import AdminUserList from './components/AdminUserList';
import AdminLogs from './components/AdminLogs';
import ModeratorPanel from './components/ModeratorPanel';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import DemoRefresh from './components/DemoRefresh';
import Navbar from './components/Navbar';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // local token state used by this component to drive initial UI; persisted token lives in localStorage
  const [token, setToken] = useState(getAccessToken() || null);
  // read auth state from redux so Navbar and other components have a single source of truth
  const auth = useSelector((s) => s.auth);

  // Initialize auth header and populate redux profile when a token exists
  useEffect(() => {
    dispatch(setTokenFromStorage());
    setAuthFromLocalStorage();

    if (!token) return;

    // populate store user so Navbar/ProtectedRoute stay consistent
    dispatch(fetchProfile());
  }, [dispatch, token]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore network errors on logout
    }
    // clear client-side state and notify store
    dispatch(logoutAction());
    clearAuth();
    setToken(null);
    navigate('/login');
  };

  // Called by login/register components after successful auth
  const handleAuth = (t) => {
    if (!t) return;
    setAccessToken(t);
    setToken(t);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {(token || auth.user) && <Navbar onLogout={handleLogout} />}

      <main className={token ? 'app-main p-6' : 'flex items-center justify-center min-h-screen p-6'}>
        <div className={token ? 'w-full' : 'w-full max-w-md'}>
          <Routes>
            <Route path="/login" element={<AuthForm onAuth={handleAuth} />} />
            <Route path="/register" element={<Register onAuth={handleAuth} />} />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route path="/forgot-password" element={<ForgotPassword />} />
            {/* support reset route with optional token in path */}
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminUserList />
                </ProtectedRoute>
              }
            />

            <Route path="/admin/logs" element={auth.token ? <AdminLogs /> : <AuthForm onAuth={handleAuth} />} />
            <Route path="/moderator" element={(auth.user?.role === 'moderator' || auth.user?.role === 'admin') ? <ModeratorPanel /> : <AuthForm onAuth={handleAuth} />} />

            <Route path="/demo-refresh" element={auth.token ? <DemoRefresh /> : <AuthForm onAuth={handleAuth} />} />

            <Route path="/" element={auth.token ? <Profile /> : <AuthForm onAuth={handleAuth} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
