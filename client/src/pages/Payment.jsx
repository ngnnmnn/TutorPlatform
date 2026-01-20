import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CheckCircle, Calendar, Clock, BookOpen, CreditCard, Copy, ArrowRight, Loader, Package } from 'lucide-react';
import { API_URL } from '../config';

const Payment = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [booking, setBooking] = useState(null);
    const [combo, setCombo] = useState(location.state?.combo || null);
    const [loading, setLoading] = useState(!combo);
    const [error, setError] = useState('');

    useEffect(() => {
        if (combo) return; // If combo data passed, no need to fetch booking

        const fetchBooking = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };

                const res = await axios.get(`${API_URL}/api/bookings/${bookingId}`, config);
                setBooking(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching booking:", err);
                setError('Không tìm thấy thông tin đặt lịch.');
                setLoading(false);
            }
        };

        if (bookingId) {
            fetchBooking();
        } else if (!combo) {
            setError('Không có thông tin thanh toán.');
            setLoading(false);
        }
    }, [bookingId, navigate, combo]);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        // Could add a toast notification here
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-light">
                <Navbar />
                <div className="pt-32 pb-20 flex justify-center">
                    <Loader className="w-10 h-10 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-light">
                <Navbar />
                <div className="pt-32 pb-20 text-center px-4">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">{error}</h2>
                    <button
                        onClick={() => navigate('/tutors')}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                        Quay lại trang chủ
                    </button>
                </div>
            </div>
        );
    }

    const price = combo ? combo.price : (booking?.price || booking?.orderId?.comboID?.price || 0);
    const transferContent = combo
        ? `Mua combo ${combo.combo_name}`
        : `Thanh toan lich hoc ${booking?._id?.slice(-6)}`;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-1 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-dark">
                            {combo ? 'Xác nhận mua gói' : 'Đặt lịch thành công!'}
                        </h1>
                        <p className="text-gray-600 mt-2">Vui lòng hoàn tất thanh toán để xác nhận.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Details */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-primary/5 p-6 border-b border-primary/10">
                                <h2 className="font-bold text-dark text-lg flex items-center gap-2">
                                    {combo ? <Package className="w-5 h-5 text-primary" /> : <BookOpen className="w-5 h-5 text-primary" />}
                                    {combo ? 'Thông tin gói' : 'Thông tin buổi học'}
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                {combo ? (
                                    // Combo Details
                                    <>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Tên gói</p>
                                            <p className="font-bold text-dark text-lg">{combo.combo_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Mô tả</p>
                                            <p className="text-dark">{combo.description}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Số lượt booking</p>
                                                <p className="font-medium text-dark">{combo.slot} lượt</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Hạn sử dụng</p>
                                                <p className="font-medium text-dark">Vĩnh viễn</p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    // Booking Details
                                    <>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Gia sư</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                                    {booking.tutor?.img ? (
                                                        <img src={booking.tutor.img} alt="Tutor" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold">
                                                            {booking.tutor?.full_name?.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-dark">{booking.tutor?.full_name}</p>
                                                    <p className="text-xs text-gray-500">{booking.tutor?.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Môn học</p>
                                                <p className="font-medium text-dark">{booking.subject}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Hình thức</p>
                                                <p className="font-medium text-dark capitalize">{booking.learningMode}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Ngày học</p>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-primary" />
                                                    <span className="font-medium text-dark">
                                                        {new Date(booking.date).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Thời gian</p>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-primary" />
                                                    <span className="font-medium text-dark">
                                                        {booking.startTime} - {booking.endTime}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <p className="font-medium text-gray-600">Tổng tiền</p>
                                        <p className="text-2xl font-bold text-primary">
                                            {price?.toLocaleString('vi-VN')} đ
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-primary/5 p-6 border-b border-primary/10">
                                <h2 className="font-bold text-dark text-lg flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                    Thông tin chuyển khoản
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-center mb-6">
                                    <img
                                        src={`https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=${price}&addInfo=${encodeURIComponent(transferContent)}&accountName=TutorPlatform`}
                                        alt="VietQR"
                                        className="w-48 h-48 rounded-lg border border-gray-200 shadow-sm"
                                    />
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="text-xs text-gray-500">Ngân hàng</p>
                                            <p className="font-bold text-dark">MB Bank</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">Chủ tài khoản</p>
                                            <p className="font-bold text-dark uppercase">Tutor Platform</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg group cursor-pointer" onClick={() => handleCopy('0987654321')}>
                                        <div>
                                            <p className="text-xs text-gray-500">Số tài khoản</p>
                                            <p className="font-bold text-dark text-lg">0987654321</p>
                                        </div>
                                        <Copy className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                                    </div>

                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg group cursor-pointer" onClick={() => handleCopy(transferContent)}>
                                        <div>
                                            <p className="text-xs text-gray-500">Nội dung chuyển khoản</p>
                                            <p className="font-bold text-primary truncate max-w-[200px]">{transferContent}</p>
                                        </div>
                                        <Copy className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                                    </div>
                                </div>

                                <button
                                    onClick={async () => {
                                        if (combo) {
                                            try {
                                                const token = localStorage.getItem('token');
                                                const config = { headers: { Authorization: `Bearer ${token}` } };
                                                const res = await axios.post(`${API_URL}/api/orders`, { comboId: combo._id, price: Number(price) }, config);
                                                if (res.data.approvalStatus === 'pending') {
                                                    alert('Đã gửi yêu cầu mua combo. Vui lòng chờ Admin duyệt.');
                                                } else {
                                                    alert('Mua combo thành công!');
                                                }
                                                navigate('/combos');
                                            } catch (error) {
                                                console.error('Error creating order:', error);
                                                alert('Có lỗi xảy ra khi tạo đơn hàng.');
                                            }
                                        } else {
                                            navigate('/my-bookings');
                                        }
                                    }}
                                    className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                                >
                                    Đã thanh toán
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => navigate(combo ? '/combos' : '/my-bookings')}
                                    className="w-full mt-3 py-3 text-gray-500 font-medium hover:text-dark transition-colors"
                                >
                                    Thanh toán sau
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Payment;
