const Account = require('../models/Account');

// @desc    Get all tutors with filters
// @route   GET /api/tutors
// @access  Public
const getTutors = async (req, res) => {
    try {
        const { keyword, subject, minPrice, maxPrice } = req.query;

        // Base query: Only approved tutors (and potentially ensure they are tutors by role if needed)
        // Since we merged, we can rely on isApproved=true which defaults to false for normal users
        let query = { isApproved: true };

        if (keyword) {
            query.$or = [
                { full_name: { $regex: keyword, $options: 'i' } },
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

        const tutors = await Account.find(query)
            .select('-password') // Exclude password
            .sort({ rating: -1 });

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
        const tutor = await Account.findById(req.params.id).select('-password');

        if (tutor && tutor.isApproved) {
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
