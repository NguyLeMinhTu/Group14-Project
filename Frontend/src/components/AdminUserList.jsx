import React, { useState } from 'react';

const mockUsers = [
  { id: 1, name: 'Nguyen Van A', email: 'a@example.com' },
  { id: 2, name: 'Tran Thi B', email: 'b@example.com' },
  { id: 3, name: 'Le Van C', email: 'c@example.com' },
];

const AdminUserList = () => {
  const [users, setUsers] = useState(mockUsers);

  const handleDelete = (id) => {
    // TODO: Gọi API xoá user
    setUsers(users.filter(user => user.id !== id));
  };

  return (
    <div className="admin-user-list">
      <h2>Danh sách User</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Email</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <button onClick={() => handleDelete(user.id)} style={{color: 'red'}}>Xoá</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUserList;
