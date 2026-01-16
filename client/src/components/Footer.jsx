import React from 'react';
import { BookOpen, Facebook, Instagram, Twitter } from 'lucide-react';
import logo from '../assets/logo.png';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1">
                                <img src={logo} alt="TutorHub Logo" className="w-8 h-8 object-contain" />
                            </div>
                            <span className="font-bold text-xl text-dark">TutorHub</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Quyết tâm hỗ trợ học sinh đạt được mục tiêu học tập thông qua gia sư cá nhân và tài liệu chất lượng cao.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-dark mb-4">Nền Tảng</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><a href="#" className="hover:text-primary transition-colors">Tìm Gia Sư</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Hoạt Động Như Thế Nào</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Bảng Giá</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-dark mb-4">Tài Nguyên</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><a href="#" className="hover:text-primary transition-colors">Blog & Mẹo Học Tập</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Tra Cứu Điểm Thi</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Cộng Đồng</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-dark mb-4">Kết Nối</h3>
                        <div className="flex gap-4 mb-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-gray-600">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-secondary hover:text-white transition-all text-gray-600">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-blue-400 hover:text-white transition-all text-gray-600">
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>
                        <p className="text-sm text-gray-500">Liên hệ chúng tôi: <br /> <span className="text-dark font-medium">support@tutorhub.com</span></p>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">© 2026 TutorHub. Bảo lưu mọi quyền.</p>
                    <div className="flex gap-6 text-sm text-gray-500">
                        <a href="#" className="hover:text-dark">Chính Sách Bảo Mật</a>
                        <a href="#" className="hover:text-dark">Điều Khoản Dịch Vụ</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
