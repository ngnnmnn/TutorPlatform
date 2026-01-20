import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import {
    Users,
    GraduationCap,
    ClipboardCheck,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    TrendingUp,
    Shield
} from 'lucide-react';
import { API_URL } from '../config';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // all, pending, approved, rejected, bookings
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Request Detail Modal State
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    // Booking Management State
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [meetLink, setMeetLink] = useState('');
    const [adminNote, setAdminNote] = useState('');

    // Combo Orders State
    const [orders, setOrders] = useState([]);

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }

        if (activeTab === 'bookings') {
            fetchBookings();
        } else if (activeTab === 'orders') {
            fetchOrders();
        } else {
            fetchStats();
            fetchRequests();
        }
    }, [activeTab, currentPage, navigate]);

    const getConfig = () => {
        const token = localStorage.getItem('token');
        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    };

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/stats`, getConfig());
            setStats(res.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchRequests = async () => {
        try {
            setLoading(true);
            let statusQuery = '';
            if (activeTab === 'pending') statusQuery = '&status=1';
            if (activeTab === 'approved') statusQuery = '&status=2';
            if (activeTab === 'rejected') statusQuery = '&status=3';

            const res = await axios.get(
                `${API_URL}/api/admin/tutor-requests?page=${currentPage}${statusQuery}`,
                getConfig()
            );
            setRequests(res.data.requests);
            setPagination(res.data.pagination);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/bookings/all`, getConfig());
            setBookings(res.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/orders`, getConfig());
            setOrders(res.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn duyệt yêu cầu này?')) return;

        setActionLoading(true);
        try {
            await axios.put(`${API_URL}/api/admin/tutor-requests/${id}/approve`, {}, getConfig());
            alert('Đã duyệt yêu cầu thành công!');
            setSelectedRequest(null);
            fetchRequests();
            fetchStats();
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest) return;

        setActionLoading(true);
        try {
            await axios.put(
                `${API_URL}/api/admin/tutor-requests/${selectedRequest._id}/reject`,
                { reason: rejectReason },
                getConfig()
            );
            alert('Đã từ chối yêu cầu.');
            setShowRejectModal(false);
            setRejectReason('');
            setSelectedRequest(null);
            fetchRequests();
            fetchStats();
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setActionLoading(false);
        }
    };

    const handleBookingApprove = async (bookingId, approved) => {
        if (approved && selectedBooking?.learningMode === 'online' && !meetLink) {
            alert('Vui lòng nhập Link Google Meet cho lớp học Online');
            return;
        }

        if (!window.confirm(approved ? 'Duyệt lịch học này?' : 'Từ chối lịch học này?')) return;

        setActionLoading(true);
        try {
            await axios.put(
                `${API_URL}/api/bookings/${bookingId}/admin-approve`,
                {
                    approved,
                    adminNote,
                    meetLink: approved ? meetLink : undefined
                },
                getConfig()
            );
            fetchBookings();
            setSelectedBooking(null);
            setMeetLink('');
            setAdminNote('');
            alert(approved ? 'Đã duyệt lịch học!' : 'Đã từ chối lịch học!');
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        if (status === 1) return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 flex items-center gap-1"><Clock className="w-3 h-3" /> Chờ duyệt</span>;
        if (status === 2) return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Đã duyệt</span>;
        if (status === 3) return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 flex items-center gap-1"><XCircle className="w-3 h-3" /> Từ chối</span>;
        return null;
    };

    const getBookingStatusBadge = (status) => {
        const statusConfig = {
            pending: { label: 'Chờ gia sư', color: 'bg-yellow-100 text-yellow-800' },
            tutor_confirmed: { label: 'Chờ Admin duyệt', color: 'bg-blue-100 text-blue-800' },
            approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-800' },
            rejected: { label: 'Đã hủy/Từ chối', color: 'bg-red-100 text-red-800' },
            booked: { label: 'Đã đặt', color: 'bg-purple-100 text-purple-800' },
            completed: { label: 'Hoàn thành', color: 'bg-gray-100 text-gray-800' },
            cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' }
        };
        const config = statusConfig[status] || statusConfig['pending'];
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    if (!user || user.role !== 'admin') return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-1">Quản lý hệ thống gia sư & lịch học</p>
                </div>

                {/* Stats Cards (Only Show in Requests Tab) */}
                {activeTab !== 'bookings' && activeTab !== 'orders' && stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Users className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-medium text-gray-400">Tổng quan</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.users.total}</h3>
                            <p className="text-sm text-gray-500">Người dùng hệ thống</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                                    {stats.requests.pending} Pending
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.requests.total}</h3>
                            <p className="text-sm text-gray-500">Tổng yêu cầu Gia sư</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                    <GraduationCap className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                    {stats.users.tutors} Active
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.users.tutors}</h3>
                            <p className="text-sm text-gray-500">Gia sư chính thức</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                    <Users className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                    {stats.users.students} Active
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.users.students}</h3>
                            <p className="text-sm text-gray-500">Học sinh</p>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="border-b border-gray-100">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${['all', 'pending', 'approved', 'rejected'].includes(activeTab)
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Yêu cầu gia sư
                            </button>
                            <button
                                onClick={() => setActiveTab('bookings')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'bookings'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Booking
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'orders'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Đơn hàng Combo
                            </button>
                        </nav>
                    </div>

                    {/* Sub-tabs for Tutor Requests */}
                    {activeTab !== 'bookings' && activeTab !== 'orders' && (
                        <div className="bg-gray-50 px-6 py-2 border-b border-gray-100 flex gap-4">
                            {[
                                { key: 'all', label: 'Tất cả' },
                                { key: 'pending', label: 'Chờ duyệt' },
                                { key: 'approved', label: 'Đã duyệt' },
                                { key: 'rejected', label: 'Từ chối' }
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${activeTab === tab.key
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Content Area */}
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : activeTab === 'bookings' ? (
                            /* Bookings Table */
                            bookings.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>Không có booking nào</p>
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Học viên</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gia sư</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Môn/Thời gian</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hình thức</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {bookings.map(booking => (
                                            <tr key={booking._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="ml-3">
                                                            <p className="text-sm font-medium text-gray-900">{booking.student?.full_name}</p>
                                                            <p className="text-xs text-gray-500">{booking.student?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{booking.tutor?.full_name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 font-medium">{booking.subject}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(booking.date).toLocaleDateString('vi-VN')} • {booking.startTime}-{booking.endTime}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {booking.learningMode === 'online' ? 'Online' : 'Offline'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                                                    {(booking.price || booking.orderId?.comboID?.price)?.toLocaleString('vi-VN')} đ
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getBookingStatusBadge(booking.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {['pending', 'tutor_confirmed'].includes(booking.status) && (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => setSelectedBooking(booking)}
                                                                className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg text-xs"
                                                            >
                                                                Duyệt
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (window.confirm('Từ chối lịch booking này?')) {
                                                                        handleBookingApprove(booking._id, false);
                                                                    }
                                                                }}
                                                                className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg text-xs"
                                                            >
                                                                Từ chối
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )
                        ) : activeTab === 'orders' ? (
                            /* Orders Table */
                            orders.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>Không có đơn hàng nào</p>
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người mua</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gói Combo</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đặt</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {orders.map(order => (
                                            <tr key={order._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="ml-3">
                                                            <p className="text-sm font-medium text-gray-900">{order.accountId?.full_name}</p>
                                                            <p className="text-xs text-gray-500">{order.accountId?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 font-medium">{order.comboID?.combo_name}</div>
                                                    <div className="text-xs text-gray-500">{order.comboID?.slot} slot</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                                                    {order.comboID?.price?.toLocaleString('vi-VN')} đ
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(order.createAt).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {order.approvalStatus === 'pending' && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Chờ duyệt</span>}
                                                    {order.approvalStatus === 'approved' && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> Đã duyệt</span>}
                                                    {order.approvalStatus === 'rejected' && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> Từ chối</span>}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {order.approvalStatus === 'pending' && (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleOrderApprove(order._id, 'approved')}
                                                                className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg text-xs"
                                                            >
                                                                Duyệt
                                                            </button>
                                                            <button
                                                                onClick={() => handleOrderApprove(order._id, 'rejected')}
                                                                className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg text-xs"
                                                            >
                                                                Từ chối
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )
                        ) : (
                            /* Tutor Requests Table */
                            requests.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <p>Không có yêu cầu nào</p>
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người dùng</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đại học</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điểm TB</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày gửi</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {requests.map(request => (
                                            <tr key={request._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <img
                                                            src={request.accountId?.img || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                                                            alt=""
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                        <div className="ml-3">
                                                            <p className="text-sm font-medium text-gray-900">{request.accountId?.full_name}</p>
                                                            <p className="text-xs text-gray-500">{request.accountId?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {request.university}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {((request.math_score + request.literature_score + request.chemistry_score + request.physic_score + request.english_score) / 5).toFixed(1)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(request.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setSelectedRequest(request)}
                                                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                            title="Xem chi tiết"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        {request.status === 1 && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(request._id)}
                                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                    title="Duyệt"
                                                                >
                                                                    <CheckCircle className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => { setSelectedRequest(request); setShowRejectModal(true); }}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Từ chối"
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )
                        )}
                    </div>

                    {/* Pagination (only for requests) */}
                    {activeTab !== 'bookings' && pagination && pagination.totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Trang {pagination.currentPage} / {pagination.totalPages} ({pagination.totalRequests} yêu cầu)
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    disabled={!pagination.hasMore}
                                    className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Booking Approval Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4">Duyệt lịch học</h3>
                        <div className="bg-gray-50 p-4 rounded-xl mb-4 text-sm">
                            <p><strong>Học viên:</strong> {selectedBooking.student?.full_name}</p>
                            <p><strong>Gia sư:</strong> {selectedBooking.tutor?.full_name}</p>
                            <p><strong>Môn:</strong> {selectedBooking.subject}</p>
                            <p><strong>Thời gian:</strong> {selectedBooking.startTime} - {selectedBooking.endTime}, {new Date(selectedBooking.date).toLocaleDateString('vi-VN')}</p>
                            <p><strong>Hình thức:</strong> {selectedBooking.learningMode === 'online' ? 'Online' : 'Offline'}</p>
                            {selectedBooking.learningMode === 'offline' && (
                                <p><strong>Địa điểm:</strong> {selectedBooking.location || 'Chưa cập nhật'}</p>
                            )}
                        </div>

                        {selectedBooking.learningMode === 'online' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Link Google Meet</label>
                                <input
                                    type="text"
                                    value={meetLink}
                                    onChange={(e) => setMeetLink(e.target.value)}
                                    placeholder="https://meet.google.com/..."
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (Admin)</label>
                            <input
                                type="text"
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="flex-1 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={() => handleBookingApprove(selectedBooking._id, true)}
                                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Duyệt
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Request Detail Modal */}
            {selectedRequest && !showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">Chi tiết yêu cầu</h2>
                                <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-gray-600">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* User Info */}
                            <div className="flex items-center gap-4">
                                <img
                                    src={selectedRequest.accountId?.img || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                                    alt=""
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                                <div>
                                    <h3 className="text-lg font-bold">{selectedRequest.accountId?.full_name}</h3>
                                    <p className="text-gray-500">{selectedRequest.accountId?.email}</p>
                                    <p className="text-gray-500">{selectedRequest.accountId?.phone}</p>
                                </div>
                                <div className="ml-auto">
                                    {getStatusBadge(selectedRequest.status)}
                                </div>
                            </div>

                            {/* Scores */}
                            <div>
                                <h4 className="font-semibold mb-3">Điểm thi THPT</h4>
                                <div className="grid grid-cols-5 gap-3">
                                    {[
                                        { label: 'Toán', value: selectedRequest.math_score },
                                        { label: 'Văn', value: selectedRequest.literature_score },
                                        { label: 'Hóa', value: selectedRequest.chemistry_score },
                                        { label: 'Lý', value: selectedRequest.physic_score },
                                        { label: 'Anh', value: selectedRequest.english_score }
                                    ].map(score => (
                                        <div key={score.label} className="bg-gray-50 rounded-lg p-3 text-center">
                                            <p className="text-xs text-gray-500">{score.label}</p>
                                            <p className="text-lg font-bold text-indigo-600">{score.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* University */}
                            <div>
                                <h4 className="font-semibold mb-2">Đại học</h4>
                                <p className="text-gray-700">{selectedRequest.university}</p>
                            </div>

                            {/* Subjects */}
                            {selectedRequest.subjects?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Môn học đăng ký</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedRequest.subjects.map((sub, i) => (
                                            <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">
                                                {sub.subjectID?.sub_name || 'Môn học ẩn'}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Note */}
                            {selectedRequest.Note && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2 text-sm text-gray-500">Ghi chú</h4>
                                    <p className="text-gray-700">{selectedRequest.Note}</p>
                                </div>
                            )}

                            {/* Certificates */}
                            {selectedRequest.certificates?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Chứng chỉ</h4>
                                    <ul className="list-disc list-inside text-gray-700 bg-gray-50 p-4 rounded-lg">
                                        {selectedRequest.certificates.map((cert, i) => (
                                            <li key={i}>{cert.certificate_name}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Evidence */}
                            {selectedRequest.evidence?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Minh chứng</h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        {selectedRequest.evidence.map((ev, i) => (
                                            <a key={i} href={ev.img} target="_blank" rel="noopener noreferrer">
                                                <img src={ev.img} alt={`Evidence ${i + 1}`} className="rounded-lg object-cover h-24 w-full border border-gray-200" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        {selectedRequest.status === 1 && (
                            <div className="p-6 border-t border-gray-100 flex gap-3">
                                <button
                                    onClick={() => handleApprove(selectedRequest._id)}
                                    disabled={actionLoading}
                                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Duyệt yêu cầu
                                </button>
                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    disabled={actionLoading}
                                    className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-5 h-5" />
                                    Từ chối
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full">
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">Từ chối yêu cầu</h2>
                            <p className="text-gray-600 mb-4">Vui lòng nhập lý do từ chối (tùy chọn):</p>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Lý do từ chối..."
                                className="w-full border rounded-xl p-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                        <div className="p-6 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                                className="flex-1 border py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={actionLoading}
                                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {actionLoading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
