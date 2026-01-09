const TutorProfile = require('../models/TutorProfile');
const User = require('../models/User');

// @desc    Get all tutors with filters
// @route   GET /api/tutors
// @access  Public
const getTutors = async (req, res) => {
    try {
        const { keyword, subject, minPrice, maxPrice } = req.query;

        let query = { isApproved: true };

        // Search by name (via User model) or bio
        if (keyword) {
            // 1. Find users matching the name
            const matchingUsers = await User.find({
                name: { $regex: keyword, $options: 'i' },
                role: 'tutor'
            }).select('_id');

            const userIds = matchingUsers.map(user => user._id);

            query.$or = [
                { user: { $in: userIds } },
                { bio: { $regex: keyword, $options: 'i' } },
                { subjects: { $regex: keyword, $options: 'i' } }
            ];
        }

        if (subject) {
            query.subjects = { $regex: subject, $options: 'i' };
        }

        if (minPrice || maxPrice) {
            query.hourlyRate = {};
            if (minPrice) query.hourlyRate.$gte = Number(minPrice);
            if (maxPrice) query.hourlyRate.$lte = Number(maxPrice);
        }

        const tutors = await TutorProfile.find(query)
            .populate('user', 'name avatar email') // Get user details
            .sort({ rating: -1 }); // Sort by rating descending

        res.json(tutors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single tutor by ID
// @route   GET /api/tutors/:id
// @access  Public
const getTutorById = async (req, res) => {
    try {
        const tutor = await TutorProfile.findById(req.params.id).populate('user', 'name avatar email');

        if (tutor) {
            res.json(tutor);
        } else {
            res.status(404).json({ message: 'Tutor not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

module.exports = { getTutors, getTutorById };
