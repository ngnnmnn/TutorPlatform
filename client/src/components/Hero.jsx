import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, Shield, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
    const images = [
        "https://res.cloudinary.com/dwd8plkcl/image/upload/v1773770614/z7630003164406_4a99799af505c52ada91408cb13eaeb2_zyzcpt.jpg",
        "https://res.cloudinary.com/dwd8plkcl/image/upload/v1773770614/z7630003186751_8cad47ec378a6034e685f3039a0cafc3_fogyzj.jpg",
        "https://res.cloudinary.com/dwd8plkcl/image/upload/v1773770614/z7630003177853_31b8662767428759e053f41ab6fbccfa_vhcjig.jpg",
        "https://res.cloudinary.com/dwd8plkcl/image/upload/v1773770613/z7630003176143_20f3dfacfc3b41efa81d730d171639fc_ow976q.jpg",
        "https://res.cloudinary.com/dwd8plkcl/image/upload/v1773770614/z7630003165365_09808eb992149a25c32dca075af04222_qaxhs8.jpg",
        "https://res.cloudinary.com/dwd8plkcl/image/upload/v1773770614/z7630003187222_a6934bb30de8fbbdd7941bd46cd3d131_mlwlhx.jpg"
    ];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000); // Change image every 3 seconds

        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Background decorations */}
            <div className="absolute top-20 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <span className="px-3 py-1 rounded-full bg-blue-100 text-primary text-sm font-semibold tracking-wide uppercase">
                                #1 Nền tảng Gia sư
                            </span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold text-dark leading-tight mb-6">
                            Kiến tạo <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Tương lai của Bạn</span>
                        </h1>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
                            Kết nối với những gia sư hàng đầu, tiếp cận kho tài liệu phong phú và theo dõi sự tiến bộ của bạn. Học tập theo cách hoàn toàn mới.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/tutors" className="px-8 py-4 bg-primary text-white rounded-full font-bold text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                                Tìm Gia Sư Ngay <ArrowRight className="w-5 h-5" />
                            </Link>

                        </div>
                        <div className="mt-10 flex items-center gap-6 text-sm text-gray-500 font-medium">
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                <span>Đánh giá 4.9/5</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-green-500" />
                                <span>Gia sư đã xác thực</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-4 rotate-2 hover:rotate-0 transition-transform duration-500 overflow-hidden h-[500px]">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={currentImageIndex}
                                    src={images[currentImageIndex]}
                                    alt="Student learning"
                                    initial={{ opacity: 0, scale: 1.05 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.8 }}
                                    className="rounded-2xl w-full h-full object-cover absolute top-0 left-0 p-4"
                                />
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
