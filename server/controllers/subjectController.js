const Subject = require('../models/Subject');

// @desc    Get all active subjects
// @route   GET /api/subjects
// @access  Public
const getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({ status: true });
        res.json(subjects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getSubjects };
