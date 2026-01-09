import React, { useState } from 'react';
import axios from 'axios';
import { X, Calendar, Clock, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BookingModal = ({ isOpen, onClose, tutorName, hourlyRate, tutorId }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        note: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        console.log("Submitting booking...", { tutorId, formData });

        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (!user || !token) {
            console.error("No user or token found");
            setError('Vui lòng đăng nhập để đặt lịch.');
            setLoading(false);
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            const response = await axios.post('http://localhost:5000/api/bookings', {
                tutorId,
                date: formData.date,
                timeSlot: formData.time,
                note: formData.note
            }, config);

            console.log("Booking success:", response.data);
            setStep(2);
        } catch (err) {
            console.error("Booking error:", err);
            console.error("Error response:", err.response);
            setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const resetAndClose = () => {
        setStep(1);
        setFormData({ date: '', time: '', note: '' });
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
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>

                    {step === 1 ? (
                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-dark mb-2">Đặt lịch học</h2>
                            <p className="text-gray-600 mb-6">Đăng ký học với gia sư <span className="font-semibold text-primary">{tutorName}</span></p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày học</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="date"
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Giờ học</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <select
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        >
                                            <option value="">Chọn khung giờ</option>
                                            <option value="08:00 - 10:00">08:00 - 10:00</option>
                                            <option value="14:00 - 16:00">14:00 - 16:00</option>
                                            <option value="19:00 - 21:00">19:00 - 21:00</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú cho gia sư</label>
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

                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <div className="text-sm">
                                        <p className="text-gray-500">Học phí ước tính:</p>
                                        <p className="font-bold text-primary text-lg">{hourlyRate?.toLocaleString('vi-VN')} đ<span className="text-xs font-normal text-gray-400">/2h</span></p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {loading ? 'Đang xử lý...' : 'Xác nhận'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-dark mb-2">Đăng ký thành công!</h2>
                            <p className="text-gray-600 mb-8">
                                Gia sư <span className="font-semibold text-dark">{tutorName}</span> sẽ liên hệ với bạn qua số điện thoại để xác nhận lịch học trong vòng 24h.
                            </p>
                            <button
                                onClick={resetAndClose}
                                className="w-full py-3 bg-gray-100 text-dark font-bold rounded-xl hover:bg-gray-200 transition-all"
                            >
                                Đóng
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BookingModal;
