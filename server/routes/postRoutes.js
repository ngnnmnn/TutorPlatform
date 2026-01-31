const express = require('express');
const router = express.Router();
const { getPosts, createPost, likePost, commentOnPost, replyToComment, bookmarkPost, searchPosts, getRecommendedPosts, getSavedPosts } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const uploadCloud = require('../config/cloudinaryConfig');

// Middleware to set upload folder
const setUploadFolder = (folder) => (req, res, next) => {
    req.uploadFolder = folder;
    next();
};

router.get('/', getPosts);
router.get('/search', searchPosts); // Added search
router.get('/saved', protect, getSavedPosts); // Added saved posts
router.get('/recommended', protect, getRecommendedPosts); // Added recommendations
router.post('/', protect, setUploadFolder('posts'), uploadCloud.single('image'), createPost);
router.put('/:id/like', protect, likePost);
router.post('/:id/comment', protect, setUploadFolder('posts/comments'), uploadCloud.single('image'), commentOnPost); // Added media support
router.post('/:id/comment/:commentId/reply', protect, setUploadFolder('posts/comments'), uploadCloud.single('image'), replyToComment); // Added replies
router.put('/:id/bookmark', protect, bookmarkPost); // Added bookmarks

module.exports = router;
