import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-8 py-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-gray-200 hover:border-primary disabled:opacity-50 disabled:hover:border-gray-200 transition-all group"
            >
                <ChevronLeft className="w-5 h-5 text-gray-500 group-hover:text-primary" />
            </button>

            {getPageNumbers().map((page, index) => (
                <button
                    key={index}
                    onClick={() => typeof page === 'number' && onPageChange(page)}
                    disabled={page === '...' || page === currentPage}
                    className={`min-w-[40px] h-10 px-2 rounded-xl border text-sm font-bold transition-all ${page === currentPage
                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25'
                            : page === '...'
                                ? 'border-transparent text-gray-400 cursor-default'
                                : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                        }`}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-gray-200 hover:border-primary disabled:opacity-50 disabled:hover:border-gray-200 transition-all group"
            >
                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-primary" />
            </button>
        </div>
    );
};

export default Pagination;
