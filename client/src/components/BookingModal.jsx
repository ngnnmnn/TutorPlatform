import React, { useState } from 'react';
import axios from 'axios';
import { X, Calendar, Clock, MessageSquare, CheckCircle, BookOpen, Video, MapPin, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BookingModal = ({ isOpen, onClose, tutorName, hourlyRate, tutorId, tutorSubjects = [] }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        subject: '',
        learningMode: 'online',
        location: '',
        note: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const timeOptions = [
        '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
        '19:00', '20:00', '21:00'
    ];

    const subjects = tutorSubjects.length > 0 ? tutorSubjects : ['Toán', 'Vật lý', 'Hóa học', 'Tiếng Anh', 'Sinh học', 'Văn'];

    const calculatePrice = () => {
        if (!formData.startTime || !formData.endTime) return 0;
        const startHour = parseInt(formData.startTime.split(':')[0]);
        const endHour = parseInt(formData.endTime.split(':')[0]);
        const hours = endHour - startHour;
        return hours > 0 ? hours * hourlyRate : 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate
        if (!formData.date || !formData.startTime || !formData.endTime || !formData.subject) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        const startHour = parseInt(formData.startTime.split(':')[0]);
        const endHour = parseInt(formData.endTime.split(':')[0]);
        if (endHour <= startHour) {
            setError('Giờ kết thúc phải sau giờ bắt đầu');
            return;
        }

        if (formData.learningMode === 'offline' && !formData.location) {
            setError('Vui lòng nhập địa điểm học');
            return;
        }

        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');

        if (!token) {
            setError('Vui lòng đăng nhập để đặt lịch.');
            setLoading(false);
            return;
        }

        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            await axios.post('http://localhost:5000/api/bookings', {
                tutorId,
                subject: formData.subject,
                date: formData.date,
                startTime: formData.startTime,
                endTime: formData.endTime,
                learningMode: formData.learningMode,
                location: formData.location,
                note: formData.note
            }, config);

            setStep(2);
        } catch (err) {
            console.error("Booking error:", err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const resetAndClose = () => {
        setStep(1);
        setFormData({
            date: '',
            startTime: '',
            endTime: '',
            subject: '',
            learningMode: 'online',
            location: '',
            note: ''
        });
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={resetAndClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                >
                    <button
                        onClick={resetAndClose}
                        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>

                    {step === 1 ? (
                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-dark mb-2">Đặt lịch học</h2>
                            <p className="text-gray-600 mb-6">
                                Đăng ký học với gia sư <span className="font-semibold text-primary">{tutorName}</span>
                            </p>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
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
                                            {subjects.map((sub, idx) => (
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
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Time Selection */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Giờ bắt đầu <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <select
                                                required
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                                                value={formData.startTime}
                                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                            >
                                                <option value="">Chọn giờ</option>
                                                {timeOptions.map((time) => (
                                                    <option key={time} value={time}>{time}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Giờ kết thúc <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <select
                                                required
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                                                value={formData.endTime}
                                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                            >
                                                <option value="">Chọn giờ</option>
                                                {timeOptions.map((time) => (
                                                    <option key={time} value={time}>{time}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Learning Mode */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hình thức học
                                    </label>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, learningMode: 'online', location: '' })}
                                            className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${formData.learningMode === 'online'
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                }`}
                                        >
                                            <Video className="w-5 h-5" />
                                            <span className="font-medium">Online</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, learningMode: 'offline' })}
                                            className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${formData.learningMode === 'offline'
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                }`}
                                        >
                                            <MapPin className="w-5 h-5" />
                                            <span className="font-medium">Offline</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Location (for offline) */}
                                {formData.learningMode === 'offline' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Địa điểm học <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Nhập địa chỉ học"
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

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
                                            <p>Học phí ước tính:</p>
                                            {formData.startTime && formData.endTime && (
                                                <p className="text-xs text-gray-400">
                                                    ({parseInt(formData.endTime) - parseInt(formData.startTime)} giờ x {hourlyRate?.toLocaleString('vi-VN')}đ)
                                                </p>
                                            )}
                                        </div>
                                        <p className="font-bold text-primary text-2xl">
                                            {calculatePrice().toLocaleString('vi-VN')} đ
                                        </p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {loading ? (
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
                                Yêu cầu đặt lịch của bạn đã được gửi đến gia sư <span className="font-semibold text-dark">{tutorName}</span>.
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
                                    onClick={resetAndClose}
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
        </AnimatePresence>
    );
};

export default BookingModal;
