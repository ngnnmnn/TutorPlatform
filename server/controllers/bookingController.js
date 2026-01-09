const Booking = require('../models/Booking');
const Tutor = require('../models/TutorProfile');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
    const { tutorId, date, timeSlot, note } = req.body;

    console.log("Create Booking Request:", req.body);
    console.log("Logged in User:", req.user);

    try {
        if (!req.user || !req.user.id) {
            console.log("User invalid:", req.user); // JWT payload usually has 'id', let's check
        }

        // Check if tutor exists
        const tutor = await Tutor.findById(tutorId);

        if (!tutor) {
            console.log("Tutor not found for ID:", tutorId);
            return res.status(404).json({ message: 'Tutor not found' });
        }

        const bookingData = {
            student: req.user.id, // Ensure this matches JWT payload structure
            tutor: tutorId,
            date,
            timeSlot,
            note
        };
        console.log("Saving Booking:", bookingData);

        const booking = await Booking.create(bookingData);

        console.log("Booking Saved:", booking);
        res.status(201).json(booking);
    } catch (error) {
        console.error("Booking Controller Error:", error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Get bookings for current user
// @route   GET /api/bookings
// @access  Private
const getMyBookings = async (req, res) => {
    try {
        // Find bookings where the user is the student OR the tutor (if linked)
        // For simplicity, we assume the logged in user is the student for now
        const bookings = await Booking.find({ student: req.user._id })
            .populate('tutor') // Populate tutor details
            .populate({
                path: 'tutor',
                populate: { path: 'user', select: 'name email' } // Deep populate user in tutor
            });

        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { createBooking, getMyBookings };
