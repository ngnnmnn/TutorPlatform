const express = require('express');
const router = express.Router();
const { getPosts, createPost, likePost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getPosts);
router.post('/', protect, createPost);
router.put('/:id/like', protect, likePost);

module.exports = router;
