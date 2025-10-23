import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setTokenFromStorage, fetchProfile, logout as logoutAction } from './store/authSlice';
import AuthForm from './components/AuthForm';
import Register from './components/Register';
import Profile from './components/Profile';
import AdminUserList from './components/AdminUserList';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
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
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {token && <Navbar onLogout={handleLogout} />}

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
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
