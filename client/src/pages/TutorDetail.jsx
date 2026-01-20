import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Star, MapPin, Award, BookOpen, Clock, Calendar, Shield, CheckCircle, X, Video, MessageSquare, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BookingModal from '../components/BookingModal';
import { Star, MapPin, Award, BookOpen, Clock, Calendar, Shield, CheckCircle } from 'lucide-react';
import { API_URL } from '../config';

const TutorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tutor, setTutor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    // Schedule state for Tutor Detail view
    const [availability, setAvailability] = useState([]);
    const [bookings, setBookings] = useState([]); // Booked slots
    const [timeSlots, setTimeSlots] = useState([]);
    const [weekStart, setWeekStart] = useState(new Date());

    // Booking Modal State
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        date: '',
        slotId: '',
        subject: '',
        learningMode: 'online',
        location: '',
        note: ''
    });
    const [availableSlots, setAvailableSlots] = useState([]); // For the modal dropdown
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState('');

    useEffect(() => {
        const fetchTutor = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/tutors/${id}`);
                setTutor(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching tutor details:", error);
                setLoading(false);
            }
        };

        const fetchSchedule = async () => {
            try {
                // Get slots
                const slotsRes = await axios.get('http://localhost:5000/api/schedule/time-slots');
                setTimeSlots(slotsRes.data);

                // Get availability (Weekly view)
                const avaiRes = await axios.get(`http://localhost:5000/api/schedule/tutor/${id}`);
                setAvailability(avaiRes.data);

                // Get bookings
                const bookingsRes = await axios.get(`http://localhost:5000/api/schedule/tutor/${id}/bookings`);
                setBookings(bookingsRes.data);

            } catch (error) {
                console.error("Error fetching schedule:", error);
            }
        };

        fetchTutor();
        fetchSchedule();
    }, [id]);

    // Modal: Reset when opens
    useEffect(() => {
        if (isBookingOpen) {
            setStep(1);
            setFormData({
                date: '',
                slotId: '',
                subject: '',
                learningMode: 'online',
                location: '',
                note: ''
            });
            setAvailableSlots([]);
            setBookingError('');
        }
    }, [isBookingOpen]);

    // Modal: Fetch availability on date change
    useEffect(() => {
        const fetchDailyAvailability = async () => {
            if (!formData.date || !tutor) return;

            setLoadingSlots(true);
            try {
                const start = new Date(formData.date);
                start.setHours(0, 0, 0, 0);
                const end = new Date(formData.date);
                end.setHours(23, 59, 59, 999);

                const res = await axios.get(`http://localhost:5000/api/schedule/tutor/${tutor._id}`, {
                    params: {
                        start: start.toISOString(),
                        end: end.toISOString()
                    }
                });

                setAvailableSlots(res.data);
            } catch (err) {
                console.error("Error fetching daily availability:", err);
            } finally {
                setLoadingSlots(false);
            }
        };
        fetchDailyAvailability();
    }, [formData.date, tutor]);

    const getHourlyRate = () => {
        if (!tutor) return 0;
        const count = tutor.bookingCount || 0;
        return count > 50 ? 200000 : 150000;
    };

    const hourlyRate = getHourlyRate();
    const days = getDaysArray();

    function getDaysArray() {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            days.push(date);
        }
        return days;
    }

    const isSlotAvailable = (date, slotId, slotFrom, slotTo) => {
        // 1. Must be in availability
        const isFree = availability.some(av => {
            const avDate = new Date(av.avai_date);
            const targetDate = new Date(date);
            return avDate.getDate() === targetDate.getDate() &&
                avDate.getMonth() === targetDate.getMonth() &&
                avDate.getFullYear() === targetDate.getFullYear() &&
                (av.timeSchId._id === slotId || av.timeSchId === slotId);
        });

        if (!isFree) return 'unavailable';

        // 2. Must NOT be booked (approved)
        const isBooked = bookings.some(b => {
            const bDate = new Date(b.date);
            const targetDate = new Date(date);
            // Compare date
            const sameDate = bDate.getDate() === targetDate.getDate() &&
                bDate.getMonth() === targetDate.getMonth() &&
                bDate.getFullYear() === targetDate.getFullYear();

            // Compare time (assuming exact match for now)
            // Booking has string "HH:mm", slot has "HH:mm"
            const sameTime = b.startTime === slotFrom;

            return sameDate && sameTime;
        });

        if (isBooked) return 'booked';
        return 'available';
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();

        if (!formData.date || !formData.slotId || !formData.subject) {
            setBookingError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (formData.learningMode === 'offline' && !formData.location) {
            setBookingError('Vui lòng nhập địa điểm học');
            return;
        }

        setBookingLoading(true);
        setBookingError('');

        const token = localStorage.getItem('token');

        if (!token) {
            setBookingError('Vui lòng đăng nhập để đặt lịch.');
            setBookingLoading(false);
            return;
        }

        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const selectedSlot = availableSlots.find(s => s.timeSchId._id === formData.slotId);
            if (!selectedSlot) throw new Error("Invalid slot");

            const res = await axios.post('http://localhost:5000/api/bookings', {
                tutorId: tutor._id,
                subject: formData.subject,
                date: formData.date,
                startTime: selectedSlot.timeSchId.from,
                endTime: selectedSlot.timeSchId.to,
                learningMode: formData.learningMode,
                location: formData.location,
                note: formData.note
            }, config);

            // Redirect to Payment page
            navigate(`/payment/${res.data._id}`);

        } catch (err) {
            console.error("Booking error:", err);
            setBookingError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-light">
                <Navbar />
                <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!tutor) {
        return (
            <div className="min-h-screen bg-light">
                <Navbar />
                <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold text-dark">Không tìm thấy gia sư</h2>
                    <Link to="/tutors" className="text-primary mt-4 inline-block">Quay lại danh sách</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Avatar */}
                        <div className="w-32 h-32 rounded-2xl bg-indigo-100 flex items-center justify-center shadow-inner overflow-hidden relative">
                            {tutor.img ? (
                                <img
                                    src={tutor.img}
                                    alt={tutor.full_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-5xl font-bold text-primary">
                                    {tutor.full_name?.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <div>
                                    <h1 className="text-4xl font-bold text-dark mb-2">{tutor.full_name}</h1>
                                    <p className="text-lg text-gray-600 flex items-center gap-2 mb-3">
                                        <Award className="w-5 h-5 text-primary" />
                                        {tutor.university}
                                    </p>

                                    <div className="flex items-center gap-2 mb-2 text-gray-700 font-medium">
                                        <BookOpen className="w-5 h-5 text-primary" />
                                        <span>Các môn giảng dạy:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {tutor.subjects?.filter(Boolean).map((sub, i) => (
                                            <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">
                                                {sub}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-primary">
                                        {hourlyRate.toLocaleString('vi-VN')} <span className="text-base font-normal text-gray-500">VNĐ/buổi</span>
                                    </p>
                                    {tutor.bookingCount !== undefined && (
                                        <p className="text-sm text-gray-400 mt-1">
                                            {tutor.bookingCount} lượt booking
                                        </p>
                                    )}
                                    <div className="flex items-center justify-end gap-1 mt-1 text-yellow-500 font-bold">
                                        <Star className="w-5 h-5 fill-current" />
                                        {tutor.rating || 5.0} <span className="text-gray-400 font-normal">({tutor.numReviews || 0} đánh giá)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content (Left) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About */}
                        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
                                <BookOpen className="w-6 h-6 text-primary" />
                                Giới Thiệu
                            </h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                {tutor.intro}
                            </p>
                        </section>

                        {/* Schedule Grid */}
                        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-dark mb-6 flex items-center gap-2"><Calendar className="w-6 h-6 text-primary" />Lịch Trống Dự Kiến (7 ngày tới)</h2>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[600px]">
                                    <thead>
                                        <tr>
                                            <th className="p-2 border-b text-left text-xs font-semibold text-gray-500">Giờ</th>
                                            {days.map((d, i) => (
                                                <th key={i} className="p-2 border-b text-center min-w-[80px]">
                                                    <div className="text-xs text-gray-500 uppercase">{d.toLocaleDateString('vi', { weekday: 'short' })}</div>
                                                    <div className="text-sm font-bold">{d.getDate()}/{d.getMonth() + 1}</div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {timeSlots.map(slot => (
                                            <tr key={slot._id} className="border-b last:border-0">
                                                <td className="p-2 text-xs font-medium text-gray-600 whitespace-nowrap">{slot.from} - {slot.to}</td>
                                                {days.map((d, i) => {
                                                    const status = isSlotAvailable(d, slot._id, slot.from, slot.to);
                                                    return (
                                                        <td key={i} className="p-2 text-center">
                                                            {status === 'available' ? (
                                                                <div className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">
                                                                    Rảnh
                                                                </div>
                                                            ) : status === 'booked' ? (
                                                                <span className="text-gray-300">Đã được book</span>
                                                            ) : (
                                                                <span className="text-gray-300">-</span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Exam Scores Section */}
                        {tutor.scores && (
                            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
                                    <Award className="w-6 h-6 text-primary" />
                                    Điểm Thi Đại Học
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Toán</p>
                                        <p className="text-2xl font-bold text-primary">{tutor.scores.math}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Văn</p>
                                        <p className="text-2xl font-bold text-primary">{tutor.scores.literature}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Hóa</p>
                                        <p className="text-2xl font-bold text-primary">{tutor.scores.chemistry}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Lý</p>
                                        <p className="text-2xl font-bold text-primary">{tutor.scores.physic}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Anh</p>
                                        <p className="text-2xl font-bold text-primary">{tutor.scores.english}</p>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Education & Certificates */}
                        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
                                <Award className="w-6 h-6 text-primary" />
                                Chứng Chỉ & Thành Tựu
                            </h2>

                            <div className="space-y-6">
                                {/* Education Info */}
                                {tutor.education?.school && (
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                                                <Award className="w-6 h-6 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-dark">
                                                    {tutor.education.school}
                                                </h3>
                                                <p className="text-gray-600">
                                                    {tutor.education.degree}
                                                </p>
                                            </div>
                                        </div>

                                    </div>
                                )}

                                {/* Certificates */}
                                {tutor.certificates && tutor.certificates.length > 0 ? (
                                    tutor.certificates.map((cert, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0">
                                                <Award className="w-6 h-6 text-yellow-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-dark">{cert}</h3>
                                                <p className="text-gray-600">
                                                    Chứng chỉ xác thực
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0">
                                            <Star className="w-6 h-6 text-yellow-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-dark">
                                                Chứng chỉ Sư phạm
                                            </h3>
                                            <p className="text-gray-600">
                                                Đã qua kiểm duyệt năng lực bởi TutorPlatform
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Evidence Images */}
                        {tutor.evidenceImages && tutor.evidenceImages.length > 0 && (
                            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
                                    <CheckCircle className="w-6 h-6 text-primary" />
                                    Minh chứng bằng cấp
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {tutor.evidenceImages.map((img, index) => (
                                        <a
                                            key={index}
                                            href={img}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="aspect-video rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all"
                                        >
                                            <img
                                                src={img}
                                                alt={`Evidence ${index + 1}`}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                                            />
                                        </a>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Reviews Mock */}
                        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
                                <Shield className="w-6 h-6 text-primary" />
                                Đánh Giá Từ Học Viên
                            </h2>
                            <div className="space-y-6">
                                {[1, 2].map((i) => (
                                    <div key={i} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                                            <div>
                                                <p className="font-bold text-dark text-sm">Học viên ẩn danh</p>
                                                <div className="flex text-yellow-400 text-xs">
                                                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                                                </div>
                                            </div>
                                            <span className="ml-auto text-xs text-gray-400">2 ngày trước</span>
                                        </div>
                                        <p className="text-gray-600 text-sm">
                                            "Thầy dạy rất dễ hiểu, nhiệt tình. Nhờ thầy mà mình đã cải thiện điểm số đáng kể."
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar (Right) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-primary/10 sticky top-24">
                            <h3 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                Đặt Lịch Học
                            </h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Học 1 kèm 1 trực tuyến/offline</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Tài liệu học tập miễn phí</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Cam kết cải thiện điểm số</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsBookingOpen(true)}
                                className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/30 hover:shadow-2xl hover:-translate-y-1 transition-all"
                            >
                                Đặt Lịch Ngay
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal Integrated */}
            <AnimatePresence>
                {isBookingOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsBookingOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <button
                                onClick={() => setIsBookingOpen(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>

                            {step === 1 ? (
                                <div className="p-8">
                                    <h2 className="text-2xl font-bold text-dark mb-2">Đặt lịch học</h2>
                                    <p className="text-gray-600 mb-6">
                                        Đăng ký học với gia sư <span className="font-semibold text-primary">{tutor.full_name}</span>
                                    </p>

                                    {bookingError && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                                            {bookingError}
                                        </div>
                                    )}

                                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                                        {/* Subject Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Môn học <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <select
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                                                    value={formData.subject}
                                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                >
                                                    <option value="">Chọn môn học</option>
                                                    {tutor.subjects?.map((sub, idx) => (
                                                        <option key={idx} value={sub}>{sub}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Ngày học <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="date"
                                                    required
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                    value={formData.date}
                                                    onChange={(e) => setFormData({ ...formData, date: e.target.value, slotId: '' })}
                                                />
                                            </div>
                                        </div>

                                        {/* Slot Selection (Available Times) */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Giờ học (Các khung giờ rảnh) <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <select
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none disabled:bg-gray-100"
                                                    value={formData.slotId}
                                                    onChange={(e) => setFormData({ ...formData, slotId: e.target.value })}
                                                    disabled={!formData.date || loadingSlots}
                                                >
                                                    <option value="">
                                                        {loadingSlots ? "Đang tải lịch..." :
                                                            !formData.date ? "Vui lòng chọn ngày trước" :
                                                                availableSlots.length === 0 ? "Không có lịch rảnh ngày này" : "Chọn khung giờ"}
                                                    </option>
                                                    {availableSlots.map((slot) => (
                                                        <option key={slot.timeSchId._id} value={slot.timeSchId._id}>
                                                            {slot.timeSchId.from} - {slot.timeSchId.to}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Note */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Ghi chú cho gia sư
                                            </label>
                                            <div className="relative">
                                                <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                <textarea
                                                    placeholder="Bạn muốn học hay ôn tập phần nào?"
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all h-24 resize-none"
                                                    value={formData.note}
                                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Summary */}
                                        <div className="pt-4 border-t border-gray-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="text-sm text-gray-500">
                                                    <p>Học phí mỗi buổi:</p>
                                                </div>
                                                <p className="font-bold text-primary text-2xl">
                                                    {hourlyRate.toLocaleString('vi-VN')} đ
                                                </p>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={bookingLoading}
                                                className={`w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 ${bookingLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            >
                                                {bookingLoading ? (
                                                    <>
                                                        <Loader className="w-5 h-5 animate-spin" />
                                                        Đang xử lý...
                                                    </>
                                                ) : (
                                                    'Đặt lịch ngay'
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-dark mb-2">Đặt lịch thành công!</h2>
                                    <p className="text-gray-600 mb-4">
                                        Yêu cầu đặt lịch của bạn đã được gửi đến gia sư <span className="font-semibold text-dark">{tutor.full_name}</span>.
                                    </p>
                                    <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
                                        <h4 className="font-semibold text-blue-800 mb-2">Các bước tiếp theo:</h4>
                                        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                                            <li>Gia sư sẽ xác nhận lịch dạy</li>
                                            <li>Admin sẽ duyệt và cung cấp link Meet (nếu học online)</li>
                                            <li>Bạn sẽ nhận được thông báo khi lịch được duyệt</li>
                                        </ol>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setIsBookingOpen(false)}
                                            className="flex-1 py-3 bg-gray-100 text-dark font-medium rounded-xl hover:bg-gray-200 transition-all"
                                        >
                                            Đóng
                                        </button>
                                        <button
                                            onClick={() => window.location.href = '/my-bookings'}
                                            className="flex-1 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all"
                                        >
                                            Xem lịch học
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <Footer />
        </div>
    );
};

export default TutorDetail;
