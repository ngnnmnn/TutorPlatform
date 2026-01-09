import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';

const Home = () => {
    return (
        <div className="min-h-screen bg-light">
            <Navbar />
            <Hero />
            <main>
                {/* Placeholder for Featured Tutors Section */}
                <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-dark mb-4">Meet Our Top Tutors</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Browse through our highly qualified tutors ready to help you excel in your studies.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="h-48 bg-gray-200 rounded-xl mb-4 animate-pulse"></div>
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-12">
                        <button className="px-6 py-3 border border-primary text-primary font-semibold rounded-full hover:bg-primary hover:text-white transition-colors">
                            View All Tutors
                        </button>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Home;
