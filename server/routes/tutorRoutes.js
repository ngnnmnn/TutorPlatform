const express = require('express');
const router = express.Router();
const { getTutors, getTutorById, updateTutorProfile } = require('../controllers/tutorController');
const { protect } = require('../middleware/authMiddleware');
const uploadCloud = require('../config/cloudinaryConfig');

// Middleware to set upload folder
const setUploadFolder = (folder) => (req, res, next) => {
    req.uploadFolder = folder;
    next();
};

const uploadFields = uploadCloud.fields([
    { name: 'evidence', maxCount: 10 },
    { name: 'img', maxCount: 1 }
]);

router.get('/', getTutors);
router.put('/profile', protect, setUploadFolder('tutor_profiles'), uploadFields, updateTutorProfile);
router.get('/:id', getTutorById);

module.exports = router;
