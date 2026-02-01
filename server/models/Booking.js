const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Account'
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false, // Changed from true to false to allow direct single bookings
        ref: 'OrderCombo'
    },
    tutor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Account'
    },
    subject: {
        type: String,
        required: true
    },
    grade: {
        type: String,
        required: true,
        enum: ['10', '11', '12']
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    // Learning mode: online or offline
    learningMode: {
        type: String,
        enum: ['online', 'offline'],
        default: 'online'
    },
    // Google Meet link for online learning
    meetLink: {
        type: String,
        default: ''
    },
    // Offline learning location
    location: {
        type: String,
        default: ''
    },
    note: {
        type: String,
        default: ''
    },
    // Tutor's response
    tutorConfirmed: {
        type: Boolean,
        default: null // null = pending, true = confirmed, false = rejected
    },
    tutorNote: {
        type: String,
        default: ''
    },
    // Admin approval (after tutor confirms)
    adminApproved: {
        type: Boolean,
        default: null // null = pending, true = approved, false = rejected
    },
    adminNote: {
        type: String,
        default: ''
    },
    // Overall status
    status: {
        type: String,
        enum: ['pending', 'tutor_confirmed', 'approved', 'rejected', 'cancelled', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
