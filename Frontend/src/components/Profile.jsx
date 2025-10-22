import React, { useState, useEffect } from 'react';
import api, { setAuthFromLocalStorage, clearAuth } from '../lib/api';
import { LogOut, Trash2, UploadCloud, User, Mail, Lock, Camera, Link as LinkIcon, Save, ArrowLeft } from 'lucide-react';
import DemoRefresh from './DemoRefresh';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const Profile = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  const [file, setFile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchProfile = async () => {
    try {
      setAuthFromLocalStorage();
      const res = await api.get(`/profile`);
      const user = res.data;
      setName(user.name || '');
      setEmail(user.email || '');
      setAvatar(user.avatar || '');
      setUserId(user._id || user.id || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải profile');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const body = { name, email };
      if (password) body.password = password;
  setAuthFromLocalStorage();
  const res = await api.put(`/profile`, body);
      setMessage(res.data.message || 'Cập nhật thông tin thành công!');
      setPassword('');
      // refresh avatar/name/email
      setName(res.data.name || name);
      setEmail(res.data.email || email);
      setAvatar(res.data.avatar || avatar);
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadFile = async () => {
    if (!file) return setError('Chưa chọn file');
    setError('');
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append('avatar', file);
  setAuthFromLocalStorage();
  const res = await api.post(`/profile/upload-avatar`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAvatar(res.data.avatar || res.data.avatarUrl || '');
      setMessage('Upload avatar thành công');
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload thất bại');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadUrl = async () => {
    const url = prompt('Dán URL ảnh (ví dụ một URL cloudinary):');
    if (!url) return;
    setError('');
    setIsUploading(true);
    try {
  setAuthFromLocalStorage();
  const res = await api.post(`/profile/upload-avatar`, { avatarUrl: url });
      setAvatar(res.data.avatar || '');
      setMessage('Avatar cập nhật từ URL thành công');
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật avatar thất bại');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId) return setError('Không xác định user');
    if (!confirm('Bạn có chắc muốn xóa tài khoản này? Hành động không thể hoàn tác.')) return;
    try {
  setAuthFromLocalStorage();
  await api.delete(`/users/${userId}`);
  // logout after delete
  await api.post(`/auth/logout`).catch(() => { });
  clearAuth();
  window.location.href = '/login';
    } catch (err) {
      setError(err.response?.data?.message || 'Xóa tài khoản thất bại');
    }
  };

  const handleLogout = async () => {
    try {
      setAuthFromLocalStorage();
      await api.post(`/auth/logout`);
    } catch (err) {
      // ignore
    }
    clearAuth();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Thông tin cá nhân</h1>
            <p className="text-gray-600">Quản lý thông tin cá nhân của bạn</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar Section */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Ảnh đại diện</h2>

              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-48 h-48 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl overflow-hidden shadow-xl">
                    {avatar ? (
                      <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-24 h-24 text-white/80" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => document.getElementById('avatar-input').click()}
                    className="absolute bottom-2 right-2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Camera className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
              </div>

              <input
                id="avatar-input"
                className="hidden"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />

              <div className="space-y-3">
                <button
                  onClick={handleUploadFile}
                  disabled={!file || isUploading}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:transform-none disabled:opacity-50"
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang upload...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <UploadCloud className="w-5 h-5" />
                      Upload file
                    </div>
                  )}
                </button>

                <button
                  onClick={handleUploadUrl}
                  disabled={isUploading}
                  className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-center gap-2">
                    <LinkIcon className="w-5 h-5" />
                    Upload từ URL
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin cá nhân</h2>

              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Họ và tên
                    </label>
                    <input
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-200 text-gray-900 placeholder-gray-400"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Nhập họ và tên"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <input
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-200 text-gray-900 placeholder-gray-400"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Nhập email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Mật khẩu mới (để trống nếu không đổi)
                  </label>
                  <input
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-200 text-gray-900 placeholder-gray-400"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {message && (
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-xl">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">{message}</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:transform-none disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang cập nhật...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Save className="w-5 h-5" />
                      Cập nhật thông tin
                    </div>
                  )}
                </button>
              </form>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleLogout}
                    className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <LogOut className="w-5 h-5" />
                      Đăng xuất
                    </div>
                  </button>

                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Trash2 className="w-5 h-5" />
                      Xóa tài khoản
                    </div>
                  </button>
                </div>
                <div className="mt-6">
                  <DemoRefresh />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
