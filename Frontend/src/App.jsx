import React from 'react';
import UserList from './components/UserList';
import AddUser from './components/AddUser';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>User Manager</h1>
      <AddUser />
      <UserList />
    </div>
  );
}

export default App;