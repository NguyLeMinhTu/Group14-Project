import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setTokenFromStorage, fetchProfile, logout as logoutAction } from './store/authSlice';
import api, { setAuthFromLocalStorage, clearAuth, getAccessToken, setAccessToken, removeAccessToken, clearAuth } from './lib/api';
import { useNavigate } from 'react-router-dom';
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
  const { token } = useSelector((s) => s.auth);

  useEffect(() => {
    // initialize token/header from storage and fetch profile if token exists
    dispatch(setTokenFromStorage());
    if (localStorage.getItem('token')) {
      dispatch(fetchProfile());
    }
  }, [dispatch]);

  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutAction());
    navigate('/login');
  };

  // navigation helper passed to Auth components (they call thunks themselves)
  const handleAuth = () => {
  const [token, setToken] = useState(getAccessToken() || null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      // set api auth header if token in localStorage
      setAuthFromLocalStorage();
      if (!token) return;
      try {
        // fetch current user profile first
        const res = await api.get('/profile');
        setCurrentUser(res.data || null);
        // Admin-specific user listing is handled in the admin route/component
      } catch (err) {
        // if token invalid or expired, clear auth and redirect to login
        console.info('Profile fetch failed, clearing auth', err?.response?.status);
        clearAuth();
        setToken(null);
        setCurrentUser(null);
        // optionally redirect to login
        // window.location.href = '/login';
      }
    };
    init();
  }, [token]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // ignore
    }
    clearAuth();
    setToken(null);
    setCurrentUser(null);
    navigate('/login');
  };

  const navigate = useNavigate();

  // centralize what happens after successful auth (login/register)
  const handleAuth = (t) => {
    if (!t) return;
    setAccessToken(t);
    setToken(t);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {token && <Navbar onLogout={handleLogout} />}
      {currentUser && <Navbar currentUser={currentUser} onLogout={handleLogout} />}

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
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminUserList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/demo-refresh" element={token ? <DemoRefresh /> : <AuthForm onAuth={handleAuth} />} />
            <Route path="/profile" element={token ? <Profile /> : <AuthForm onAuth={handleAuth} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={token ? <AdminUserList /> : <AuthForm onAuth={handleAuth} />} />
            <Route path="/admin/logs" element={token ? <AdminLogs /> : <AuthForm onAuth={handleAuth} />} />
            <Route path="/admin" element={currentUser?.role === 'admin' ? <AdminUserList /> : <AuthForm onAuth={handleAuth} />} />
            <Route path="/moderator" element={(currentUser?.role === 'moderator' || currentUser?.role === 'admin') ? <ModeratorPanel /> : <AuthForm onAuth={handleAuth} />} />
            <Route path="/" element={token ? <Profile /> : <AuthForm onAuth={handleAuth} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
