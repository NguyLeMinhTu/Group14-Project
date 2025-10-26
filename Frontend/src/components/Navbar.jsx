import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { User, Shield, LogOut, Menu, X, UserCircle, ShieldUser, FileText, Panda } from 'lucide-react';
import { logout as logoutAction } from '../store/authSlice';

const Navbar = ({ onLogout }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector((s) => s.auth);

    const toggleMobileMenu = () => setIsMobileMenuOpen(v => !v);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const toggleUserMenu = () => setIsUserMenuOpen(v => !v);
    const closeUserMenu = () => setIsUserMenuOpen(false);

    const navLinkClass = ({ isActive }) => isActive
        ? 'flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-900 font-medium'
        : 'flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200';

    return (
        <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-3" onClick={closeMobileMenu}>
                            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg">
                                <Panda className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Group14 App</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        <NavLink to="/profile" className={navLinkClass} onClick={closeUserMenu}>
                            <User className="w-4 h-4" />
                            <span className="hidden sm:inline">Hồ sơ</span>
                        </NavLink>

                        {/* Demo refresh moved to Profile page; link removed from navbar */}

                        {currentUser?.role === 'admin' && (
                            <NavLink to="/admin" className={navLinkClass} onClick={closeUserMenu}>
                                <Shield className="w-4 h-4" />
                                <span className="hidden sm:inline">Quản trị</span>
                            </NavLink>
                        )}

                        {currentUser?.role === 'admin' && (
                            <NavLink to="/admin/logs" className={navLinkClass} onClick={closeUserMenu}>
                                <FileText className="w-4 h-4" />
                                <span className="hidden sm:inline">Logs</span>
                            </NavLink>
                        )}

                        {currentUser?.role === 'moderator' && (
                            <NavLink to="/moderator" className={navLinkClass} onClick={closeUserMenu}>
                                <Shield className="w-4 h-4" />
                                <span className="hidden sm:inline">Moderator</span>
                            </NavLink>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="hidden md:flex items-center space-x-4 relative">
                        {currentUser ? (
                            <>
                                <div className="relative flex items-center gap-3">
                                    <button
                                        onClick={toggleUserMenu}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-200 transition"
                                        aria-expanded={isUserMenuOpen}
                                    >
                                        {currentUser.avatar ? (
                                            <img src={currentUser.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-medium">{(currentUser.name || 'U').charAt(0).toUpperCase()}</div>
                                        )}
                                        <span className="text-sm font-medium text-gray-700 hidden sm:inline">Xin chào, {currentUser.name}</span>
                                    </button>

                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black/5 py-2 z-50">
                                            <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200" onClick={() => { closeUserMenu(); closeMobileMenu(); }}>
                                                Hồ sơ
                                            </Link>
                                            <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-200" onClick={() => { (onLogout || (() => dispatch(logoutAction())))(); closeUserMenu(); }}>
                                                <div className="flex items-center gap-2"><LogOut className="w-4 h-4" />Đăng xuất</div>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Inline logout button kept visible on desktop for quick access */}
                                <button
                                    onClick={onLogout || (() => dispatch(logoutAction()))}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-black text-white font-medium rounded-xl shadow-sm transition-colors duration-150"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:inline">Đăng xuất</span>
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="px-3 py-2 rounded-lg text-sm text-indigo-600 hover:bg-gray-200">Đăng nhập</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-gray-700 hover:bg-gray-200 transition-all duration-200"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-lg">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <Link to="/profile" className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition" onClick={closeMobileMenu}>
                                <User className="w-5 h-5" />
                                Hồ sơ
                            </Link>
                            {/* Demo refresh moved to Profile page; link removed from mobile menu */}
                            {currentUser?.role === 'admin' && (
                                <Link to="/admin" className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition" onClick={closeMobileMenu}>
                                    <Shield className="w-5 h-5" /> Quản trị
                                </Link>
                            )}

                            {currentUser ? (
                                <div className="border-t border-gray-200 pt-3 mt-3">
                                    <div className="flex items-center gap-3 px-3 py-2 mb-3">
                                        {currentUser.avatar ? (
                                            <img src={currentUser.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                                        ) : (
                                            <UserCircle className="w-8 h-8 text-gray-600" />
                                        )}
                                        <div>
                                            <div className="text-sm font-medium text-gray-700">{currentUser.name}</div>
                                            <div className="text-xs text-gray-500">{currentUser.email}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => { (onLogout || (() => dispatch(logoutAction())))(); closeMobileMenu(); }} className="flex items-center gap-3 w-full px-3 py-3 text-left text-gray-900 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
                                        <LogOut className="w-5 h-5" /> Đăng xuất
                                    </button>
                                </div>
                            ) : (
                                <div className="pt-3">
                                    <Link to="/login" className="block px-3 py-3 text-center font-medium text-gray-900" onClick={closeMobileMenu}>Đăng nhập</Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
