const express = require('express');
const router = express.Router();
const {
    createReview,
    getTutorReviews,
    deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.get('/tutor/:tutorId', getTutorReviews);
router.delete('/:id', protect, deleteReview);

module.exports = router;
