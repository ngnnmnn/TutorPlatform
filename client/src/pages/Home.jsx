import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import { API_URL } from '../config';

const Home = () => {
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTutors = async () => {
            try {
                // Fetch top 3 tutors for the featured section
                const res = await axios.get(`${API_URL}/api/tutors?limit=3`);

                let tutorsData = [];
                if (Array.isArray(res.data)) {
                    tutorsData = res.data;
                } else if (res.data?.data && Array.isArray(res.data.data)) {
                    tutorsData = res.data.data;
                } else if (res.data?.tutors && Array.isArray(res.data.tutors)) {
                    tutorsData = res.data.tutors;
                }

                setTutors(tutorsData.slice(0, 3));
                setLoading(false);
            } catch (error) {
                console.error("Error fetching tutors:", error);
                setLoading(false);
            }
        };

        fetchTutors();
    }, []);

    return (
        <div className="min-h-screen bg-light">
            <Navbar />
            <Hero />
            <main>
                {/* Featured Tutors Section */}
                <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-dark mb-4">Gia Sư Tiêu Biểu</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Khám phá danh sách các gia sư xuất sắc nhất, sẵn sàng đồng hành cùng bạn chinh phục tri thức.
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid md:grid-cols-3 gap-8">
                            {[1, 2, 3].map((item) => (
                                <div key={item} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="h-48 bg-gray-200 rounded-xl mb-4 animate-pulse"></div>
                                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-8">
                            {tutors.map((tutor) => (
                                <div key={tutor._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-gray-100 overflow-visible flex items-center justify-center text-2xl font-bold text-primary uppercase">
                                            {/* Avatar placeholder if no image */}
                                            {tutor.full_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-dark group-hover:text-primary transition-colors">{tutor.full_name}</h3>
                                            <p className="text-sm text-gray-500">
                                                {tutor.education?.degree || 'Gia sư'} tại {tutor.university || tutor.education?.school}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tutor.bio}</p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {tutor.subjects.slice(0, 3).map((sub, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-md">
                                                {sub}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                                            <Star className="w-4 h-4 fill-current" />
                                            {tutor.rating?.toFixed(1) || "0.0"} <span className="text-gray-400 font-normal">({tutor.numReviews || 0})</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-primary font-bold">
                                                {tutor.displayPrice?.toLocaleString('vi-VN') || tutor.hourlyRate?.toLocaleString('vi-VN')} VNĐ/buổi
                                            </div>
                                            {tutor.bookingCount !== undefined && (
                                                <div className="text-[10px] text-gray-400">
                                                    {tutor.bookingCount} lượt booking
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Link to={`/tutors/${tutor._id}`} className="mt-4 block w-full py-2 text-center border border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors text-sm">
                                        Xem Hồ Sơ
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <Link to="/tutors" className="inline-block px-8 py-3 bg-white border border-gray-200 text-dark font-semibold rounded-full hover:border-primary hover:text-primary transition-all shadow-sm hover:shadow-md">
                            Xem Tất Cả
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Home;
