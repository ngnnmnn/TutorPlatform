import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
    Calendar, Clock, User, BookOpen, Video, MapPin,
    Check, X, AlertCircle, Loader, MessageSquare, Link as LinkIcon,
    Filter, ChevronDown
} from 'lucide-react';
import { API_URL } from '../config';

const statusConfig = {
    pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
    tutor_confirmed: { label: 'Đã xác nhận - Chờ duyệt', color: 'bg-blue-100 text-blue-700', icon: Clock },
    approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700', icon: Check },
    rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-700', icon: X },
    cancelled: { label: 'Đã hủy', color: 'bg-gray-100 text-gray-700', icon: X },
    completed: { label: 'Hoàn thành', color: 'bg-primary/10 text-primary', icon: Check },
};

const MyBookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [actionLoading, setActionLoading] = useState(null);
    const [confirmModal, setConfirmModal] = useState(null);
    const [meetLink, setMeetLink] = useState('');
    const [tutorNote, setTutorNote] = useState('');

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const isTutor = userData.role === 'tutor';

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${API_URL}/api/bookings/my`, config);
            setBookings(res.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTutorConfirm = async (bookingId, confirmed) => {
        setActionLoading(bookingId);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API_URL}/api/bookings/${bookingId}/tutor-confirm`, {
                confirmed,
                tutorNote,
                meetLink
            }, config);
            fetchBookings();
            setConfirmModal(null);
            setMeetLink('');
            setTutorNote('');
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancel = async (bookingId) => {
        if (!window.confirm('Bạn có chắc muốn hủy lịch học này?')) return;

        setActionLoading(bookingId);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API_URL}/api/bookings/${bookingId}/cancel`, {}, config);
            fetchBookings();
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredBookings = bookings.filter(b =>
        filterStatus === 'all' || b.status === filterStatus
    );

    const getBookingColor = (subject) => {
        const colors = {
            'Toán': 'border-l-blue-500',
            'Vật lý': 'border-l-purple-500',
            'Hóa học': 'border-l-green-500',
            'Tiếng Anh': 'border-l-pink-500',
            'Sinh học': 'border-l-orange-500',
            'Văn': 'border-l-indigo-500',
        };
        return colors[subject] || 'border-l-primary';
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-dark flex items-center gap-2">
                            <BookOpen className="w-7 h-7 text-primary" />
                            {isTutor ? 'Quản lý lịch dạy' : 'Lịch học của tôi'}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {isTutor ? 'Xem và xác nhận các yêu cầu đặt lịch' : 'Theo dõi các buổi học đã đăng ký'}
                        </p>
                    </div>

                    {/* Filter */}
                    <div className="flex items-center gap-3">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="pending">Chờ xác nhận</option>
                            <option value="tutor_confirmed">Chờ admin duyệt</option>
                            <option value="approved">Đã duyệt</option>
                            <option value="rejected">Từ chối</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="text-2xl font-bold text-dark">{bookings.length}</div>
                        <div className="text-sm text-gray-500">Tổng số</div>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                        <div className="text-2xl font-bold text-yellow-700">
                            {bookings.filter(b => b.status === 'pending').length}
                        </div>
                        <div className="text-sm text-yellow-600">Chờ xác nhận</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                        <div className="text-2xl font-bold text-green-700">
                            {bookings.filter(b => b.status === 'approved').length}
                        </div>
                        <div className="text-sm text-green-600">Đã duyệt</div>
                    </div>
                    <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                        <div className="text-2xl font-bold text-primary">
                            {bookings.filter(b => b.status === 'completed').length}
                        </div>
                        <div className="text-sm text-primary/70">Hoàn thành</div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-700 mb-2">Không có lịch học nào</h3>
                        <p className="text-gray-500">
                            {filterStatus !== 'all'
                                ? 'Không có lịch học nào với trạng thái này'
                                : isTutor
                                    ? 'Bạn chưa có yêu cầu đặt lịch nào'
                                    : 'Bạn chưa đặt lịch học nào. Hãy tìm gia sư và đặt lịch!'}
                        </p>
                        {!isTutor && filterStatus === 'all' && (
                            <button
                                onClick={() => navigate('/tutors')}
                                className="mt-6 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
                            >
                                Tìm gia sư
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredBookings.map((booking) => {
                            const StatusIcon = statusConfig[booking.status]?.icon || AlertCircle;
                            return (
                                <div
                                    key={booking._id}
                                    className={`bg-white rounded-xl shadow-sm border-l-4 ${getBookingColor(booking.subject)} border border-gray-100 overflow-hidden`}
                                >
                                    <div className="p-5">
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                            {/* Date & Time */}
                                            <div className="flex items-center gap-4 min-w-[200px]">
                                                <div className="bg-gray-50 rounded-xl p-3 text-center min-w-[70px]">
                                                    <div className="text-2xl font-bold text-dark">
                                                        {new Date(booking.date).getDate()}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Tháng {new Date(booking.date).getMonth() + 1}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Clock className="w-4 h-4" />
                                                        <span className="font-medium">
                                                            {booking.startTime} - {booking.endTime}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {booking.learningMode === 'online' ? (
                                                            <span className="flex items-center gap-1 text-blue-600 text-sm">
                                                                <Video className="w-3 h-3" /> Online
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 text-green-600 text-sm">
                                                                <MapPin className="w-3 h-3" /> Offline
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Subject & Person */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                                                        {booking.subject}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig[booking.status]?.color}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusConfig[booking.status]?.label}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                        {isTutor
                                                            ? booking.student?.full_name?.charAt(0)
                                                            : booking.tutor?.full_name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-dark">
                                                            {isTutor ? booking.student?.full_name : booking.tutor?.full_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {isTutor ? booking.student?.email : booking.tutor?.email}
                                                        </div>
                                                    </div>
                                                </div>

                                                {booking.note && (
                                                    <div className="mt-2 flex items-start gap-2 text-sm text-gray-500">
                                                        <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                        <span>{booking.note}</span>
                                                    </div>
                                                )}

                                                {booking.meetLink && booking.status === 'approved' && (
                                                    <a
                                                        href={booking.meetLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                                                    >
                                                        <Video className="w-4 h-4" />
                                                        Vào phòng học
                                                    </a>
                                                )}
                                            </div>

                                            {/* Price & Actions */}
                                            <div className="flex flex-col items-end gap-3">
                                                <div className="text-right">
                                                    <div className="text-xl font-bold text-primary">
                                                        {booking.price?.toLocaleString('vi-VN')} đ
                                                    </div>
                                                </div>

                                                {/* Tutor Actions */}
                                                {isTutor && booking.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setConfirmModal(booking)}
                                                            disabled={actionLoading === booking._id}
                                                            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center gap-1"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                            Xác nhận
                                                        </button>
                                                        <button
                                                            onClick={() => handleTutorConfirm(booking._id, false)}
                                                            disabled={actionLoading === booking._id}
                                                            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-1"
                                                        >
                                                            <X className="w-4 h-4" />
                                                            Từ chối
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Cancel Button */}
                                                {['pending', 'tutor_confirmed'].includes(booking.status) && (
                                                    <button
                                                        onClick={() => handleCancel(booking._id)}
                                                        disabled={actionLoading === booking._id}
                                                        className="text-sm text-red-500 hover:text-red-600 transition-colors"
                                                    >
                                                        Hủy lịch
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Tutor Confirm Modal */}
            {confirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setConfirmModal(null)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-dark mb-4">Xác nhận lịch dạy</h3>

                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                            <div className="text-sm text-gray-600">
                                <strong>Môn:</strong> {confirmModal.subject}
                            </div>
                            <div className="text-sm text-gray-600">
                                <strong>Ngày:</strong> {new Date(confirmModal.date).toLocaleDateString('vi-VN')}
                            </div>
                            <div className="text-sm text-gray-600">
                                <strong>Giờ:</strong> {confirmModal.startTime} - {confirmModal.endTime}
                            </div>
                            <div className="text-sm text-gray-600">
                                <strong>Học viên:</strong> {confirmModal.student?.full_name}
                            </div>
                        </div>

                        {confirmModal.learningMode === 'online' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Link Google Meet (không bắt buộc)
                                </label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="url"
                                        placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary"
                                        value={meetLink}
                                        onChange={(e) => setMeetLink(e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Admin có thể thêm link Meet khi duyệt nếu bạn không nhập
                                </p>
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ghi chú cho học viên
                            </label>
                            <textarea
                                placeholder="Chuẩn bị tài liệu, sách vở..."
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary h-20 resize-none"
                                value={tutorNote}
                                onChange={(e) => setTutorNote(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmModal(null)}
                                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => handleTutorConfirm(confirmModal._id, true)}
                                disabled={actionLoading}
                                className="flex-1 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
                            >
                                {actionLoading ? 'Đang xử lý...' : 'Xác nhận dạy'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default MyBookings;
