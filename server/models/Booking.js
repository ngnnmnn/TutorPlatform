const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    tutor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'TutorProfile' // Changed from Tutor to match model name usually
    },
    date: {
        type: Date,
        required: true
    },
    timeSlot: {
        type: String,
        required: true
    },
    note: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
