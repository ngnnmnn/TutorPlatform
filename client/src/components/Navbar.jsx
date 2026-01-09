import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, BookOpen, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="bg-primary p-2 rounded-lg">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-xl text-dark tracking-tight">TutorPlatform</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/tutors" className="text-gray-600 hover:text-primary transition-colors font-medium">Find Tutors</Link>
                        <Link to="/feed" className="text-gray-600 hover:text-primary transition-colors font-medium">Social Feed</Link>
                        <Link to="/resources" className="text-gray-600 hover:text-primary transition-colors font-medium">Resources</Link>
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-primary font-semibold hover:text-primary/80 transition-colors">Log in</Link>
                            <Link to="/register" className="bg-primary text-white px-5 py-2 rounded-full font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
                                Sign up
                            </Link>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-dark p-2">
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            <Link to="/tutors" className="block px-3 py-2 text-gray-600 hover:text-primary font-medium rounded-md hover:bg-gray-50">Find Tutors</Link>
                            <Link to="/feed" className="block px-3 py-2 text-gray-600 hover:text-primary font-medium rounded-md hover:bg-gray-50">Social Feed</Link>
                            <Link to="/resources" className="block px-3 py-2 text-gray-600 hover:text-primary font-medium rounded-md hover:bg-gray-50">Resources</Link>
                            <div className="pt-4 flex flex-col gap-3">
                                <Link to="/login" className="w-full text-center px-4 py-2 border border-blue-100 text-primary rounded-xl font-semibold">Log in</Link>
                                <Link to="/register" className="w-full text-center px-4 py-2 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/30">Sign up</Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
