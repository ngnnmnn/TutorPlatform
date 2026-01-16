import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, BookOpen, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="p-1">
                            <img src={logo} alt="TutorHub Logo" className="w-10 h-10 object-contain" />
                        </div>
                        <span className="font-bold text-xl text-dark tracking-tight">TutorHub</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/tutors" className="text-gray-600 hover:text-primary transition-colors font-medium">Tìm Gia Sư</Link>
                        <Link to="/feed" className="text-gray-600 hover:text-primary transition-colors font-medium">Bảng Tin</Link>
                        <Link to="/resources" className="text-gray-600 hover:text-primary transition-colors font-medium">Tài Liệu</Link>

                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link to="/profile" className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-primary font-bold overflow-hidden">
                                        {user.img ? (
                                            <img src={user.img} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            user.name?.charAt(0) || 'U'
                                        )}
                                    </div>
                                    <span className="font-medium text-dark">{user.name || 'User'}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm text-gray-500 hover:text-red-500 font-medium transition-colors"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-primary font-semibold hover:text-primary/80 transition-colors">Đăng nhập</Link>
                                <Link to="/register" className="bg-primary text-white px-5 py-2 rounded-full font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-dark p-2">
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            <Link to="/tutors" className="block px-3 py-2 text-gray-600 hover:text-primary font-medium rounded-md hover:bg-gray-50">Tìm Gia Sư</Link>
                            <Link to="/feed" className="block px-3 py-2 text-gray-600 hover:text-primary font-medium rounded-md hover:bg-gray-50">Bảng Tin</Link>
                            <Link to="/resources" className="block px-3 py-2 text-gray-600 hover:text-primary font-medium rounded-md hover:bg-gray-50">Tài Liệu</Link>

                            {user ? (
                                <div className="pt-4 border-t border-gray-100">
                                    <Link to="/profile" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-md">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-primary font-bold overflow-hidden">
                                            {user.img ? (
                                                <img src={user.img} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                user.name?.charAt(0) || 'U'
                                            )}
                                        </div>
                                        <span className="font-medium text-dark">{user.name || 'User'}</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-3 py-2 text-red-500 font-medium hover:bg-gray-50 rounded-md"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            ) : (
                                <div className="pt-4 flex flex-col gap-3">
                                    <Link to="/login" className="w-full text-center px-4 py-2 border border-blue-100 text-primary rounded-xl font-semibold">Đăng nhập</Link>
                                    <Link to="/register" className="w-full text-center px-4 py-2 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/30">Đăng ký</Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
