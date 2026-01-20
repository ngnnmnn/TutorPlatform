const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateUserProfile, createTutorRequest, verifyEmail, forgotPassword, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer Config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'evidence') {
            cb(null, 'uploads/evidence');
        } else {
            cb(null, 'uploads/');
        }
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) // Append extension
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed!'));
    }
});

// Define uploadFields for multiple fields
const uploadFields = upload.fields([
    { name: 'evidence', maxCount: 10 },
    { name: 'img', maxCount: 1 } // Assuming 'img' might also be part of a multi-field upload if needed elsewhere
]);

router.post('/register', upload.single('img'), registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/me', protect, upload.single('img'), updateUserProfile); // Update profile
router.post('/tutor-request', protect, uploadFields, createTutorRequest); // Tutor/Upgrade Request
router.put('/change-password', protect, changePassword);
router.get('/verify/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);

module.exports = router;
