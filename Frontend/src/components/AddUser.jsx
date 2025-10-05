import React, { useState } from 'react';
import axios from 'axios';

const AddUser = ({ onUserAdded }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('Name không được để trống');
    if (!/\S+@\S+\.\S+/.test(email)) return alert('Email không hợp lệ');

    try {
      await axios.post('http://localhost:3000/users', { name, email });
      setName('');
      setEmail('');
      if (onUserAdded) onUserAdded();
    } catch (err) {
      console.error(err);
      alert('Thêm user thất bại');
    }
  };

  return (
    <div className="card add-user">
      <h3>Thêm User</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="btn">Thêm</button>
      </form>
    </div>
  );
};

export default AddUser;