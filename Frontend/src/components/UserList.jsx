import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // Fetch users
  const fetchUsers = () => {
    axios.get('http://localhost:3000/users')
      .then(response => setUsers(response.data))
      .catch(error => console.log(error));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Xóa user
  const handleDelete = (id) => {
    axios.delete(`http://localhost:3000/users/${id}`)
      .then(() => fetchUsers())
      .catch(error => alert('Xóa thất bại!'));
  };

  // Bắt đầu sửa user
  const handleEdit = (user) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
  };

  // Lưu user đã sửa
  const handleUpdate = () => {
    axios.put(`http://localhost:3000/users/${editingUser.id}`, {
      name: editName,
      email: editEmail
    })
      .then(() => {
        setEditingUser(null);
        fetchUsers();
      })
      .catch(error => alert('Sửa thất bại!'));
  };

  return (
    <div>
      <h2>List User</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} - {user.email}
            <button onClick={() => handleEdit(user)} style={{marginLeft: '8px'}}>Sửa</button>
            <button onClick={() => handleDelete(user.id)} style={{marginLeft: '4px'}}>Xóa</button>
          </li>
        ))}
      </ul>

      {editingUser && (
        <div style={{marginTop: '16px'}}>
          <h3>Sửa User</h3>
          <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Tên" />
          <input value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="Email" style={{marginLeft: '8px'}} />
          <button onClick={handleUpdate} style={{marginLeft: '8px'}}>Lưu</button>
          <button onClick={() => setEditingUser(null)} style={{marginLeft: '4px'}}>Hủy</button>
        </div>
      )}
    </div>
  );
};

export default UserList;