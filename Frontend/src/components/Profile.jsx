import React, { useState } from 'react';

const mockUser = {
  name: 'Nguyen Van A',
  email: 'nguyenvana@example.com',
};

const Profile = () => {
  const [name, setName] = useState(mockUser.name);
  const [email, setEmail] = useState(mockUser.email);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleUpdate = (e) => {
    e.preventDefault();
    // TODO: Gọi API cập nhật thông tin user
    setMessage('Cập nhật thông tin thành công!');
  };

  return (
    <div className="profile-container">
      <h2>Thông tin cá nhân</h2>
      <form onSubmit={handleUpdate}>
        <div>
          <label>Tên:</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Mật khẩu mới:</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="submit">Cập nhật</button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
    </div>
  );
};

export default Profile;
