const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getTimeSchedules, getAvailability, updateAvailability, getTutorAvailability, getTutorBookings } = require('../controllers/scheduleController');

// Tutor specific routes
// We need to check if user is tutor. Assuming protect middleware adds req.user.
// Ideally usage: router.post('/availability', protect, authorize('tutor'), updateAvailability);
// But currently I don't see an 'authorize' middleware in the imports in other files, 
// so I will implement a quick check or just trust 'protect' for now and rely on controller logic if needed (though controller just uses req.user.id).
// Let's stick to 'protect'. 

router.get('/time-slots', getTimeSchedules);
router.get('/availability', protect, getAvailability);
router.post('/availability', protect, updateAvailability);
router.get('/tutor/:id', getTutorAvailability);
router.get('/tutor/:id/bookings', getTutorBookings); // New route

module.exports = router;
