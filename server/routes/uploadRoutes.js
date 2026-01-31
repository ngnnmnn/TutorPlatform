const express = require('express');
const router = express.Router();
const uploadCloud = require('../config/cloudinaryConfig');
const { protect } = require('../middleware/authMiddleware');

// Generic upload route that supports setting a folder
router.post('/image', protect, (req, res, next) => {
    req.uploadFolder = req.query.folder || 'general';
    next();
}, uploadCloud.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({
        message: 'Image uploaded successfully',
        url: req.file.path,
        public_id: req.file.filename
    });
});

module.exports = router;
