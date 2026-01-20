const AvailableSch = require('../models/AvailableSch');
const TimeSchedule = require('../models/TimeSchedule');

// @desc    Get all time schedules (slots)
// @route   GET /api/schedule/time-slots
// @access  Public
const getTimeSchedules = async (req, res) => {
    try {
        const slots = await TimeSchedule.find({ status: true });
        // Sort manually or rely on DB natural order if inserted sequentially. 
        // Better to sort by 'from' time but string sorting might be tricky "07:00" vs "13:00".
        // Assuming 'from' is "HH:mm".
        slots.sort((a, b) => a.from.localeCompare(b.from));
        res.json(slots);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get tutor availability
// @route   GET /api/schedule/availability
// @access  Private (Tutor)
const getAvailability = async (req, res) => {
    try {
        const { start, end } = req.query;
        let query = { tutorId: req.user.id };

        if (start && end) {
            query.avai_date = { $gte: new Date(start), $lte: new Date(end) };
        } else {
            query.avai_date = { $gte: new Date() };
        }

        const availabilities = await AvailableSch.find(query).populate('timeSchId');
        res.json(availabilities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update tutor availability for a specific date
// @route   POST /api/schedule/availability
// @access  Private (Tutor only)
const updateAvailability = async (req, res) => {
    try {
        const { date, timeSchIds } = req.body;

        if (!date) {
            return res.status(400).json({ message: 'Please provide a date' });
        }

        const targetDate = new Date(date);
        // Set to start of day UTC? or just use the date part provided.
        // Assuming frontend sends YYYY-MM-DD, new Date(string) is UTC 00:00.
        // But we should be careful. Let's rely on standard ISO string (YYYY-MM-DD) being parsed.

        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(startOfDay.getDate() + 1);

        // Delete existing for this date
        await AvailableSch.deleteMany({
            tutorId: req.user.id,
            avai_date: { $gte: startOfDay, $lt: endOfDay }
        });

        // Insert new
        if (timeSchIds && timeSchIds.length > 0) {
            const newAvailabilities = timeSchIds.map(slotId => ({
                tutorId: req.user.id,
                timeSchId: slotId,
                avai_date: startOfDay,
                status: 1
            }));
            await AvailableSch.insertMany(newAvailabilities);
        }

        res.json({ message: 'Availability updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get public tutor availability
// @route   GET /api/schedule/tutor/:id
// @access  Public
const getTutorAvailability = async (req, res) => {
    try {
        const { start, end } = req.query;
        let query = { tutorId: req.params.id };

        if (start && end) {
            query.avai_date = { $gte: new Date(start), $lte: new Date(end) };
        } else {
            query.avai_date = { $gte: new Date() };
        }

        const availabilities = await AvailableSch.find(query).populate('timeSchId');
        res.json(availabilities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get tutor's approved bookings (for checking available slots)
// @route   GET /api/schedule/tutor/:id/bookings
// @access  Public
const getTutorBookings = async (req, res) => {
    try {
        const { start, end } = req.query;
        let query = {
            tutor: req.params.id,
            status: 'approved'  // Only approved bookings block the schedule
        };

        if (start && end) {
            query.date = { $gte: new Date(start), $lte: new Date(end) };
        } else {
            query.date = { $gte: new Date() };
        }

        // We need 'bookings'. Why? 
        // We will compare 'booking.date' and 'booking.startTime'/'endTime' with slots.
        // Assuming Booking has 'timeSchId' or we match by string.
        // Booking has 'startTime' (string HH:mm) and 'endTime' (string HH:mm).
        // TimeSchedule has 'from' and 'to'.
        // So we can match exact strings. 

        const Bookings = require('../models/Booking');
        const bookings = await Bookings.find(query).select('date startTime endTime status');
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getTimeSchedules, getAvailability, updateAvailability, getTutorAvailability, getTutorBookings };
