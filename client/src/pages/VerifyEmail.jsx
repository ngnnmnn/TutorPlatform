import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { API_URL } from '../config';

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyAccount = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/auth/verify/${token}`);
                setStatus('success');
                setMessage(res.data.message);
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Xác thực thất bại. Link có thể đã hết hạn.');
            }
        };

        if (token) {
            verifyAccount();
        }
    }, [token]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
                    {status === 'loading' && (
                        <div className="flex flex-col items-center">
                            <Loader className="w-16 h-16 text-primary animate-spin mb-4" />
                            <h2 className="text-2xl font-bold text-gray-800">Đang xác thực...</h2>
                            <p className="text-gray-600 mt-2">Vui lòng đợi trong giây lát</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center">
                            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                            <h2 className="text-2xl font-bold text-green-600">Thành công!</h2>
                            <p className="text-gray-600 mt-2 mb-6">{message}</p>
                            <Link
                                to="/login"
                                className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                            >
                                Đăng nhập ngay
                            </Link>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center">
                            <XCircle className="w-16 h-16 text-red-500 mb-4" />
                            <h2 className="text-2xl font-bold text-red-600">Thất bại</h2>
                            <p className="text-gray-600 mt-2 mb-6">{message}</p>
                            <Link
                                to="/register"
                                className="text-primary font-medium hover:underline"
                            >
                                Quay lại trang đăng ký
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default VerifyEmail;
