import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserList from './components/UserList';
import AddUser from './components/AddUser';
import './App.css';

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
    <div className="App container">
      <header className="app-header">
        <h1>User Manager</h1>
      </header>
      <main className="app-main">
        <section className="left">
          <AddUser onUserAdded={fetchUsers} />
        </section>
        <section className="right">
          <UserList users={users} onUsersChanged={fetchUsers} />
        </section>
      </main>
    </div>
  );
}

export default App;