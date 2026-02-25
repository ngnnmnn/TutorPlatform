import React from 'react';
import { ExternalLink } from 'lucide-react';

const LinkPreviewCard = ({ linkPreview, fallbackUrl }) => {
    const url = linkPreview?.url || fallbackUrl;
    if (!url) return null;

    // If we have OG metadata, show rich preview
    if (linkPreview?.title) {
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-4 block rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all group bg-white"
                style={{ textDecoration: 'none' }}
            >
                <div className="flex flex-col sm:flex-row">
                    {linkPreview.image && (
                        <div className="sm:w-48 w-full h-32 sm:h-auto flex-shrink-0 bg-gray-100 overflow-hidden">
                            <img
                                src={linkPreview.image}
                                alt={linkPreview.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                    )}
                    <div className="flex-1 p-3 min-w-0">
                        {linkPreview.siteName && (
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
                                {linkPreview.siteName}
                            </p>
                        )}
                        <h4 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {linkPreview.title}
                        </h4>
                        {linkPreview.description && (
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                                {linkPreview.description}
                            </p>
                        )}
                        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-gray-400">
                            <ExternalLink className="w-3 h-3" />
                            <span className="truncate">{new URL(url).hostname}</span>
                        </div>
                    </div>
                </div>
            </a>
        );
    }

    // Fallback: simple clickable link
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors group"
        >
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <ExternalLink className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-blue-700 text-xs font-semibold truncate flex-1">{url}</span>
        </a>
    );
};

export default LinkPreviewCard;
