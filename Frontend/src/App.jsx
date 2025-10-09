import React, { useState } from 'react';
import UserList from './components/UserList';
import AddUser from './components/AddUser';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

function App() {
  const [user, setUser] = useState(null); // user sau khi đăng nhập
  const [showRegister, setShowRegister] = useState(false);

  // Khi đăng nhập thành công
  const handleLogin = (userData) => {
    setUser(userData);
  };

  // Khi đăng ký thành công, tự động chuyển sang đăng nhập
  const handleRegister = () => {
    setShowRegister(false);
  };

  // Đăng xuất
  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="App container">
      <header className="app-header">
        <h1>User Manager</h1>
        {user && <button onClick={handleLogout}>Đăng xuất</button>}
      </header>
      <main className="app-main">
        {!user ? (
          <div style={{ maxWidth: 400, margin: '0 auto' }}>
            {showRegister ? (
              <>
                <Register onRegister={handleRegister} />
                <p>Bạn đã có tài khoản? <button onClick={() => setShowRegister(false)}>Đăng nhập</button></p>
              </>
            ) : (
              <>
                <Login onLogin={handleLogin} />
                <p>Chưa có tài khoản? <button onClick={() => setShowRegister(true)}>Đăng ký</button></p>
              </>
            )}
          </div>
        ) : (
          <main className="app-main">
            <section className="left">
              <AddUser onUserAdded={() => {}} />
            </section>
            <section className="right">
              <UserList />
            </section>
          </main>
        )}
      </main>
    </div>
  );
}

export default App;