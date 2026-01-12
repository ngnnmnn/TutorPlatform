const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateUserProfile, createTutorRequest } = require('../controllers/authController');
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

router.post('/register', upload.single('img'), registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/me', protect, upload.single('img'), updateUserProfile);
router.post('/tutor-request', protect, upload.array('evidence', 10), createTutorRequest);

module.exports = router;
