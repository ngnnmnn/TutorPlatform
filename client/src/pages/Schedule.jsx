import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
    Calendar, Clock, User, BookOpen, Video, MapPin,
    ChevronLeft, ChevronRight, ExternalLink, CheckCircle,
    XCircle, AlertCircle, Loader
} from 'lucide-react';

const Schedule = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [user, setUser] = useState(null);
    const [viewMode, setViewMode] = useState('week'); // week or list

    // Time slots for the schedule grid
    const timeSlots = [
        '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
        '19:00', '20:00', '21:00'
    ];

    const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const shortDayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (!token || !userData) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(userData));
        fetchSchedule();
    }, [currentWeek]);

    const getWeekDates = (date) => {
        const week = [];
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() - day);

        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            week.push(d);
        }
        return week;
    };

    const weekDates = getWeekDates(currentWeek);

    const fetchSchedule = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const startDate = weekDates[0].toISOString().split('T')[0];
            const endDate = weekDates[6].toISOString().split('T')[0];

            const res = await axios.get(
                `http://localhost:5000/api/bookings/schedule?startDate=${startDate}&endDate=${endDate}`,
                config
            );
            setBookings(res.data);
        } catch (error) {
            console.error('Error fetching schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    const prevWeek = () => {
        const newDate = new Date(currentWeek);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentWeek(newDate);
    };

    const nextWeek = () => {
        const newDate = new Date(currentWeek);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentWeek(newDate);
    };

    const goToToday = () => {
        setCurrentWeek(new Date());
    };

    const getBookingForSlot = (date, timeSlot) => {
        const dateStr = date.toISOString().split('T')[0];
        return bookings.find(b => {
            const bookingDate = new Date(b.date).toISOString().split('T')[0];
            return bookingDate === dateStr && b.startTime === timeSlot;
        });
    };

    const getBookingColor = (booking) => {
        const colors = {
            'Toán': 'bg-blue-500',
            'Vật lý': 'bg-purple-500',
            'Hóa học': 'bg-green-500',
            'Tiếng Anh': 'bg-pink-500',
            'Sinh học': 'bg-orange-500',
            'Văn': 'bg-indigo-500',
        };
        return colors[booking.subject] || 'bg-primary';
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const isTutor = userData.role === 'tutor';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-dark flex items-center gap-2">
                                <Calendar className="w-7 h-7 text-primary" />
                                Thời Khóa Biểu
                            </h1>
                            <p className="text-gray-500 mt-1">
                                {isTutor ? 'Lịch dạy của bạn' : 'Lịch học của bạn'}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* View Toggle */}
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('week')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'week' ? 'bg-white shadow text-primary' : 'text-gray-600'
                                        }`}
                                >
                                    Tuần
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white shadow text-primary' : 'text-gray-600'
                                        }`}
                                >
                                    Danh sách
                                </button>
                            </div>

                            {/* Week Navigation */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={prevWeek}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={goToToday}
                                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                                >
                                    Hôm nay
                                </button>
                                <button
                                    onClick={nextWeek}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Week Range Display */}
                    <div className="mt-4 text-center text-gray-600">
                        <span className="font-medium">
                            {weekDates[0].toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="mx-2">—</span>
                        <span className="font-medium">
                            {weekDates[6].toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : viewMode === 'week' ? (
                    /* Week View - Schedule Grid */
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="w-20 py-4 px-2 text-center text-gray-500 text-sm font-medium">
                                            Giờ
                                        </th>
                                        {weekDates.map((date, index) => (
                                            <th
                                                key={index}
                                                className={`py-4 px-2 text-center ${isToday(date) ? 'bg-primary/5' : ''}`}
                                            >
                                                <div className={`text-sm ${isToday(date) ? 'text-primary font-bold' : 'text-gray-500'}`}>
                                                    {dayNames[index]}
                                                </div>
                                                <div className={`text-lg font-bold ${isToday(date) ? 'text-primary' : 'text-dark'}`}>
                                                    {formatDate(date)}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {timeSlots.map((time, timeIndex) => (
                                        <tr key={time} className="border-b border-gray-50">
                                            <td className="py-2 px-2 text-center text-gray-400 text-sm font-medium border-r border-gray-100">
                                                {time}
                                            </td>
                                            {weekDates.map((date, dayIndex) => {
                                                const booking = getBookingForSlot(date, time);
                                                return (
                                                    <td
                                                        key={dayIndex}
                                                        className={`py-1 px-1 h-16 relative ${isToday(date) ? 'bg-primary/5' : ''}`}
                                                    >
                                                        {booking && (
                                                            <div
                                                                className={`${getBookingColor(booking)} text-white rounded-lg p-2 h-full cursor-pointer hover:opacity-90 transition-all shadow-sm`}
                                                                onClick={() => navigate(`/booking/${booking._id}`)}
                                                            >
                                                                <div className="text-xs font-bold truncate">
                                                                    {booking.subject}
                                                                </div>
                                                                <div className="text-xs opacity-90 truncate">
                                                                    {isTutor ? booking.student?.full_name : booking.tutor?.full_name}
                                                                </div>
                                                                {booking.learningMode === 'online' && (
                                                                    <Video className="w-3 h-3 absolute top-1 right-1" />
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* List View */
                    <div className="space-y-4">
                        {bookings.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-700 mb-2">Chưa có lịch học nào</h3>
                                <p className="text-gray-500">
                                    {isTutor
                                        ? 'Bạn chưa có lịch dạy nào trong tuần này'
                                        : 'Bạn chưa có lịch học nào trong tuần này. Hãy đặt lịch với gia sư!'}
                                </p>
                                {!isTutor && (
                                    <button
                                        onClick={() => navigate('/tutors')}
                                        className="mt-6 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
                                    >
                                        Tìm gia sư
                                    </button>
                                )}
                            </div>
                        ) : (
                            bookings.map((booking) => (
                                <div
                                    key={booking._id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        {/* Date Badge */}
                                        <div className={`${getBookingColor(booking)} text-white rounded-xl p-4 text-center min-w-[100px]`}>
                                            <div className="text-2xl font-bold">
                                                {new Date(booking.date).getDate()}
                                            </div>
                                            <div className="text-sm opacity-90">
                                                {shortDayNames[new Date(booking.date).getDay()]}
                                            </div>
                                            <div className="text-xs mt-1">
                                                {new Date(booking.date).toLocaleDateString('vi-VN', { month: 'short' })}
                                            </div>
                                        </div>

                                        {/* Booking Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                                    {booking.subject}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${booking.learningMode === 'online'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-green-100 text-green-700'
                                                    }`}>
                                                    {booking.learningMode === 'online' ? 'Online' : 'Offline'}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-6 text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{booking.startTime} - {booking.endTime}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4" />
                                                    <span>
                                                        {isTutor ? booking.student?.full_name : booking.tutor?.full_name}
                                                    </span>
                                                </div>
                                            </div>

                                            {booking.learningMode === 'online' && booking.meetLink && (
                                                <a
                                                    href={booking.meetLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                >
                                                    <Video className="w-4 h-4" />
                                                    Vào phòng học
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}

                                            {booking.learningMode === 'offline' && booking.location && (
                                                <div className="flex items-center gap-2 mt-3 text-gray-600">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{booking.location}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Price */}
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-primary">
                                                {booking.price?.toLocaleString('vi-VN')} đ
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {parseInt(booking.endTime) - parseInt(booking.startTime)} giờ
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Legend */}
                <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <h3 className="font-medium text-gray-700 mb-3">Chú thích màu môn học:</h3>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { name: 'Toán', color: 'bg-blue-500' },
                            { name: 'Vật lý', color: 'bg-purple-500' },
                            { name: 'Hóa học', color: 'bg-green-500' },
                            { name: 'Tiếng Anh', color: 'bg-pink-500' },
                            { name: 'Sinh học', color: 'bg-orange-500' },
                            { name: 'Văn', color: 'bg-indigo-500' },
                        ].map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded ${item.color}`}></div>
                                <span className="text-sm text-gray-600">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Schedule;
