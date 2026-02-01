import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, Filter, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import Pagination from '../components/Pagination';

const Tutors = () => {
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState('');
    const [subject, setSubject] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minRating, setMinRating] = useState('');
    const [minBookingCount, setMinBookingCount] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const fetchTutors = async (pageNumber = 1) => {
        setLoading(true);
        try {
            const params = { page: pageNumber, limit: 6 };
            if (search) params.keyword = search;
            if (subject) params.subject = subject;
            if (minRating) params.minRating = minRating;
            if (minBookingCount) params.minBookingCount = minBookingCount;

            const res = await axios.get(`${API_URL}/api/tutors`, { params });
            setTutors(res.data.tutors);
            setTotalResults(res.data.total);
            setTotalPages(res.data.pages);
            setPage(res.data.page);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTutors();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchTutors(1);
    };

    const handlePageChange = (newPage) => {
        fetchTutors(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Filters Sidebar */}
                    <aside className="w-full lg:w-1/4 h-fit bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-6">
                            <Filter className="w-5 h-5 text-primary" />
                            <h2 className="font-bold text-lg text-dark">Bộ Lọc</h2>
                        </div>

                        <form onSubmit={handleSearch} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Môn học</label>
                                <select
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="Toán">Toán</option>
                                    <option value="Vật lý">Vật lý</option>
                                    <option value="Hóa học">Hóa học</option>
                                    <option value="Tiếng Anh">Tiếng Anh</option>
                                    <option value="Sinh học">Sinh học</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá tối thiểu</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setMinRating(minRating === star ? '' : star)}
                                            className={`p-2 rounded-lg border transition-all ${minRating >= star
                                                ? 'bg-yellow-50 border-yellow-200 text-yellow-500'
                                                : 'bg-gray-50 border-gray-100 text-gray-300'
                                                }`}
                                        >
                                            <Star className={`w-4 h-4 ${minRating >= star ? 'fill-current' : ''}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Số lượt booking từ</label>
                                <input
                                    type="number"
                                    placeholder="Ví dụ: 10"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    value={minBookingCount}
                                    onChange={(e) => setMinBookingCount(e.target.value)}
                                />
                            </div>



                            <button
                                type="submit"
                                className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
                                style={{ display: 'block', visibility: 'visible', opacity: 1 }} // Force visibility for debug
                            >
                                Áp dụng bộ lọc
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    setSubject('');
                                    setMinPrice('');
                                    setMaxPrice('');
                                    setMinRating('');
                                    setMinBookingCount('');
                                    setTimeout(() => fetchTutors(1), 0);
                                }}
                                className="w-full py-3 bg-white text-gray-500 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
                            >
                                Xóa bộ lọc
                            </button>
                        </form>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Search Bar */}
                        <div className="mb-8">
                            <form onSubmit={handleSearch} className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo tên gia sư hoặc môn học..."
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </form>
                        </div>

                        {/* Results Grid */}
                        {loading ? (
                            <div className="grid md:grid-cols-2 gap-6">
                                {[1, 2, 3, 4].map((n) => (
                                    <div key={n} className="h-64 bg-white rounded-2xl shadow-sm animate-pulse"></div>
                                ))}
                            </div>
                        ) : (
                            <>
                                <div className="mb-4 text-gray-500 text-sm">
                                    Tìm thấy {totalResults} gia sư
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {tutors.map((tutor) => (
                                        <div key={tutor._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex gap-4">
                                                    <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-primary font-bold text-xl">
                                                        {tutor.full_name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg text-dark group-hover:text-primary transition-colors">{tutor.full_name}</h3>
                                                        <p className="text-sm text-gray-500">
                                                            {tutor.education?.degree || 'Gia sư'} tại {tutor.university || tutor.education?.school}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                    <span className="font-bold text-yellow-700 text-sm">{tutor.rating?.toFixed(1) || "0.0"}</span>
                                                </div>
                                            </div>

                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tutor.bio}</p>

                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {tutor.subjects.map((sub, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-md border border-gray-100">
                                                        {sub}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                                <div className="text-left">
                                                    <div className="text-primary font-bold text-lg">
                                                        200.000 - 280.000 VNĐ/buổi
                                                    </div>
                                                    {tutor.bookingCount !== undefined && (
                                                        <div className="text-[10px] text-gray-400">
                                                            {tutor.bookingCount} lượt booking
                                                        </div>
                                                    )}
                                                </div>
                                                <Link to={`/tutors/${tutor._id}`} className="px-4 py-2 bg-dark text-white text-sm font-medium rounded-lg hover:bg-primary transition-colors">
                                                    Xem Hồ Sơ
                                                </Link>
                                            </div>
                                        </div>
                                    ))}

                                    {tutors.length === 0 && (
                                        <div className="col-span-full text-center py-12">
                                            <p className="text-gray-500 text-lg">Không tìm thấy gia sư phù hợp.</p>
                                            <button
                                                onClick={() => {
                                                    setSearch('');
                                                    setSubject('');
                                                    setMinPrice('');
                                                    setMaxPrice('');
                                                    setTimeout(() => fetchTutors(), 0);
                                                }}
                                                className="mt-4 text-primary font-semibold hover:underline"
                                            >
                                                Xóa bộ lọc
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <Pagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Tutors;
