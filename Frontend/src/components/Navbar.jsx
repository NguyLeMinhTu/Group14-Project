import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, User, Shield, LogOut, Menu, X, UserCircle, ShieldUser } from 'lucide-react';

const Navbar = ({ currentUser, onLogout }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-3" onClick={closeMobileMenu}>
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <ShieldUser className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Group14 App</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/"
                            className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 font-medium"
                        >
                            <Home className="w-4 h-4" />
                            Trang chủ
                        </Link>
                        <Link
                            to="/profile"
                            className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 font-medium"
                        >
                            <User className="w-4 h-4" />
                            Hồ sơ
                        </Link>
                        {currentUser?.role === 'admin' && (
                            <Link
                                to="/admin"
                                className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 font-medium"
                            >
                                <Shield className="w-4 h-4" />
                                Quản trị
                            </Link>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        {currentUser && (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
                                    <UserCircle className="w-5 h-5 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-700">Xin chào, {currentUser.name}</span>
                                </div>
                                <button
                                    onClick={onLogout}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-lg">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <Link
                                to="/"
                                className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 font-medium"
                                onClick={closeMobileMenu}
                            >
                                <Home className="w-5 h-5" />
                                Trang chủ
                            </Link>
                            <Link
                                to="/profile"
                                className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 font-medium"
                                onClick={closeMobileMenu}
                            >
                                <User className="w-5 h-5" />
                                Hồ sơ
                            </Link>
                            {currentUser?.role === 'admin' && (
                                <Link
                                    to="/admin"
                                    className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 font-medium"
                                    onClick={closeMobileMenu}
                                >
                                    <Shield className="w-5 h-5" />
                                    Quản trị
                                </Link>
                            )}
                            {currentUser && (
                                <div className="border-t border-gray-200 pt-3 mt-3">
                                    <div className="flex items-center gap-3 px-3 py-2 mb-3">
                                        <UserCircle className="w-5 h-5 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-700">Xin chào, {currentUser.name}</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            onLogout();
                                            closeMobileMenu();
                                        }}
                                        className="flex items-center gap-3 w-full px-3 py-3 text-left text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Đăng xuất
                                    </button>
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
