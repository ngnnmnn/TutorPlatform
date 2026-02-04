import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Shield, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
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
                        <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-4 rotate-2 hover:rotate-0 transition-transform duration-500">
                            <img
                                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                                alt="Student learning"
                                className="rounded-2xl w-full h-[500px] object-cover"
                            />

                            {/* Floating Card 1 */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute -bottom-8 -left-8 bg-white p-4 rounded-xl shadow-lg flex items-center gap-3"
                            >
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <Clock className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Thời gian học tập</p>
                                    <p className="font-bold text-dark">2.5 giờ hôm nay</p>
                                </div>
                            </motion.div>

                            {/* Floating Card 2 */}
                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 5, repeat: Infinity }}
                                className="absolute top-10 -right-10 bg-white p-4 rounded-xl shadow-xl max-w-xs"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" className="w-10 h-10 rounded-full" alt="Tutor" />
                                    <div>
                                        <p className="font-bold text-sm">Cô Mai</p>
                                        <p className="text-xs text-secondary font-medium">Gia sư Toán</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-secondary w-3/4"></div>
                                    </div>
                                    <p className="text-xs text-gray-500 text-right">Bài học hoàn thành!</p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
