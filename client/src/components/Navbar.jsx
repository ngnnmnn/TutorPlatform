import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, BookOpen, User, Shield, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import logo from '../assets/logo.png';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll every 60s
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update local state
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification._id);
        }
        setShowNotifications(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const displayName = user?.full_name || user?.name || 'User';

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
                        <Link to="/combos" className="text-gray-600 hover:text-primary transition-colors font-medium">Combo</Link>
                        <Link to="/feed" className="text-gray-600 hover:text-primary transition-colors font-medium">Bảng Tin</Link>
                        <Link to="/resources" className="text-gray-600 hover:text-primary transition-colors font-medium">Tài Liệu</Link>

                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link to="/schedule" className="text-gray-600 hover:text-primary transition-colors font-medium">Lịch học</Link>
                                <Link to="/my-bookings" className="text-gray-600 hover:text-primary transition-colors font-medium">Quản lý Booking</Link>

                                {/* Notifications */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="relative p-2 text-gray-600 hover:text-primary transition-colors rounded-full hover:bg-gray-100"
                                    >
                                        <Bell className="w-6 h-6" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {showNotifications && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                                            >
                                                <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                                                    <h3 className="font-semibold text-gray-900">Thông báo</h3>
                                                    {unreadCount > 0 && (
                                                        <button
                                                            className="text-xs text-primary hover:underline"
                                                            onClick={async () => {
                                                                try {
                                                                    const token = localStorage.getItem('token');
                                                                    await axios.put('http://localhost:5000/api/notifications/read-all', {}, {
                                                                        headers: { Authorization: `Bearer ${token}` }
                                                                    });
                                                                    setNotifications(notifications.map(n => ({ ...n, read: true })));
                                                                    setUnreadCount(0);
                                                                } catch (e) {
                                                                    console.error(e);
                                                                }
                                                            }}
                                                        >
                                                            Đánh dấu đã đọc
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="max-h-80 overflow-y-auto">
                                                    {notifications.length === 0 ? (
                                                        <div className="p-4 text-center text-gray-500 text-sm">
                                                            Không có thông báo nào
                                                        </div>
                                                    ) : (
                                                        notifications.map(notification => (
                                                            <Link
                                                                key={notification._id}
                                                                to={notification.link || '#'}
                                                                onClick={() => handleNotificationClick(notification)}
                                                                className={`block p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}
                                                            >
                                                                <div className="flex gap-3">
                                                                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notification.read ? 'bg-primary' : 'bg-transparent'}`} />
                                                                    <div>
                                                                        <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                                            {notification.title}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                                            {notification.message}
                                                                        </p>
                                                                        <p className="text-[10px] text-gray-400 mt-1">
                                                                            {new Date(notification.createdAt).toLocaleDateString('vi-VN')}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        ))
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Admin Dashboard Button */}
                                {user.role === 'admin' && (
                                    <Link
                                        to="/admin"
                                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/30"
                                    >
                                        <Shield className="w-4 h-4" />
                                        Admin
                                    </Link>
                                )}

                                <Link to="/profile" className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-primary font-bold overflow-hidden">
                                        {user.img ? (
                                            <img src={user.img} alt={displayName} className="w-full h-full object-cover" />
                                        ) : (
                                            displayName.charAt(0)
                                        )}
                                    </div>
                                    <span className="font-medium text-dark">{displayName}</span>
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
                            <Link to="/combos" className="block px-3 py-2 text-gray-600 hover:text-primary font-medium rounded-md hover:bg-gray-50">Combo</Link>
                            <Link to="/feed" className="block px-3 py-2 text-gray-600 hover:text-primary font-medium rounded-md hover:bg-gray-50">Bảng Tin</Link>
                            <Link to="/resources" className="block px-3 py-2 text-gray-600 hover:text-primary font-medium rounded-md hover:bg-gray-50">Tài Liệu</Link>

                            {user ? (
                                <div className="pt-4 border-t border-gray-100">
                                    <Link to="/schedule" className="block px-3 py-2 text-gray-600 hover:text-primary font-medium rounded-md hover:bg-gray-50">Lịch học</Link>
                                    <Link to="/my-bookings" className="block px-3 py-2 text-gray-600 hover:text-primary font-medium rounded-md hover:bg-gray-50">Quản lý Booking</Link>

                                    {/* Admin Dashboard Button - Mobile */}
                                    {user.role === 'admin' && (
                                        <Link
                                            to="/admin"
                                            className="flex items-center gap-2 px-3 py-3 mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium"
                                        >
                                            <Shield className="w-5 h-5" />
                                            Admin Dashboard
                                        </Link>
                                    )}

                                    <Link to="/profile" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-md">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-primary font-bold overflow-hidden">
                                            {user.img ? (
                                                <img src={user.img} alt={displayName} className="w-full h-full object-cover" />
                                            ) : (
                                                displayName.charAt(0)
                                            )}
                                        </div>
                                        <span className="font-medium text-dark">{displayName}</span>
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
