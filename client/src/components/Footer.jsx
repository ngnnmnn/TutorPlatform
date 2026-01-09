import React from 'react';
import { BookOpen, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-primary p-2 rounded-lg">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl text-dark">TutorPlatform</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Empowering students to achieve their academic goals through personalized tutoring and cutting-edge resources.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-dark mb-4">Platform</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><a href="#" className="hover:text-primary transition-colors">Find Tutors</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">How it Works</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-dark mb-4">Resources</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><a href="#" className="hover:text-primary transition-colors">Blog & Tips</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Exam Scores</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Community</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-dark mb-4">Connect</h3>
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
                        <p className="text-sm text-gray-500">Contact us at <br /> <span className="text-dark font-medium">support@tutorplatform.com</span></p>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">© 2026 TutorPlatform. All rights reserved.</p>
                    <div className="flex gap-6 text-sm text-gray-500">
                        <a href="#" className="hover:text-dark">Privacy Policy</a>
                        <a href="#" className="hover:text-dark">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
