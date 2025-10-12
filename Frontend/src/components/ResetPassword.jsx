import React, { useState } from 'react';

const ResetPassword = () => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Gọi API đổi mật khẩu bằng token
    setMessage('Đổi mật khẩu thành công!');
  };

  return (
    <div className="reset-password-container">
      <h2>Đổi mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Token:</label>
          <input type="text" value={token} onChange={e => setToken(e.target.value)} required />
        </div>
        <div>
          <label>Mật khẩu mới:</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
        </div>
        <button type="submit">Đổi mật khẩu</button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
    </div>
  );
};

export default ResetPassword;
