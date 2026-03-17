import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
    Calendar, Clock, User, BookOpen, Video, MapPin,
    Check, X, AlertCircle, Loader, MessageSquare, Link as LinkIcon,
    Filter, ChevronDown, CheckCircle, Star
} from 'lucide-react';
import { API_URL } from '../config';
import FeedbackForm from '../components/FeedbackForm';
import Pagination from '../components/Pagination';
import { motion, AnimatePresence } from 'framer-motion';

const statusConfig = {
    pending: { label: 'Chờ Admin duyệt', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
    tutor_confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700', icon: Clock },
    approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700', icon: Check },
    cancel_pending: { label: 'Chờ hủy', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
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
    const [feedbackModal, setFeedbackModal] = useState(null); // stores booking object
    const [cancelModal, setCancelModal] = useState(null); // stores booking object
    const [cancelReason, setCancelReason] = useState('');
    const [cancelEvidence, setCancelEvidence] = useState([]);
    const [uploadingEvidence, setUploadingEvidence] = useState(false);
    
    // Homework State
    const [homeworkModal, setHomeworkModal] = useState(null); // stores booking object for tutor/student
    const [homeworkText, setHomeworkText] = useState('');
    const [homeworkFiles, setHomeworkFiles] = useState([]);
    const [uploadingHomework, setUploadingHomework] = useState(false);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

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

    const fetchBookings = async (pageNumber = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/bookings/my`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { page: pageNumber, limit: 10 }
            });
            setBookings(res.data.bookings);
            setTotalPages(res.data.pages);
            setPage(res.data.page);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    // Removed handleTutorConfirm
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
        if (!isTutor) {
            if (!window.confirm('Bạn có chắc muốn hủy lịch học này?')) return;
        } else {
            // Tutor handled in cancel modal submission
            return;
        }

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

    const handleTutorCancelSubmit = async () => {
        if (!cancelReason.trim()) {
            return alert('Vui lòng nhập lý do hủy lịch');
        }
        if (cancelEvidence.length === 0) {
            return alert('Vui lòng tải lên ít nhất 1 hình ảnh minh chứng');
        }

        setActionLoading(cancelModal._id);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API_URL}/api/bookings/${cancelModal._id}/cancel`, {
                reason: cancelReason,
                evidence: cancelEvidence
            }, config);
            
            alert('Đã gửi yêu cầu hủy lịch. Vui lòng chờ Admin duyệt.');
            setCancelModal(null);
            setCancelReason('');
            setCancelEvidence([]);
            fetchBookings();
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setActionLoading(null);
        }
    };

    const handleEvidenceUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploadingEvidence(true);
        const token = localStorage.getItem('token');
        const uploadedUrls = [];

        for (const file of files) {
            const formData = new FormData();
            formData.append('image', file);
            try {
                const res = await axios.post(`${API_URL}/api/upload`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                uploadedUrls.push(res.data.imageUrl);
            } catch (error) {
                console.error("Upload error:", error);
                alert('Lỗi tải ảnh: ' + file.name);
            }
        }

        setCancelEvidence(prev => [...prev, ...uploadedUrls]);
        setUploadingEvidence(false);
    };

    const handleHomeworkUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploadingHomework(true);
        const token = localStorage.getItem('token');
        const uploadedUrls = [];

        for (const file of files) {
            const formData = new FormData();
            formData.append('image', file);
            try {
                // Using the existing upload endpoint. If using separate documents, adjust accordingly.
                const res = await axios.post(`${API_URL}/api/upload`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                uploadedUrls.push(res.data.imageUrl);
            } catch (error) {
                console.error("Upload error:", error);
                alert('Lỗi tải file: ' + file.name);
            }
        }

        setHomeworkFiles(prev => [...prev, ...uploadedUrls]);
        setUploadingHomework(false);
    };

    const handleTutorHomeworkSubmit = async () => {
        if (!homeworkText.trim() && homeworkFiles.length === 0) {
            return alert('Vui lòng nhập nội dung bài tập hoặc tải lên file đính kèm');
        }

        setActionLoading(homeworkModal._id);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API_URL}/api/bookings/${homeworkModal._id}/homework`, {
                homework: homeworkText,
                homeworkFiles: homeworkFiles
            }, config);
            
            alert('Đã cập nhật bài tập thành công.');
            setHomeworkModal(null);
            setHomeworkText('');
            setHomeworkFiles([]);
            fetchBookings();
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setActionLoading(null);
        }
    };

    const isClassEnded = (dateStr, endTimeStr) => {
        const now = new Date();
        const bookingDate = new Date(dateStr);
        const [hours, minutes] = endTimeStr.split(':').map(Number);

        bookingDate.setHours(hours, minutes || 0, 0, 0);

        return now > bookingDate;
    };

    const handleComplete = async (bookingId) => {
        if (!window.confirm('Xác nhận buổi học đã hoàn thành? Admin sẽ nhận được thông báo này.')) return;

        setActionLoading(bookingId);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API_URL}/api/bookings/${bookingId}/complete`, {}, config);
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
                        {isTutor && (
                            <button
                                onClick={() => navigate('/schedule/update')}
                                className="px-4 py-2 bg-white text-primary border border-primary rounded-xl font-medium hover:bg-primary/5 transition-colors flex items-center gap-2"
                            >
                                <Calendar className="w-4 h-4" />
                                <span className="hidden sm:inline">Cập nhật lịch rảnh</span>
                            </button>
                        )}
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="bg-transparent outline-none text-sm font-medium text-gray-700 min-w-[120px]"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="pending">Chờ xác nhận</option>
                                <option value="tutor_confirmed">Chờ admin duyệt</option>
                                <option value="approved">Đã duyệt</option>
                                <option value="cancel_pending">Chờ hủy</option>
                                <option value="rejected">Từ chối</option>
                                <option value="completed">Hoàn thành</option>
                            </select>
                        </div>
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
                                                        {(booking.price || booking.orderId?.comboID?.price)?.toLocaleString('vi-VN')} đ
                                                    </div>
                                                </div>

                                                {/* Tutor Actions */}
                                                {isTutor && booking.status === 'approved' && isClassEnded(booking.date, booking.endTime) && (
                                                    <button
                                                        onClick={() => handleComplete(booking._id)}
                                                        disabled={actionLoading === booking._id}
                                                        className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 mb-2"
                                                    >
                                                        {actionLoading === booking._id ? (
                                                            <Loader className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <CheckCircle className="w-4 h-4" />
                                                        )}
                                                        Hoàn thành
                                                    </button>
                                                )}

                                                {/* Homework Actions */}
                                                {['approved', 'completed'].includes(booking.status) && (
                                                    <button
                                                        onClick={() => {
                                                            setHomeworkModal(booking);
                                                            if (isTutor) {
                                                                setHomeworkText(booking.homework || '');
                                                                setHomeworkFiles(booking.homeworkFiles || []);
                                                            }
                                                        }}
                                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                                                            isTutor 
                                                                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                                                                : (!booking.homework && (!booking.homeworkFiles || booking.homeworkFiles.length === 0))
                                                                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                                        }`}
                                                        disabled={!isTutor && !booking.homework && (!booking.homeworkFiles || booking.homeworkFiles.length === 0)}
                                                    >
                                                        <BookOpen className="w-4 h-4" />
                                                        {isTutor ? 'Cập nhật bài tập' : 'Xem bài tập'}
                                                    </button>
                                                )}

                                                {/* Student Actions - Feedback */}
                                                {!isTutor && booking.status === 'completed' && (
                                                    <button
                                                        onClick={() => setFeedbackModal(booking)}
                                                        className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
                                                    >
                                                        <Star className="w-4 h-4 fill-current" />
                                                        Đánh giá
                                                    </button>
                                                )}

                                                {/* Cancel Actions */}
                                                {['pending', 'tutor_confirmed', 'approved'].includes(booking.status) && (
                                                    <button
                                                        onClick={() => {
                                                            if (isTutor) setCancelModal(booking);
                                                            else handleCancel(booking._id);
                                                        }}
                                                        disabled={actionLoading === booking._id}
                                                        className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                                                    >
                                                        {actionLoading === booking._id ? (
                                                            <Loader className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <X className="w-4 h-4" />
                                                        )}
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
                )
                }
            </div>

            {/* Feedback Modal */}
            <AnimatePresence>
                {feedbackModal && (
                    <FeedbackForm
                        booking={feedbackModal}
                        onClose={() => setFeedbackModal(null)}
                        onSuccess={() => {
                            alert('Cảm ơn bạn đã đánh giá!');
                            fetchBookings();
                        }}
                    />
                )}

                {/* Tutor Cancel Modal */}
                {cancelModal && isTutor && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6">
                            <h3 className="text-xl font-bold mb-4">Hủy lịch học</h3>
                            <div className="bg-orange-50 text-orange-700 p-3 rounded-xl text-sm mb-4 flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>Việc hủy lịch học đã được xác nhận ảnh hưởng rất lớn đến trải nghiệm học viên. Vui lòng cung cấp lý do chính đáng và hình ảnh minh chứng.</p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do hủy lịch <span className="text-red-500">*</span></label>
                                <textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="Ví dụ: Có việc bận đột xuất, vấn đề sức khỏe..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 resize-none focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh minh chứng <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                    {cancelEvidence.map((url, i) => (
                                        <div key={i} className="relative aspect-square">
                                            <img src={url} alt={`evidence-${i}`} className="w-full h-full object-cover rounded-lg border border-gray-200" />
                                            <button 
                                                onClick={() => setCancelEvidence(prev => prev.filter((_, idx) => idx !== i))}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {uploadingEvidence && (
                                        <div className="aspect-square flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                                            <Loader className="w-5 h-5 text-primary animate-spin" />
                                        </div>
                                    )}
                                </div>
                                
                                <label className="block w-full cursor-pointer text-center bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl py-3 px-4 transition-colors">
                                    <span className="text-sm font-medium text-gray-600">Thêm hình ảnh</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleEvidenceUpload}
                                        disabled={uploadingEvidence}
                                    />
                                </label>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setCancelModal(null);
                                        setCancelReason('');
                                        setCancelEvidence([]);
                                    }}
                                    className="flex-1 py-2 bg-gray-100 font-medium rounded-lg hover:bg-gray-200 text-gray-700"
                                >
                                    Đóng
                                </button>
                                <button
                                    onClick={handleTutorCancelSubmit}
                                    disabled={actionLoading === cancelModal._id || uploadingEvidence}
                                    className="flex-1 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                                >
                                    {actionLoading === cancelModal._id ? <Loader className="w-5 h-5 animate-spin" /> : 'Gửi yêu cầu'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Homework Modal */}
                {homeworkModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <BookOpen className="w-6 h-6 text-primary" />
                                {isTutor ? 'Giao Bài Tập' : 'Xem Bài Tập'}
                            </h3>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phiếu bài tập / Ghi chú</label>
                                {isTutor ? (
                                    <textarea
                                        value={homeworkText}
                                        onChange={(e) => setHomeworkText(e.target.value)}
                                        placeholder="Ví dụ: Làm bài tập trang 20, sách giáo khoa..."
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 h-32 resize-none focus:ring-2 focus:ring-primary focus:border-primary"
                                    />
                                ) : (
                                    <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[120px] text-gray-700 whitespace-pre-wrap">
                                        {homeworkModal.homework || 'Không có ghi chú.'}
                                    </div>
                                )}
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tài liệu đính kèm</label>
                                
                                {isTutor && (
                                    <div className="mb-3">
                                        <label className="inline-flex cursor-pointer bg-primary/10 text-primary hover:bg-primary/20 rounded-lg py-2 px-4 transition-colors font-medium text-sm">
                                            <span className="flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Thêm file</span>
                                            <input
                                                type="file"
                                                multiple
                                                className="hidden"
                                                onChange={handleHomeworkUpload}
                                                disabled={uploadingHomework}
                                            />
                                        </label>
                                    </div>
                                )}
                                
                                <div className="space-y-2">
                                    {isTutor ? homeworkFiles.map((url, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm truncate flex-1 flex items-center gap-2">
                                                <LinkIcon className="w-4 h-4" /> File đính kèm {i + 1}
                                            </a>
                                            <button 
                                                onClick={() => setHomeworkFiles(prev => prev.filter((_, idx) => idx !== i))}
                                                className="text-red-500 p-1 hover:bg-red-50 rounded"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )) : (homeworkModal.homeworkFiles || []).map((url, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm truncate flex-1 flex items-center gap-2">
                                                <LinkIcon className="w-4 h-4" /> Xem File đính kèm {i + 1}
                                            </a>
                                        </div>
                                    ))}

                                    {!isTutor && (!homeworkModal.homeworkFiles || homeworkModal.homeworkFiles.length === 0) && (
                                        <p className="text-sm text-gray-500 italic">Không có file đính kèm.</p>
                                    )}

                                    {uploadingHomework && (
                                        <div className="flex items-center gap-2 text-sm text-primary p-2">
                                            <Loader className="w-4 h-4 animate-spin" /> Đang tải lên...
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setHomeworkModal(null);
                                        setHomeworkText('');
                                        setHomeworkFiles([]);
                                    }}
                                    className="flex-1 py-2 bg-gray-100 font-medium rounded-lg hover:bg-gray-200 text-gray-700"
                                >
                                    Đóng
                                </button>
                                {isTutor && (
                                    <button
                                        onClick={handleTutorHomeworkSubmit}
                                        disabled={actionLoading === homeworkModal._id || uploadingHomework}
                                        className="flex-1 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
                                    >
                                        {actionLoading === homeworkModal._id ? <Loader className="w-5 h-5 animate-spin" /> : 'Lưu Bài Tập'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
};

export default MyBookings;
