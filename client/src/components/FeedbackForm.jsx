import React, { useState } from 'react';
import { Star, X, Loader, MessageSquare, Award, BookOpen, Clock, Heart } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';
import { motion, AnimatePresence } from 'framer-motion';

const FeedbackForm = ({ booking, onClose, onSuccess }) => {
    const [ratings, setRatings] = useState({
        knowledge: 5,
        teachingSkill: 5,
        attitude: 5,
        punctuality: 5
    });
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const categories = [
        { key: 'knowledge', label: 'Kiến thức chuyên môn', icon: Award },
        { key: 'teachingSkill', label: 'Kỹ năng giảng dạy', icon: BookOpen },
        { key: 'attitude', label: 'Thái độ', icon: Heart },
        { key: 'punctuality', label: 'Đúng giờ', icon: Clock },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Bạn cần đăng nhập để gửi đánh giá.');
            setLoading(false);
            return;
        }

        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            await axios.post(`${API_URL}/api/reviews`, {
                tutorId: booking.tutor._id,
                bookingId: booking._id,
                ...ratings,
                comment
            }, config);

            onSuccess();
            onClose();
        } catch (err) {
            console.error('Feedback error:', err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá.');
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (key) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRatings({ ...ratings, [key]: star })}
                        className="focus:outline-none transition-transform active:scale-125"
                    >
                        <Star
                            className={`w-6 h-6 ${star <= ratings[key] ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`}
                        />
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-dark">Đánh giá gia sư</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {categories.map((cat) => (
                            <div key={cat.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <cat.icon className="w-5 h-5 text-primary" />
                                    <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                                </div>
                                {renderStars(cat.key)}
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-primary" />
                            Nhận xét của bạn
                        </label>
                        <textarea
                            required
                            placeholder="Chia sẻ trải nghiệm của bạn về buổi học này..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all h-32 resize-none"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                    >
                        {loading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Đang gửi...
                            </>
                        ) : (
                            'Gửi đánh giá'
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default FeedbackForm;
