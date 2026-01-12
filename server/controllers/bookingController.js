const Booking = require('../models/Booking');
const Account = require('../models/Account');

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

        // Check if tutor exists (and is actually a tutor/approved)
        const tutor = await Account.findById(tutorId);

        if (!tutor || !tutor.isApproved) {
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
            .populate('tutor', 'full_name email img bio') // Populate tutor details directly from Account
            .populate('student', 'full_name email img'); // Also populate student details if needed

        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { createBooking, getMyBookings };
