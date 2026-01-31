const Booking = require('../models/Booking');
const Account = require('../models/Account');
const Combo = require('../models/Combo'); // Import Combo
const OrderCombo = require('../models/OderCombo'); // Import OrderCombo (sic)
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

        // Calculate price based on tutor's booking count (Dynamic Pricing)
        // If bookingCount > 50 => 200,000, else 150,000
        // NOTE: This assumes 1 slot = 1 session.
        // We do typically calculate hours, but the prompt specified fixed session price based on count.
        // Let's stick to the "per session" logic or "per slot" logic.
        // The frontend sends start/end time for ONE slot.
        // So price = (count > 50 ? 200000 : 150000) * 1;

        let sessionPrice = 150000;
        if (tutor.bookingCount && tutor.bookingCount > 50) {
            sessionPrice = 200000;
        }

        const price = sessionPrice; // Fixed price per booked slot/session

        // Find/Create Combo order
        // 1. Find the 1-slot combo matching the price
        let combo = await Combo.findOne({ slot: 1, price: price });

        // Fallback: if not found, just find any 1-slot combo? Or error?
        // Let's assume seeder run. If strictly not found, maybe create a temporary one or fail?
        // Better to fail gracefully or warn.
        if (!combo) {
            // Try finding any 1 slot combo
            combo = await Combo.findOne({ slot: 1 });
        }

        if (!combo) {
            return res.status(500).json({ message: 'System Error: Single Booking Combo not configuration found.' });
        }

        // 2. Create OrderCombo for this single booking
        const order = await OrderCombo.create({
            comboID: combo._id,
            accountId: req.user.id,
            used_slot: 1,
            remaining_slot: 0,
            status: true // Active/Completed
        });

        const booking = await Booking.create({
            student: req.user.id,
            tutor: tutorId,
            orderId: order._id, // Link to the new Order
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

        // Notify Tutor (Optional: The user said tutor only sees when admin approves.
        // However, keeping a notification might be useful? 
        // PROMPT: "chuyển sang cho admin gia sư chỉ có thể xem khi admin chấp thuận và thông báo"
        // This suggests we should NOT notify the tutor yet. Or notify them but they can't act?
        // If they can't see the booking, the link will fail or show nothing.
        // let's COMMENT OUT the notification to tutor for now, or send it to Admin?
        // For now, let's remove the tutor notification to stay strict to "tutor only sees when admin approves".

        /* 
        await createNotification({
            recipient: tutorId,
            sender: req.user.id,
            type: 'booking_request',
            title: 'Yêu cầu đặt lịch mới',
            message: `Bạn có yêu cầu đặt lịch mới môn ${subject}.`,
            link: '/my-bookings'
        });
        */

        // Note: In a real app we might want to notify ADMIN here.

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
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        const userId = req.user.id;
        const user = await Account.findById(userId);

        let query = {};
        if (user.role === 'tutor') {
            // Tutor only sees approved, completed, or cancelled bookings (after approval)
            // They do NOT see pending bookings anymore.
            query = {
                tutor: userId,
                status: { $in: ['approved', 'completed', 'cancelled'] }
            };
        } else {
            query = { student: userId };
        }

        const bookings = await Booking.find(query)
            .populate('tutor', 'full_name email img subjects hourlyRate')
            .populate('student', 'full_name email img phone')
            .populate({
                path: 'orderId',
                populate: {
                    path: 'comboID', // Note: Schema field is comboID not comboId
                    select: 'price combo_name'
                }
            })
            .sort({ date: 1, startTime: 1 });

        const total = await Booking.countDocuments(query);
        const paginatedBookings = await Booking.find(query)
            .populate('tutor', 'full_name email img subjects hourlyRate')
            .populate('student', 'full_name email img phone')
            .populate({
                path: 'orderId',
                populate: {
                    path: 'comboID',
                    select: 'price combo_name'
                }
            })
            .sort({ date: 1, startTime: 1 })
            .skip(skip)
            .limit(Number(limit));

        res.json({
            bookings: paginatedBookings,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit)
        });
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
        const { status, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        let query = {};

        if (status) {
            query.status = status;
        }

        const bookings = await Booking.find(query)
            .populate('tutor', 'full_name email img')
            .populate('student', 'full_name email img phone')
            .populate({
                path: 'orderId',
                populate: {
                    path: 'comboID',
                    select: 'price combo_name'
                }
            })
            .sort({ createdAt: -1 });

        const total = await Booking.countDocuments(query);
        const paginatedBookings = await Booking.find(query)
            .populate('tutor', 'full_name email img')
            .populate('student', 'full_name email img phone')
            .populate({
                path: 'orderId',
                populate: {
                    path: 'comboID',
                    select: 'price combo_name'
                }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        res.json({
            bookings: paginatedBookings,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit)
        });
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
            .populate({
                path: 'orderId',
                populate: {
                    path: 'comboID',
                    select: 'price combo_name'
                }
            })
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
            .populate('student', 'full_name email img phone')
            .populate({
                path: 'orderId',
                populate: {
                    path: 'comboID',
                    select: 'price combo_name'
                }
            });

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

        const updatedBooking = await booking.save();

        // Notify Admin
        // Find all admins
        const admins = await Account.find({ role: 'admin' });
        for (const admin of admins) {
            await createNotification({
                recipient: admin._id,
                sender: req.user.id,
                type: 'booking_completed',
                title: 'Báo cáo hoàn thành lớp học',
                message: `Gia sư ${user.full_name} thông báo đã hoàn thành lịch học môn ${booking.subject}.`,
                link: '/admin'
            });
        }

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
