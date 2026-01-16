const Booking = require('../models/Booking');
const Account = require('../models/Account');
const { createNotification } = require('./notificationController');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Student)
const createBooking = async (req, res) => {
    const { tutorId, subject, date, startTime, endTime, learningMode, location, note } = req.body;

    try {
        // Check if tutor exists (and is actually a tutor/approved)
        const tutor = await Account.findById(tutorId);

        if (!tutor || !tutor.isApproved) {
            return res.status(404).json({ message: 'Tutor not found' });
        }

        // Calculate price based on tutor's hourly rate
        const startHour = parseInt(startTime.split(':')[0]);
        const endHour = parseInt(endTime.split(':')[0]);
        const hours = endHour - startHour;
        const price = tutor.hourlyRate * hours;

        const booking = await Booking.create({
            student: req.user.id,
            tutor: tutorId,
            subject,
            date,
            startTime,
            endTime,
            learningMode: learningMode || 'online',
            location: location || '',
            note,
            price,
            status: 'pending'
        });

        const populatedBooking = await Booking.findById(booking._id)
            .populate('tutor', 'full_name email img')
            .populate('student', 'full_name email img');

        // Notify Tutor
        await createNotification({
            recipient: tutorId,
            sender: req.user.id,
            type: 'booking_request',
            title: 'Yêu cầu đặt lịch mới',
            message: `Bạn có yêu cầu đặt lịch mới môn ${subject}.`,
            link: '/my-bookings'
        });

        res.status(201).json(populatedBooking);
    } catch (error) {
        console.error("Booking Controller Error:", error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Get bookings for current user (student or tutor)
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await Account.findById(userId);

        let query = {};
        if (user.role === 'tutor') {
            query = { tutor: userId };
        } else {
            query = { student: userId };
        }

        const bookings = await Booking.find(query)
            .populate('tutor', 'full_name email img subjects hourlyRate')
            .populate('student', 'full_name email img phone')
            .sort({ date: 1, startTime: 1 });

        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings/all
// @access  Private (Admin)
const getAllBookings = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};

        if (status) {
            query.status = status;
        }

        const bookings = await Booking.find(query)
            .populate('tutor', 'full_name email img')
            .populate('student', 'full_name email img phone')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Tutor confirm/reject booking
// @route   PUT /api/bookings/:id/tutor-confirm
// @access  Private (Tutor)
const tutorConfirmBooking = async (req, res) => {
    try {
        const { confirmed, tutorNote, meetLink } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if current user is the tutor of this booking
        if (booking.tutor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        booking.tutorConfirmed = confirmed;
        booking.tutorNote = tutorNote || '';

        if (confirmed) {
            booking.status = 'tutor_confirmed';
            if (meetLink) {
                booking.meetLink = meetLink;
            }
        } else {
            booking.status = 'rejected';
        }

        const updatedBooking = await booking.save();

        const populatedBooking = await Booking.findById(updatedBooking._id)
            .populate('tutor', 'full_name email img')
            .populate('student', 'full_name email img');

        // Notify Student
        if (confirmed) {
            await createNotification({
                recipient: booking.student,
                sender: req.user.id,
                type: 'booking_confirmed',
                title: 'Gia sư đã xác nhận',
                message: `Gia sư ${populatedBooking.tutor.full_name} đã xác nhận lịch học môn ${booking.subject}. Chờ Admin duyệt.`,
                link: '/my-bookings'
            });
        } else {
            await createNotification({
                recipient: booking.student,
                sender: req.user.id,
                type: 'booking_rejected',
                title: 'Gia sư từ chối lịch học',
                message: `Gia sư ${populatedBooking.tutor.full_name} đã từ chối lịch học môn ${booking.subject}.`,
                link: '/my-bookings'
            });
        }

        res.json(populatedBooking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Admin approve/reject booking
// @route   PUT /api/bookings/:id/admin-approve
// @access  Private (Admin)
const adminApproveBooking = async (req, res) => {
    try {
        const { approved, adminNote, meetLink } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if admin
        const user = await Account.findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        booking.adminApproved = approved;
        booking.adminNote = adminNote || '';

        if (approved) {
            booking.status = 'approved';
            // Admin có thể thêm/sửa link meet khi duyệt
            if (meetLink) {
                booking.meetLink = meetLink;
            }
        } else {
            booking.status = 'rejected';
        }

        const updatedBooking = await booking.save();

        const populatedBooking = await Booking.findById(updatedBooking._id)
            .populate('tutor', 'full_name email img')
            .populate('student', 'full_name email img');

        // Notify Student and Tutor
        if (approved) {
            await createNotification({
                recipient: booking.student,
                sender: req.user.id,
                type: 'booking_approved',
                title: 'Lịch học được duyệt',
                message: `Lịch học môn ${booking.subject} đã được Admin duyệt.`,
                link: '/schedule'
            });
            await createNotification({
                recipient: booking.tutor,
                sender: req.user.id,
                type: 'booking_approved',
                title: 'Lịch học được duyệt',
                message: `Lịch học môn ${booking.subject} với học viên ${populatedBooking.student.full_name} đã được Admin duyệt.`,
                link: '/schedule'
            });
        } else {
            await createNotification({
                recipient: booking.student,
                sender: req.user.id,
                type: 'booking_rejected',
                title: 'Lịch học bị từ chối',
                message: `Lịch học môn ${booking.subject} không được Admin chấp nhận.`,
                link: '/my-bookings'
            });
            await createNotification({
                recipient: booking.tutor,
                sender: req.user.id,
                type: 'booking_rejected',
                title: 'Lịch học bị từ chối',
                message: `Lịch học môn ${booking.subject} không được Admin chấp nhận.`,
                link: '/my-bookings'
            });
        }

        res.json(populatedBooking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if current user is the student or tutor of this booking
        if (booking.student.toString() !== req.user.id && booking.tutor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Can only cancel if not already completed
        if (booking.status === 'completed') {
            return res.status(400).json({ message: 'Cannot cancel completed booking' });
        }

        booking.status = 'cancelled';
        const updatedBooking = await booking.save();

        // Notify the other party
        const isStudent = booking.student.toString() === req.user.id;
        const recipientId = isStudent ? booking.tutor : booking.student;
        const senderName = isStudent ? 'Học viên' : 'Gia sư'; // Ideally fetch name

        await createNotification({
            recipient: recipientId,
            sender: req.user.id,
            type: 'booking_cancelled',
            title: 'Lịch học bị hủy',
            message: `${senderName} đã hủy lịch học môn ${booking.subject}.`,
            link: '/my-bookings'
        });

        res.json(updatedBooking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get approved bookings for schedule display
// @route   GET /api/bookings/schedule
// @access  Private
const getSchedule = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await Account.findById(userId);
        const { startDate, endDate } = req.query;

        let query = {
            status: 'approved'
        };

        // Filter by user role
        if (user.role === 'tutor') {
            query.tutor = userId;
        } else if (user.role === 'student') {
            query.student = userId;
        }

        // Filter by date range if provided
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const bookings = await Booking.find(query)
            .populate('tutor', 'full_name email img subjects')
            .populate('student', 'full_name email img')
            .sort({ date: 1, startTime: 1 });

        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('tutor', 'full_name email img phone subjects hourlyRate')
            .populate('student', 'full_name email img phone');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check permission
        const user = await Account.findById(req.user.id);
        if (user.role !== 'admin' &&
            booking.student._id.toString() !== req.user.id &&
            booking.tutor._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark booking as completed
// @route   PUT /api/bookings/:id/complete
// @access  Private (Tutor/Admin)
const completeBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const user = await Account.findById(req.user.id);

        // Only tutor of this booking or admin can mark as complete
        if (user.role !== 'admin' && booking.tutor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (booking.status !== 'approved') {
            return res.status(400).json({ message: 'Only approved bookings can be marked as completed' });
        }

        booking.status = 'completed';
        const updatedBooking = await booking.save();

        res.json(updatedBooking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getAllBookings,
    tutorConfirmBooking,
    adminApproveBooking,
    cancelBooking,
    getSchedule,
    getBookingById,
    completeBooking
};
