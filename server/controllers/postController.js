const Post = require('../models/Post');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public (or Private? Let's make it Public for now so anyone can see feed)
const getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('author', 'full_name img') // Populate author details
            .populate('comments.user', 'full_name img'); // Populate comment authors

        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
    console.log("Create Post Request Body:", req.body);
    console.log("Create Post User:", req.user);

    try {
        const { content, image } = req.body;

        if (!req.user) {
            console.log("No user found in request");
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const post = await Post.create({
            author: req.user.id,
            content,
            image
        });

        const fullPost = await Post.findById(post._id).populate('author', 'full_name img');

        console.log("Post Created:", fullPost);
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

module.exports = { getPosts, createPost, likePost };
