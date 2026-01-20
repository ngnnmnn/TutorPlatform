import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import loginBg from '../assets/login_bg.jpg';
import { API_URL } from '../config';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
            setMessage(res.data.message);
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col bg-blue-50 bg-cover bg-center bg-no-repeat relative"
            style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${loginBg})`
            }}
        >
            <Navbar />

            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-12">
                <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-dark">Quên mật khẩu?</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Nhập email của bạn để lấy lại mật khẩu
                        </p>
                    </div>

                    {success ? (
                        <div className="bg-green-50 p-6 rounded-xl text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-green-800">Đã gửi email!</h3>
                            <p className="text-green-700 text-sm">
                                {message}
                            </p>
                            <Link
                                to="/login"
                                className="block w-full py-3 px-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all"
                            >
                                Quay lại đăng nhập
                            </Link>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
                                    {error}
                                </div>
                            )}

                            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg shadow-primary/30 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
                                </button>
                            </form>

                            <div className="text-center mt-4">
                                <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-dark">
                                    <ArrowLeft className="w-4 h-4" />
                                    Quay lại đăng nhập
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ForgotPassword;
