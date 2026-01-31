const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Account = require('../models/Account');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (Student)
const createReview = async (req, res) => {
    try {
        const { tutorId, bookingId, knowledge, teachingSkill, attitude, punctuality, comment } = req.body;
        const studentId = req.user.id;

        // 1. Validation: Ensure student has a completed booking with this tutor
        const booking = await Booking.findOne({
            _id: bookingId,
            student: studentId,
            tutor: tutorId,
            status: 'completed'
        });

        if (!booking) {
            return res.status(400).json({ message: 'You can only review a tutor after a completed booking.' });
        }

        // 2. Validation: Ensure user only reviews this tutor once (or once per booking?)
        // Requirement says "Mỗi user chỉ feedback 1 lần cho gia sư"
        const existingReview = await Review.findOne({ student: studentId, tutor: tutorId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this tutor.' });
        }

        // 3. Calculate average rating for this specific review
        const rating = (knowledge + teachingSkill + attitude + punctuality) / 4;

        // 4. Create review
        const review = new Review({
            tutor: tutorId,
            student: studentId,
            booking: bookingId,
            knowledge,
            teachingSkill,
            attitude,
            punctuality,
            rating,
            comment
        });

        await review.save();

        // 5. Update Tutor's overall average rating
        const reviews = await Review.find({ tutor: tutorId });
        const numReviews = reviews.length;
        const averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

        await Account.findByIdAndUpdate(tutorId, {
            rating: averageRating.toFixed(1),
            numReviews: numReviews
        });

        res.status(201).json(review);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already reviewed this tutor.' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reviews for a tutor
// @route   GET /api/reviews/tutor/:tutorId
// @access  Public
const getTutorReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ tutor: req.params.tutorId })
            .populate('student', 'full_name img')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Owner/Admin)
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check ownership or admin
        if (review.student.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const tutorId = review.tutor;
        await review.deleteOne();

        // Update Tutor's overall average rating
        const reviews = await Review.find({ tutor: tutorId });
        const numReviews = reviews.length;
        const averageRating = numReviews > 0
            ? reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews
            : 0;

        await Account.findByIdAndUpdate(tutorId, {
            rating: averageRating.toFixed(1),
            numReviews: numReviews
        });

        res.json({ message: 'Review removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createReview,
    getTutorReviews,
    deleteReview
};
