const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId, // Could be null for system notifications
        ref: 'Account'
    },
    type: {
        type: String,
        enum: ['booking_request', 'booking_confirmed', 'booking_approved', 'booking_rejected', 'booking_cancelled', 'system', 'order_created', 'order_status_update'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    link: {
        type: String // URL to redirect to (e.g., /my-bookings)
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
