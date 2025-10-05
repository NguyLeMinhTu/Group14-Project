import React from 'react';
import axios from 'axios';

const UserList = ({ users = [], onUsersChanged }) => {
  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa user này?')) return;
    try {
      await axios.delete(`http://localhost:3000/users/${id}`);
      if (onUsersChanged) onUsersChanged();
    } catch (err) {
      console.error(err);
      alert('Xóa thất bại');
    }
  };

  const handleEdit = async (user) => {
    const newName = prompt('Tên mới:', user.name);
    const newEmail = prompt('Email mới:', user.email);
    if (!newName || !newEmail) return;
    try {
      await axios.put(`http://localhost:3000/users/${user._id}`, { name: newName, email: newEmail });
      if (onUsersChanged) onUsersChanged();
    } catch (err) {
      console.error(err);
      alert('Cập nhật thất bại');
    }
  };

  return (
    <div className="card user-list">
      <h3>Danh sách User</h3>
      {users.length === 0 ? (
        <p>Chưa có user nào</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <button className="btn small" onClick={() => handleEdit(user)}>Sửa</button>
                  <button className="btn small danger" onClick={() => handleDelete(user._id)}>Xoá</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserList;