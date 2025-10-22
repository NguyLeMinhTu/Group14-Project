import React, { useState } from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { LogIn, Key } from 'lucide-react';
import BackButton from './BackButton';

const API_BASE = import.meta.env.VITE_API_BASE || '';

const AuthForm = ({ onAuth }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState('');

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            const token = res.data?.token;
            if (!token) throw new Error('Không nhận được token');
            if (onAuth) onAuth(token);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleForgot = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/forgot-password', { email });
            const token = res.data?.resetToken;
            setResetMessage(token ? `Reset token (demo): ${token}` : (res.data?.message || 'Yêu cầu đã gửi'));
        } catch (err) {
            setError(err.response?.data?.message || 'Gửi yêu cầu thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <div className="absolute left-4 top-6 -translate-y-4">
                <BackButton className="text-gray-500" />
            </div>
            <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg ring-1 ring-gray-100">
                <div className="flex items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold flex items-center gap-3"><LogIn className="w-6 h-6 text-blue-600" />Đăng nhập</h2>
                        <p className="text-sm text-gray-500">Đăng nhập để tiếp tục sử dụng ứng dụng</p>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            type="email"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                        <input
                            className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            type="password"
                            placeholder="Mật khẩu của bạn"
                            required
                        />
                    </div>

                    <div>
                        <button
                            className="w-full inline-flex justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 shadow-sm hover:from-blue-700 hover:to-blue-600"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Đang...' : 'Đăng nhập'}
                        </button>
                    </div>
                </form>

                {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
                {resetMessage && (
                    <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-md text-sm flex items-start gap-2">
                        <Key className="w-4 h-4 mt-0.5" />
                        <div>{resetMessage}</div>
                    </div>
                )}

                <div className="mt-6 flex flex-col gap-3 text-sm">
                    <div className="text-center text-gray-500">Chưa có tài khoản? <button className="text-blue-600 font-medium" onClick={() => navigate('/register')}>Tạo tài khoản</button></div>
                    <div className="text-center"><button className="text-blue-600 font-medium" onClick={() => navigate('/forgot-password')}>Quên mật khẩu</button></div>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;
