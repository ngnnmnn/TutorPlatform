import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BookingModal from '../components/BookingModal';
import { Star, MapPin, Award, BookOpen, Clock, Calendar, Shield, CheckCircle } from 'lucide-react';

const TutorDetail = () => {
    const { id } = useParams();
    const [tutor, setTutor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    useEffect(() => {
        const fetchTutor = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/tutors/${id}`);
                setTutor(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching tutor details:", error);
                setLoading(false);
            }
        };
        fetchTutor();
    }, [id]);

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
                        <div className="w-32 h-32 rounded-2xl bg-indigo-100 flex items-center justify-center text-5xl font-bold text-primary shadow-inner">
                            {tutor.full_name?.charAt(0)}
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <div>
                                    <h1 className="text-4xl font-bold text-dark mb-2">{tutor.full_name}</h1>
                                    <p className="text-lg text-gray-600 flex items-center gap-2">
                                        <Award className="w-5 h-5 text-primary" />
                                        {tutor.university}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-primary">
                                        {tutor.displayPrice?.toLocaleString('vi-VN') || tutor.hourlyRate?.toLocaleString('vi-VN')} <span className="text-base font-normal text-gray-500">VNĐ/buổi</span>
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

                            <div className="flex flex-wrap gap-3">
                                {tutor.subjects?.map((sub, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 font-medium rounded-lg text-sm border border-blue-100">
                                        {sub}
                                    </span>
                                ))}
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
                                {tutor.Note || tutor.bio}
                            </p>
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
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                                        <Award className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-dark">{tutor.university}</h3>
                                        <p className="text-gray-600">Gia sư chuyên nghiệp</p>
                                    </div>
                                </div>

                                {tutor.certificates && tutor.certificates.length > 0 ? (
                                    tutor.certificates.map((cert, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0">
                                                <Award className="w-6 h-6 text-yellow-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-dark">{cert}</h3>
                                                <p className="text-gray-600">Chứng chỉ xác thực</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0">
                                            <Star className="w-6 h-6 text-yellow-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-dark">Chứng chỉ Sư phạm</h3>
                                            <p className="text-gray-600">Đã qua kiểm duyệt năng lực bởi TutorPlatform</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

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

            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                tutorName={tutor.full_name}
                tutorId={tutor._id}
                hourlyRate={tutor.displayPrice}
            />
            <Footer />
        </div>
    );
};

export default TutorDetail;
