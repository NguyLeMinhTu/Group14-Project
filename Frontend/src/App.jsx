import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { setAuthFromLocalStorage } from './lib/api';
// UserList and AddUser were removed from the root route in favor of the Profile page
import AuthForm from './components/AuthForm';
import Register from './components/Register';
import Profile from './components/Profile';
import AdminUserList from './components/AdminUserList';
import AdminLogs from './components/AdminLogs';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Navbar from './components/Navbar';
import { Routes, Route } from 'react-router-dom';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      // set axios auth header if token in localStorage
      setAuthFromLocalStorage();
      if (!token) return;
      try {
        // fetch current user profile first
        const res = await axios.get('/profile');
        setCurrentUser(res.data || null);
        // Admin-specific user listing is handled in the admin route/component
      } catch (err) {
        // if token invalid or expired, clear auth and redirect to login
        console.info('Profile fetch failed, clearing auth', err?.response?.status);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
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
      await axios.post('/auth/logout');
    } catch (err) {
      // ignore
    }
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    navigate('/login');
  };

  const navigate = useNavigate();

  // centralize what happens after successful auth (login/register)
  const handleAuth = (t) => {
    if (!t) return;
    localStorage.setItem('token', t);
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {token && <Navbar currentUser={currentUser} onLogout={handleLogout} />}

      <main className={token ? 'app-main p-6' : 'flex items-center justify-center min-h-screen p-6'}>
        <div className={token ? 'w-full' : 'w-full max-w-md'}>
          <Routes>
            <Route path="/login" element={<AuthForm onAuth={handleAuth} />} />
            <Route path="/register" element={<Register onAuth={handleAuth} />} />
            <Route path="/profile" element={token ? <Profile /> : <AuthForm onAuth={handleAuth} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={token ? <AdminUserList /> : <AuthForm onAuth={handleAuth} />} />
            <Route path="/admin/logs" element={token ? <AdminLogs /> : <AuthForm onAuth={handleAuth} />} />
            <Route path="/" element={token ? <Profile /> : <AuthForm onAuth={handleAuth} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;