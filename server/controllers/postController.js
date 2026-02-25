const Post = require('../models/Post');
const Account = require('../models/Account');
const Notification = require('../models/Notification');
const { fetchLinkPreview } = require('../utils/fetchLinkPreview');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public (or Private? Let's make it Public for now so anyone can see feed)
const getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const total = await Post.countDocuments();
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate('author', 'full_name img')
            .populate({
                path: 'comments.user',
                select: 'full_name img'
            })
            .populate({
                path: 'comments.replies.user',
                select: 'full_name img'
            });

        res.json({
            posts,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
    try {
        const { content, link, tags } = req.body;
        let image = req.body.image;
        let video = req.body.video;

        if (req.file) {
            if (req.file.mimetype.startsWith('video/')) {
                video = req.file.path;
            } else {
                image = req.file.path;
            }
        }

        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const tagList = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];

        // Fetch link preview metadata if link is provided
        let linkPreview = undefined;
        if (link) {
            linkPreview = await fetchLinkPreview(link);
        }

        const post = await Post.create({
            author: req.user.id,
            content,
            image,
            video,
            link,
            linkPreview,
            tags: tagList
        });

        const fullPost = await Post.findById(post._id).populate('author', 'full_name img');
        res.status(201).json(fullPost);
    } catch (error) {
        console.error("Create Post Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Like/Unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the post has already been liked
        if (post.likes.includes(req.user.id)) {
            // Unlike
            post.likes = post.likes.filter(id => id.toString() !== req.user.id.toString());
        } else {
            // Like
            post.likes.push(req.user.id);
        }

        await post.save();

        res.json(post.likes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Comment on a post
// @route   POST /api/posts/:id/comment
// @access  Private
const commentOnPost = async (req, res) => {
    try {
        const { text, link } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        let image, video;
        if (req.file) {
            if (req.file.mimetype.startsWith('video/')) video = req.file.path;
            else image = req.file.path;
        }

        const newComment = {
            user: req.user.id,
            text,
            image,
            video,
            link,
            createdAt: new Date()
        };

        post.comments.push(newComment);
        await post.save();

        // Notify post author
        if (post.author.toString() !== req.user.id) {
            const sender = await Account.findById(req.user.id);
            await Notification.create({
                recipient: post.author,
                sender: req.user.id,
                type: 'post_comment',
                title: 'Bình luận mới',
                message: `${sender?.full_name || 'Ai đó'} đã bình luận về bài viết của bạn.`,
                link: `/feed?postId=${post._id}`
            });
        }

        const updatedPost = await Post.findById(post._id).populate('comments.user', 'full_name img').populate('comments.replies.user', 'full_name img');
        res.json(updatedPost.comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reply to a comment
// @route   POST /api/posts/:id/comment/:commentId/reply
// @access  Private
const replyToComment = async (req, res) => {
    try {
        const { text, link } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = post.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        let image, video;
        if (req.file) {
            if (req.file.mimetype.startsWith('video/')) video = req.file.path;
            else image = req.file.path;
        }

        const newReply = {
            user: req.user.id,
            text,
            image,
            video,
            link,
            createdAt: new Date()
        };

        comment.replies.push(newReply);
        await post.save();

        // Notify original commenter
        if (comment.user.toString() !== req.user.id) {
            const sender = await Account.findById(req.user.id);
            await Notification.create({
                recipient: comment.user,
                sender: req.user.id,
                type: 'post_reply',
                title: 'Phản hồi mới',
                message: `${sender?.full_name || 'Ai đó'} đã phản hồi bình luận của bạn.`,
                link: `/feed?postId=${post._id}`
            });
        }

        const updatedPost = await Post.findById(post._id).populate('comments.user', 'full_name img').populate('comments.replies.user', 'full_name img');
        res.json(updatedPost.comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Bookmark/Unbookmark a post
// @route   PUT /api/posts/:id/bookmark
// @access  Private
const bookmarkPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const account = await Account.findById(req.user.id);

        if (!post || !account) {
            return res.status(404).json({ message: 'Not found' });
        }

        if (post.bookmarks.includes(req.user.id)) {
            // Remove bookmark
            post.bookmarks = post.bookmarks.filter(id => id.toString() !== req.user.id.toString());
            account.savedPosts = account.savedPosts.filter(id => id.toString() !== post._id.toString());
        } else {
            // Add bookmark
            post.bookmarks.push(req.user.id);
            account.savedPosts.push(post._id);
        }

        await post.save();
        await account.save();

        res.json({ message: 'Bookmark status updated', isBookmarked: post.bookmarks.includes(req.user.id) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Search posts and update search history
// @route   GET /api/posts/search
// @access  Public (Tracking if logged in)
const searchPosts = async (req, res) => {
    const { query, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    if (!query || query.trim() === '') {
        return getPosts(req, res);
    }

    try {
        // Find authors whose names match the query
        const matchingAuthors = await Account.find({
            full_name: { $regex: query, $options: 'i' }
        }).select('_id');

        const authorIds = matchingAuthors.map(a => a._id);

        const queryObj = {
            $or: [
                { content: { $regex: query, $options: 'i' } },
                { tags: { $in: [new RegExp(query, 'i')] } },
                { author: { $in: authorIds } }
            ]
        };

        const total = await Post.countDocuments(queryObj);
        const posts = await Post.find(queryObj)
            .populate('author', 'full_name img')
            .populate({
                path: 'comments.user',
                select: 'full_name img'
            })
            .populate({
                path: 'comments.replies.user',
                select: 'full_name img'
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        // Save to search history if user is logged in
        if (req.user) {
            const account = await Account.findById(req.user.id);
            if (account && !account.searchHistory.includes(query)) {
                account.searchHistory.unshift(query);
                if (account.searchHistory.length > 10) account.searchHistory.pop();
                await account.save();
            }
        }

        res.json({
            posts,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get recommended posts based on search history
// @route   GET /api/posts/recommended
// @access  Private
const getRecommendedPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        const account = await Account.findById(req.user.id);
        if (!account || account.searchHistory.length === 0) {
            // Default: return recent posts
            const total = await Post.countDocuments();
            const recentPosts = await Post.find()
                .populate('author', 'full_name img')
                .limit(Number(limit))
                .skip(skip)
                .sort({ createdAt: -1 });

            return res.json({
                posts: recentPosts,
                total,
                page: Number(page),
                pages: Math.ceil(total / limit)
            });
        }

        // Search for posts matching any history keywords
        const regexQueries = account.searchHistory.map(q => new RegExp(q, 'i'));

        const postsQuery = {
            $or: [
                { content: { $in: regexQueries } },
                { tags: { $in: regexQueries } }
            ]
        };

        const total = await Post.countDocuments(postsQuery);
        const recommended = await Post.find(postsQuery)
            .populate('author', 'full_name img')
            .populate({
                path: 'comments.user',
                select: 'full_name img'
            })
            .populate({
                path: 'comments.replies.user',
                select: 'full_name img'
            })
            .limit(Number(limit))
            .skip(skip)
            .sort({ createdAt: -1 });

        res.json({
            posts: recommended,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get saved posts for current user
// @route   GET /api/posts/saved
// @access  Private
const getSavedPosts = async (req, res) => {
    try {
        const account = await Account.findById(req.user.id).populate({
            path: 'savedPosts',
            populate: [
                { path: 'author', select: 'full_name img' },
                { path: 'comments.user', select: 'full_name img' },
                { path: 'comments.replies.user', select: 'full_name img' }
            ]
        });

        if (!account) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(account.savedPosts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getPosts, createPost, likePost, commentOnPost, replyToComment, bookmarkPost, searchPosts, getRecommendedPosts, getSavedPosts };
