import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, Mail, Lock, BookOpen } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data));
            window.location.href = '/';
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-12">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-dark">Tạo tài khoản mới</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Bắt đầu hành trình học tập cùng TutorPlatform
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và Tên</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="Nguyễn Văn A"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="vidu@gmail.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bạn là?</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${formData.role === 'student' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:border-gray-300'}`}
                                        onClick={() => setFormData({ ...formData, role: 'student' })}
                                    >
                                        <BookOpen className="w-6 h-6" />
                                        <span className="font-medium">Học sinh</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${formData.role === 'tutor' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:border-gray-300'}`}
                                        onClick={() => setFormData({ ...formData, role: 'tutor' })}
                                    >
                                        <User className="w-6 h-6" />
                                        <span className="font-medium">Gia sư</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg shadow-primary/30 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600">
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="font-bold text-primary hover:text-primary/80">
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Register;
