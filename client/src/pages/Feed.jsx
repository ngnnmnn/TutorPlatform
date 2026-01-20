import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Heart, MessageCircle, Share2, Send, Image as ImageIcon } from 'lucide-react';
import { API_URL } from '../config';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/posts`);
            setPosts(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching posts:", error);
            setLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const res = await axios.post(`${API_URL}/api/posts`, {
                content: newPostContent
            }, config);

            setPosts([res.data, ...posts]);
            setNewPostContent('');
        } catch (error) {
            console.error("Error creating post:", error);
            alert("Vui lòng đăng nhập để đăng bài.");
        }
    };

    const handleLike = async (postId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Vui lòng đăng nhập để like bài viết.");
                return;
            }

            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const res = await axios.put(`${API_URL}/api/posts/${postId}/like`, {}, config);

            // Update local state
            setPosts(posts.map(post =>
                post._id === postId ? { ...post, likes: res.data } : post
            ));
        } catch (error) {
            console.error("Error liking post:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="pt-24 pb-12 max-w-2xl mx-auto px-4">
                {/* Create Post Widget */}
                {user && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-primary font-bold flex-shrink-0">
                                {(user.full_name || user.name || 'U').charAt(0)}
                            </div>
                            <div className="flex-1">
                                <form onSubmit={handleCreatePost}>
                                    <textarea
                                        className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                        rows="3"
                                        placeholder={`Hôm nay bạn muốn chia sẻ gì, ${user.full_name || user.name || 'bạn'}?`}
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                    ></textarea>
                                    <div className="flex justify-between items-center mt-3">
                                        <button type="button" className="text-gray-400 hover:text-primary transition-colors">
                                            <ImageIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-2"
                                            disabled={!newPostContent.trim()}
                                        >
                                            <Send className="w-4 h-4" /> Đăng bài
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Posts Feed */}
                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {posts.map((post) => (
                            <div key={post._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-primary font-bold">
                                        {(post.author?.full_name || post.author?.name || 'U').charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-dark text-sm">{post.author?.full_name || post.author?.name || 'Người dùng'}</h3>
                                        <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                </div>

                                <p className="text-gray-700 text-sm mb-4 leading-relaxed whitespace-pre-wrap">
                                    {post.content}
                                </p>

                                {post.image && (
                                    <div className="mb-4 rounded-lg overflow-hidden">
                                        <img src={post.image} alt="Post content" className="w-full h-auto object-cover" />
                                    </div>
                                )}

                                <div className="flex items-center gap-6 pt-4 border-t border-gray-50 text-gray-500">
                                    <button
                                        onClick={() => handleLike(post._id)}
                                        className={`flex items-center gap-2 text-sm hover:text-red-500 transition-colors ${user && post.likes.includes(user._id) ? 'text-red-500 font-semibold' : ''}`}
                                    >
                                        <Heart className={`w-5 h-5 ${user && post.likes.includes(user._id) ? 'fill-current' : ''}`} />
                                        {post.likes.length}
                                    </button>
                                    <button className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                                        <MessageCircle className="w-5 h-5" />
                                        {post.comments.length}
                                    </button>
                                    <button className="flex items-center gap-2 text-sm hover:text-primary transition-colors ml-auto">
                                        <Share2 className="w-5 h-5" />
                                        Chia sẻ
                                    </button>
                                </div>
                            </div>
                        ))}

                        {posts.length === 0 && (
                            <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-gray-100">
                                <p>Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feed;
