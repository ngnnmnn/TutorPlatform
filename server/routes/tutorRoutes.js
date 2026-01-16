const express = require('express');
const router = express.Router();
const { getTutors, getTutorById, updateTutorProfile } = require('../controllers/tutorController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer Config for tutor profile updates
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'evidence') {
            cb(null, 'uploads/evidence');
        } else {
            cb(null, 'uploads/');
        }
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
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

const uploadFields = upload.fields([
    { name: 'evidence', maxCount: 10 },
    { name: 'img', maxCount: 1 }
]);

router.get('/', getTutors);
router.put('/profile', protect, uploadFields, updateTutorProfile);
router.get('/:id', getTutorById);

module.exports = router;
