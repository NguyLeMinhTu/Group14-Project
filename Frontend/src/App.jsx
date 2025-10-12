import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserList from './components/UserList';
import AddUser from './components/AddUser';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import AdminUserList from './components/AdminUserList';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function App() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:3000/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Router>
      <div className="App container">
        <header className="app-header">
          <h1>User Manager</h1>
          <nav>
            <Link to="/">Trang chủ</Link> |{' '}
            <Link to="/login">Đăng nhập</Link> |{' '}
            <Link to="/register">Đăng ký</Link> |{' '}
            <Link to="/profile">Profile</Link> |{' '}
            <Link to="/admin">Admin</Link> |{' '}
            <Link to="/forgot-password">Quên mật khẩu</Link> |{' '}
            <Link to="/reset-password">Đổi mật khẩu</Link>
          </nav>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={<AdminUserList />} />
            <Route path="/" element={
              <>
                <section className="left">
                  <AddUser onUserAdded={fetchUsers} />
                </section>
                <section className="right">
                  <UserList users={users} onUsersChanged={fetchUsers} />
                </section>
              </>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;