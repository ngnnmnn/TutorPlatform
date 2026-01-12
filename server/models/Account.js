const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    roleID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    },
    full_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    img: {
        type: String,
        default: ''
    },
    status: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

    // Tutor Specific Fields
    bio: {
        type: String,
        default: ''
    },
    subjects: [{
        type: String
    }],
    education: {
        school: String,
        degree: String,
        graduationYear: Number
    },
    achievements: [{
        title: String,
        date: Date,
        description: String
    }],
    teachingSchedule: [{
        day: String,
        startTime: String,
        endTime: String,
        isBooked: { type: Boolean, default: false }
    }],
    hourlyRate: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    isApproved: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Account', accountSchema);
