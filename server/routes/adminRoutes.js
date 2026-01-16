const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');
const {
    getAllTutorRequests,
    getTutorRequestById,
    approveTutorRequest,
    rejectTutorRequest,
    getDashboardStats
} = require('../controllers/adminController');

// All routes are protected by auth + admin middleware
router.use(protect);
router.use(adminAuth);

// Dashboard stats
router.get('/stats', getDashboardStats);

// Tutor Requests Management
router.get('/tutor-requests', getAllTutorRequests);
router.get('/tutor-requests/:id', getTutorRequestById);
router.put('/tutor-requests/:id/approve', approveTutorRequest);
router.put('/tutor-requests/:id/reject', rejectTutorRequest);

module.exports = router;
