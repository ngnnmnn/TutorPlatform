const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateUserProfile, createTutorRequest, verifyEmail, forgotPassword, changePassword } = require('../controllers/authController');
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

router.post('/register', setUploadFolder('avatars'), uploadCloud.single('img'), registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/me', protect, setUploadFolder('avatars'), uploadCloud.single('img'), updateUserProfile); // Update profile
router.post('/tutor-request', protect, setUploadFolder('evidence'), uploadFields, createTutorRequest); // Tutor/Upgrade Request
router.put('/change-password', protect, changePassword);
router.get('/verify/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);

module.exports = router;
