const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    getAllBookings,
    tutorConfirmBooking,
    adminApproveBooking,
    cancelBooking,
    getSchedule,
    getBookingById,
    completeBooking
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// Public routes (none)

// Protected routes
router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/schedule', protect, getSchedule);
router.get('/all', protect, getAllBookings);  // Admin only (controller checks)
router.get('/:id', protect, getBookingById);
router.put('/:id/tutor-confirm', protect, tutorConfirmBooking);
router.put('/:id/admin-approve', protect, adminApproveBooking);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/complete', protect, completeBooking);

module.exports = router;
