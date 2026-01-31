import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Heart, MessageCircle, Share2, Send, Image as ImageIcon, Video, Link as LinkIcon, Bookmark, Search, X } from 'lucide-react';
import { API_URL } from '../config';
import Pagination from '../components/Pagination';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [link, setLink] = useState('');
    const [media, setMedia] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [commentTexts, setCommentTexts] = useState({});
    const [selectedPost, setSelectedPost] = useState(null); // Managed for Modal
    const [activeTab, setActiveTab] = useState('all'); // 'all' or 'saved'
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Comment/Reply states
    const [replyingTo, setReplyingTo] = useState(null); // { postId, commentId, userName }
    const [commentMedia, setCommentMedia] = useState({}); // { postId/commentId: file }
    const [commentMediaPreview, setCommentMediaPreview] = useState({});
    const [commentLink, setCommentLink] = useState({});

    // Defensive user retrieval
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('user');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error("User parse error", e);
            return null;
        }
    });

    // Re-fetch posts or search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch(1);
            } else if (activeTab === 'saved') {
                fetchSavedPosts();
            } else {
                fetchPosts(1);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, activeTab]);

    // Handle deep linking for postId
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('postId');
        if (postId && posts.length > 0) {
            const post = posts.find(p => p._id === postId);
            if (post) setSelectedPost(post);
        }
    }, [posts]);

    const fetchPosts = async (pageNumber = 1) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/posts`, {
                params: { page: pageNumber, limit: 10 }
            });
            setPosts(res.data.posts);
            setTotalPages(res.data.pages);
            setPage(res.data.page);
        } catch (error) {
            console.error("Error fetching posts:", error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (pageNumber = 1) => {
        if (!searchQuery.trim()) return fetchPosts(1);
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                params: { query: searchQuery, page: pageNumber, limit: 10 }
            };
            const res = await axios.get(`${API_URL}/api/posts/search`, config);
            setPosts(res.data.posts);
            setTotalPages(res.data.pages);
            setPage(res.data.page);
        } catch (error) {
            console.error("Search error:", error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchSavedPosts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${API_URL}/api/posts/saved`, config);
            setPosts(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching saved posts:", error);
            setLoading(false);
        }
    };

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMedia(file);
            const reader = new FileReader();
            reader.onloadend = () => setMediaPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim() && !media && !link) return;

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('content', newPostContent);
            if (media) formData.append('image', media); // Backend handles image/video based on mimetype
            if (link) formData.append('link', link);

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            const res = await axios.post(`${API_URL}/api/posts`, formData, config);

            setPosts([res.data, ...posts]);
            setNewPostContent('');
            setMedia(null);
            setMediaPreview(null);
            setLink('');
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    const handlePageChange = (newPage) => {
        if (searchQuery.trim()) {
            handleSearch(newPage);
        } else {
            fetchPosts(newPage);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleComment = async (postId, textValue = null, commentId = null) => {
        const key = commentId || postId;
        const text = textValue || commentTexts[key];
        if (!text?.trim() && !commentMedia[key] && !commentLink[key]) return;

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('text', text || '');
            if (commentMedia[key]) formData.append('image', commentMedia[key]);
            if (commentLink[key]) formData.append('link', commentLink[key]);

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            const url = commentId
                ? `${API_URL}/api/posts/${postId}/comment/${commentId}/reply`
                : `${API_URL}/api/posts/${postId}/comment`;

            const res = await axios.post(url, formData, config);

            const updatedPosts = posts.map(p => p._id === postId ? { ...p, comments: res.data } : p);
            setPosts(updatedPosts);
            if (selectedPost?._id === postId) {
                setSelectedPost({ ...selectedPost, comments: res.data });
            }

            // Reset states
            setCommentTexts({ ...commentTexts, [key]: '' });
            setCommentMedia({ ...commentMedia, [key]: null });
            setCommentMediaPreview({ ...commentMediaPreview, [key]: null });
            setCommentLink({ ...commentLink, [key]: '' });
            setReplyingTo(null);
        } catch (error) {
            console.error("Comment/Reply error:", error);
        }
    };

    const handleCommentMedia = (e, key) => {
        const file = e.target.files[0];
        if (file) {
            setCommentMedia({ ...commentMedia, [key]: file });
            const reader = new FileReader();
            reader.onloadend = () => setCommentMediaPreview({ ...commentMediaPreview, [key]: reader.result });
            reader.readAsDataURL(file);
        }
    };

    const handleBookmark = async (postId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return alert("Vui lòng đăng nhập");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API_URL}/api/posts/${postId}/bookmark`, {}, config);

            setPosts(posts.map(p => p._id === postId ? {
                ...p,
                bookmarks: p.bookmarks.includes(user._id)
                    ? p.bookmarks.filter(id => id !== user._id)
                    : [...p.bookmarks, user._id]
            } : p));
        } catch (error) {
            console.error("Bookmark error:", error);
        }
    };

    const handleLike = async (postId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return alert("Vui lòng đăng nhập");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.put(`${API_URL}/api/posts/${postId}/like`, {}, config);

            setPosts(posts.map(p => p._id === postId ? { ...p, likes: res.data } : p));
            if (selectedPost?._id === postId) {
                setSelectedPost({ ...selectedPost, likes: res.data });
            }
        } catch (error) {
            console.error("Like error:", error);
        }
    };

    // Modal Component
    const PostModal = ({ post, onClose }) => {
        if (!post) return null;
        return (
            <div className="fixed inset-0 z-[100] bg-black flex flex-col md:flex-row h-screen">
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 z-[110] bg-gray-800/50 p-2 rounded-full text-white hover:bg-gray-700"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Left: Media Content */}
                <div className="flex-1 bg-black flex items-center justify-center p-4 h-1/2 md:h-full overflow-hidden">
                    {post.video ? (
                        <video src={post.video} controls autoPlay className="max-w-full max-h-full object-contain" />
                    ) : post.image ? (
                        <img src={post.image} className="max-w-full max-h-full object-contain" alt="Full view" />
                    ) : (
                        <div className="text-white text-center p-8 bg-gray-900 rounded-xl">
                            <p className="whitespace-pre-wrap">{post.content}</p>
                        </div>
                    )}
                </div>

                {/* Right: Info & Comments */}
                <div className="w-full md:w-[400px] bg-white h-1/2 md:h-full flex flex-col border-l border-gray-100 shadow-2xl overflow-hidden">
                    {/* Author Header */}
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex-shrink-0">
                                {post.author?.img ? <img src={post.author.img} className="w-full h-full rounded-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-primary font-bold">{(post.author?.full_name || 'U').charAt(0)}</div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm truncate">{post.author?.full_name}</h4>
                                <p className="text-[10px] text-gray-500">{new Date(post.createdAt).toLocaleString('vi-VN')}</p>
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">{post.content}</p>
                    </div>

                    {/* Interaction Bar */}
                    <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-4 text-gray-500">
                        <button onClick={() => handleLike(post._id)} className={`flex items-center gap-1.5 text-xs ${user && post.likes.includes(user._id) ? 'text-red-500' : ''}`}>
                            <Heart className={`w-4 h-4 ${user && post.likes.includes(user._id) ? 'fill-current' : ''}`} /> {post.likes.length} Thích
                        </button>
                        <div className="flex items-center gap-1.5 text-xs"><MessageCircle className="w-4 h-4" /> {post.comments.length} Bình luận</div>
                    </div>

                    {/* Comments List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {post.comments.map((comment, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex gap-2 group/comment">
                                    <div className="w-8 h-8 rounded-full bg-white flex-shrink-0 shadow-sm">
                                        {comment.user?.img ? <img src={comment.user.img} className="w-full h-full rounded-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">{(comment.user?.full_name || 'U').charAt(0)}</div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="bg-white rounded-2xl px-3 py-2 shadow-sm inline-block max-w-full">
                                            <p className="text-[10px] font-bold text-dark">{comment.user?.full_name}</p>
                                            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                                            {comment.image && <img src={comment.image} className="mt-2 rounded-lg max-w-full h-auto max-h-40 object-cover cursor-pointer hover:opacity-90" onClick={() => window.open(comment.image)} />}
                                            {comment.video && <video src={comment.video} controls className="mt-2 rounded-lg max-w-full h-auto max-h-40" />}
                                            {comment.link && <a href={comment.link} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-1 text-[10px] text-blue-600 hover:underline"><LinkIcon className="w-3 h-3" /> {comment.link}</a>}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 ml-2 text-[10px] text-gray-500 font-bold">
                                            <button className="hover:text-primary">Thích</button>
                                            <button
                                                onClick={() => {
                                                    setReplyingTo({ postId: post._id, commentId: comment._id, userName: comment.user?.full_name });
                                                    setCommentTexts({ ...commentTexts, [comment._id]: `@${comment.user?.full_name} ` });
                                                }}
                                                className="hover:text-primary"
                                            >
                                                Trả lời
                                            </button>
                                            <span>{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    </div>
                                </div>

                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="ml-10 space-y-3">
                                        {comment.replies.map((reply, rj) => (
                                            <div key={rj} className="flex gap-2 group/reply">
                                                <div className="w-6 h-6 rounded-full bg-white flex-shrink-0 shadow-sm border border-gray-100">
                                                    {reply.user?.img ? <img src={reply.user.img} className="w-full h-full rounded-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px] font-bold">{(reply.user?.full_name || 'U').charAt(0)}</div>}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="bg-white rounded-2xl px-3 py-2 shadow-sm inline-block max-w-full border border-gray-50">
                                                        <p className="text-[9px] font-bold text-dark">{reply.user?.full_name}</p>
                                                        <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{reply.text}</p>
                                                        {reply.image && <img src={reply.image} className="mt-2 rounded-lg max-w-full h-auto max-h-32 object-cover" />}
                                                        {reply.video && <video src={reply.video} controls className="mt-2 rounded-lg max-w-full h-auto max-h-32" />}
                                                        {reply.link && <a href={reply.link} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-center gap-1 text-[9px] text-blue-600 hover:underline"><LinkIcon className="w-3 h-3" /> {reply.link}</a>}
                                                    </div>
                                                    <div className="mt-1 ml-2">
                                                        <button
                                                            onClick={() => {
                                                                setReplyingTo({ postId: post._id, commentId: comment._id, userName: reply.user?.full_name });
                                                                setCommentTexts({ ...commentTexts, [comment._id]: `@${reply.user?.full_name} ` });
                                                            }}
                                                            className="text-[10px] text-gray-500 font-bold hover:text-primary transition-colors"
                                                        >
                                                            Trả lời
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Reply Input Container */}
                                {replyingTo?.commentId === comment._id && (
                                    <div className="ml-10 mt-2 flex gap-2">
                                        <div className="w-6 h-6 rounded-full bg-primary flex-shrink-0 text-white flex items-center justify-center text-[8px] font-bold">
                                            {(user?.full_name || 'U')[0]}
                                        </div>
                                        <div className="flex-1 bg-gray-100 rounded-2xl p-2 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                                            <input
                                                type="text"
                                                placeholder={`Phản hồi ${comment.user?.full_name}...`}
                                                className="w-full bg-transparent text-xs outline-none px-2 py-1"
                                                value={commentTexts[comment._id] || ''}
                                                onChange={(e) => setCommentTexts({ ...commentTexts, [comment._id]: e.target.value })}
                                                onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id, commentTexts[comment._id], comment._id)}
                                                autoFocus
                                            />

                                            {commentMediaPreview[comment._id] && (
                                                <div className="mt-2 relative inline-block">
                                                    <img src={commentMediaPreview[comment._id]} className="w-20 h-20 object-cover rounded-lg border shadow-sm" />
                                                    <button onClick={() => { setCommentMedia({ ...commentMedia, [comment._id]: null }); setCommentMediaPreview({ ...commentMediaPreview, [comment._id]: null }); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mt-2 px-1">
                                                <div className="flex gap-2">
                                                    <label className="cursor-pointer text-gray-400 hover:text-green-500 transition-colors">
                                                        <ImageIcon className="w-3.5 h-3.5" />
                                                        <input type="file" hidden accept="image/*" onChange={(e) => handleCommentMedia(e, comment._id)} />
                                                    </label>
                                                    <label className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors">
                                                        <Video className="w-3.5 h-3.5" />
                                                        <input type="file" hidden accept="video/*" onChange={(e) => handleCommentMedia(e, comment._id)} />
                                                    </label>
                                                    <button onClick={() => { const l = prompt('URL:'); if (l) setCommentLink({ ...commentLink, [comment._id]: l }) }} className="text-gray-400 hover:text-blue-500 transition-colors">
                                                        <LinkIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => setReplyingTo(null)} className="text-[10px] text-gray-400 hover:text-gray-600 font-bold">Hủy</button>
                                                    <button onClick={() => handleComment(post._id, commentTexts[comment._id], comment._id)} className="text-[10px] text-primary font-bold">Gửi</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    {user && (
                        <div className="p-4 border-t border-gray-100 bg-white">
                            {commentMediaPreview[post._id] && (
                                <div className="mb-3 relative inline-block">
                                    <img src={commentMediaPreview[post._id]} className="w-24 h-24 object-cover rounded-xl border-2 border-primary/10 shadow-md" />
                                    <button onClick={() => { setCommentMedia({ ...commentMedia, [post._id]: null }); setCommentMediaPreview({ ...commentMediaPreview, [post._id]: null }); }} className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1 shadow-lg"><X className="w-3 h-3" /></button>
                                </div>
                            )}
                            {commentLink[post._id] && (
                                <div className="mb-2 p-2 bg-blue-50 rounded-lg flex items-center gap-2 text-[10px] text-blue-600 truncate border border-blue-100">
                                    <LinkIcon className="w-3 h-3" /> {commentLink[post._id]}
                                    <button onClick={() => setCommentLink({ ...commentLink, [post._id]: '' })} className="ml-auto text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-100 rounded-3xl px-4 py-2 flex items-center group-focus-within:ring-2 ring-primary/5 transition-all">
                                    <input
                                        type="text"
                                        placeholder="Viết bình luận..."
                                        className="flex-1 bg-transparent text-xs outline-none py-1"
                                        value={commentTexts[post._id] || ''}
                                        onChange={(e) => setCommentTexts({ ...commentTexts, [post._id]: e.target.value })}
                                        onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id, commentTexts[post._id])}
                                    />
                                    <div className="flex items-center gap-2 ml-2">
                                        <label className="cursor-pointer text-gray-400 hover:text-green-500 transition-colors">
                                            <ImageIcon className="w-4 h-4" />
                                            <input type="file" hidden accept="image/*" onChange={(e) => handleCommentMedia(e, post._id)} />
                                        </label>
                                        <label className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors">
                                            <Video className="w-4 h-4" />
                                            <input type="file" hidden accept="video/*" onChange={(e) => handleCommentMedia(e, post._id)} />
                                        </label>
                                        <button onClick={() => { const l = prompt('Dán đường dẫn URL:'); if (l) setCommentLink({ ...commentLink, [post._id]: l }) }} className="text-gray-400 hover:text-blue-500 transition-colors">
                                            <LinkIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <button onClick={() => handleComment(post._id, commentTexts[post._id])} className="bg-primary text-white p-2.5 rounded-full hover:scale-105 shadow-md active:scale-95 transition-all">
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            {selectedPost && <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />}

            <div className="pt-24 pb-12 max-w-2xl mx-auto px-4">
                {/* Search Bar */}
                <div className="mb-6 space-y-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm theo tên người đăng, nội dung hoặc tags..."
                            className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl shadow-sm border border-transparent focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Tabs */}
                    {user && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                            >
                                Tất cả
                            </button>
                            <button
                                onClick={() => setActiveTab('saved')}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'saved' ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                            >
                                Đã lưu
                            </button>
                        </div>
                    )}
                </div>

                {/* Create Post Widget */}
                {user && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex-shrink-0 shadow-sm">
                                {user.img ? <img src={user.img} className="w-full h-full rounded-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-primary font-bold">{(user.full_name || 'U').charAt(0)}</div>}
                            </div>
                            <div className="flex-1">
                                <form onSubmit={handleCreatePost}>
                                    <textarea
                                        className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                                        rows="3"
                                        placeholder={`Hôm nay bạn thấy thế nào, ${user.full_name.split(' ').pop()}?`}
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                    ></textarea>

                                    {mediaPreview && (
                                        <div className="mt-3 relative inline-block">
                                            {media?.type.startsWith('video/') ? (
                                                <video src={mediaPreview} className="w-48 rounded-lg h-32 object-cover" />
                                            ) : (
                                                <img src={mediaPreview} className="w-48 rounded-lg h-32 object-cover shadow-md" />
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => { setMedia(null); setMediaPreview(null); }}
                                                className="absolute -top-2 -right-2 p-1.5 bg-primary text-white rounded-full shadow-lg border-2 border-white hover:scale-110 transition-transform"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}

                                    {link && (
                                        <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 bg-blue-50/50 border border-blue-100 px-3 py-2 rounded-lg">
                                            <LinkIcon className="w-3 h-3" /> <span className="truncate flex-1 font-medium">{link}</span>
                                            <button type="button" onClick={() => setLink('')} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                                        <div className="flex gap-2">
                                            <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors text-gray-600">
                                                <ImageIcon className="w-4 h-4 text-green-500" /> <span className="text-xs font-medium">Ảnh</span>
                                                <input type="file" hidden accept="image/*" onChange={handleMediaChange} />
                                            </label>
                                            <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors text-gray-600">
                                                <Video className="w-4 h-4 text-red-500" /> <span className="text-xs font-medium">Video</span>
                                                <input type="file" hidden accept="video/*" onChange={handleMediaChange} />
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => { const l = prompt('Nhập đường dẫn URL:'); if (l) setLink(l); }}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                                            >
                                                <LinkIcon className="w-4 h-4 text-blue-500" /> <span className="text-xs font-medium">Link</span>
                                            </button>
                                        </div>
                                        <button
                                            type="submit"
                                            className="bg-primary text-white px-5 py-2 rounded-full text-sm font-bold shadow-md hover:shadow-lg hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                                            disabled={!newPostContent.trim() && !media && !link}
                                        >
                                            Đăng
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Posts Feed */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-xl" />)}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {posts.map((post) => (
                            <div key={post._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transform transition-all">
                                <div className="p-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0">
                                            {post.author?.img ? <img src={post.author.img} className="w-full h-full rounded-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-primary font-bold">{(post.author?.full_name || 'U').charAt(0)}</div>}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-dark text-sm hover:underline cursor-pointer">{post.author?.full_name}</h3>
                                            <p className="text-[10px] text-gray-500">{new Date(post.createdAt).toLocaleDateString('vi-VN')} lúc {new Date(post.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <button
                                            onClick={() => handleBookmark(post._id)}
                                            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${user && post.bookmarks?.includes(user._id) ? 'text-primary' : 'text-gray-400'}`}
                                        >
                                            <Bookmark className={`w-5 h-5 ${user && post.bookmarks?.includes(user._id) ? 'fill-current' : ''}`} />
                                        </button>
                                    </div>

                                    <p className="text-gray-800 text-sm mb-4 leading-relaxed whitespace-pre-wrap">
                                        {post.content}
                                    </p>

                                    {post.link && (
                                        <a href={post.link} target="_blank" rel="noopener noreferrer" className="mb-4 flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors group">
                                            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                                <LinkIcon className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <span className="text-blue-700 text-xs font-semibold truncate flex-1">{post.link}</span>
                                        </a>
                                    )}
                                </div>

                                {(post.image || post.video) && (
                                    <div
                                        onClick={() => setSelectedPost(post)}
                                        className="relative bg-gray-100 cursor-zoom-in group overflow-hidden"
                                    >
                                        {post.image ? (
                                            <img src={post.image} alt="content" className="w-full h-auto object-cover max-h-[500px] group-hover:scale-[1.02] transition-transform duration-500" />
                                        ) : (
                                            <video src={post.video} className="w-full h-auto max-h-[500px] object-cover" />
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                            <ImageIcon className="text-white opacity-0 group-hover:opacity-100 w-10 h-10 drop-shadow-lg transition-opacity" />
                                        </div>
                                    </div>
                                )}

                                <div className="p-4">
                                    <div className="flex items-center gap-6 pt-1 text-gray-500">
                                        <button
                                            onClick={() => handleLike(post._id)}
                                            className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all ${user && post.likes.includes(user._id) ? 'text-red-500 font-bold bg-red-50' : 'hover:text-red-500'}`}
                                        >
                                            <Heart className={`w-4 h-4 ${user && post.likes.includes(user._id) ? 'fill-current' : ''}`} />
                                            {post.likes.length} Thích
                                        </button>
                                        <button
                                            onClick={() => setSelectedPost(post)}
                                            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:text-primary transition-all"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            {post.comments.length} Bình luận
                                        </button>
                                        <button className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:text-primary transition-all ml-auto">
                                            <Share2 className="w-4 h-4" />
                                            Chia sẻ
                                        </button>
                                    </div>

                                    {/* Preview Comments */}
                                    {post.comments.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-50 space-y-3">
                                            {post.comments.slice(0, 3).map((comment, i) => (
                                                <div key={i} className="space-y-2">
                                                    <div className="flex gap-2 group/comment">
                                                        <div className="w-7 h-7 rounded-full bg-gray-100 flex-shrink-0">
                                                            {comment.user?.img ? <img src={comment.user.img} className="w-full h-full rounded-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">{(comment.user?.full_name || 'U').charAt(0)}</div>}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="bg-gray-50 rounded-2xl px-3 py-2 flex-1 shadow-sm inline-block max-w-full">
                                                                <p className="text-[10px] font-bold text-dark mb-0.5">{comment.user?.full_name}</p>
                                                                <p className="text-xs text-gray-700 leading-tight whitespace-pre-wrap">{comment.text}</p>
                                                                {comment.image && <img src={comment.image} className="mt-1 rounded-lg max-w-full h-auto max-h-24 object-cover" />}
                                                                {comment.video && <video src={comment.video} className="mt-1 rounded-lg max-w-full h-auto max-h-24" />}
                                                                {comment.link && <p className="mt-1 text-[9px] text-blue-600 truncate underline"><LinkIcon className="w-2.5 h-2.5 inline" /> {comment.link}</p>}
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-1 ml-2 text-[9px] text-gray-400 font-bold">
                                                                <button
                                                                    onClick={() => {
                                                                        setReplyingTo({ postId: post._id, commentId: comment._id, userName: comment.user?.full_name });
                                                                        setCommentTexts({ ...commentTexts, [comment._id]: `@${comment.user?.full_name} ` });
                                                                    }}
                                                                    className="hover:text-primary transition-colors"
                                                                >
                                                                    Trả lời
                                                                </button>
                                                                <span>{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Nested replies in preview */}
                                                    {comment.replies && comment.replies.length > 0 && (
                                                        <div className="ml-9 space-y-2">
                                                            {comment.replies.slice(0, 2).map((reply, rj) => (
                                                                <div key={rj} className="flex gap-2">
                                                                    <div className="w-5 h-5 rounded-full bg-gray-50 flex-shrink-0 border border-gray-100">
                                                                        {reply.user?.img ? <img src={reply.user.img} className="w-full h-full rounded-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[7px] font-bold">{(reply.user?.full_name || 'U').charAt(0)}</div>}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="bg-gray-50/80 rounded-2xl px-3 py-1.5 shadow-sm inline-block max-w-full border border-gray-100">
                                                                            <p className="text-[9px] font-bold text-dark">{reply.user?.full_name}</p>
                                                                            <p className="text-[11px] text-gray-700 leading-tight whitespace-pre-wrap">{reply.text}</p>
                                                                        </div>
                                                                        <div className="mt-0.5 ml-2">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setReplyingTo({ postId: post._id, commentId: comment._id, userName: reply.user?.full_name });
                                                                                    setCommentTexts({ ...commentTexts, [comment._id]: `@${reply.user?.full_name} ` });
                                                                                }}
                                                                                className="text-[9px] text-gray-400 font-bold hover:text-primary transition-colors"
                                                                            >
                                                                                Trả lời
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {comment.replies.length > 2 && (
                                                                <button onClick={() => setSelectedPost(post)} className="text-[9px] text-primary font-bold ml-7">Xem thêm {comment.replies.length - 2} phản hồi...</button>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Reply Input in list view */}
                                                    {replyingTo?.commentId === comment._id && (
                                                        <div className="ml-9 mt-2 flex gap-2">
                                                            <div className="flex-1 bg-gray-100 rounded-2xl p-2">
                                                                <input
                                                                    type="text"
                                                                    className="w-full bg-transparent text-xs outline-none px-2 py-1"
                                                                    value={commentTexts[comment._id] || ''}
                                                                    onChange={(e) => setCommentTexts({ ...commentTexts, [comment._id]: e.target.value })}
                                                                    onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id, commentTexts[comment._id], comment._id)}
                                                                    autoFocus
                                                                />
                                                                <div className="flex justify-end gap-2 mt-1">
                                                                    <button onClick={() => setReplyingTo(null)} className="text-[9px] text-gray-400 font-bold">Hủy</button>
                                                                    <button onClick={() => handleComment(post._id, commentTexts[comment._id], comment._id)} className="text-[9px] text-primary font-bold">Gửi</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {post.comments.length > 3 && (
                                                <button
                                                    onClick={() => setSelectedPost(post)}
                                                    className="text-[11px] font-semibold text-gray-500 hover:text-primary ml-9 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 transition-colors"
                                                >
                                                    Xem thêm {post.comments.length - 3} bình luận...
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {user && (
                                        <div className="mt-4">
                                            {commentMediaPreview[post._id] && (
                                                <div className="mb-2 relative inline-block ml-10">
                                                    <img src={commentMediaPreview[post._id]} className="w-16 h-16 object-cover rounded-lg border border-primary/20" />
                                                    <button onClick={() => { setCommentMedia({ ...commentMedia, [post._id]: null }); setCommentMediaPreview({ ...commentMediaPreview, [post._id]: null }); }} className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-0.5 shadow-sm"><X className="w-2.5 h-2.5" /></button>
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden shadow-sm">
                                                    {user.img ? <img src={user.img} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-primary flex items-center justify-center text-white text-[10px] font-bold">{user.full_name[0]}</div>}
                                                </div>
                                                <div className="flex-1 relative bg-gray-100 rounded-3xl flex items-center px-4 py-1.5 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                                                    <input
                                                        type="text"
                                                        placeholder="Viết phản hồi..."
                                                        className="flex-1 bg-transparent text-xs outline-none py-1.5"
                                                        value={commentTexts[post._id] || ''}
                                                        onChange={(e) => setCommentTexts({ ...commentTexts, [post._id]: e.target.value })}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id, commentTexts[post._id])}
                                                    />
                                                    <div className="flex items-center gap-2 ml-2">
                                                        <label className="cursor-pointer text-gray-400 hover:text-green-500 transition-colors">
                                                            <ImageIcon className="w-3.5 h-3.5" />
                                                            <input type="file" hidden accept="image/*" onChange={(e) => handleCommentMedia(e, post._id)} />
                                                        </label>
                                                        <button
                                                            onClick={() => handleComment(post._id, commentTexts[post._id])}
                                                            className="text-primary hover:scale-110 active:scale-95 transition-all"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {posts.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
                                    <ImageIcon className="w-8 h-8" />
                                </div>
                                <h3 className="font-bold text-dark">Chưa tìm thấy gì cả</h3>
                                <p className="text-gray-500 text-sm mt-1">Hãy thử tìm kiếm từ khóa khác hoặc đăng bài mới.</p>
                            </div>
                        )}
                    </div>
                )}

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default Feed;
