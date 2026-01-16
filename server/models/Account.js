const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['admin', 'tutor', 'student'],
        default: 'student'
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
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    isApproved: {
        type: Boolean,
        default: false
    },
    // Approved Tutor Request data
    tutorRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TutorRequest'
    },
    certificates: [{
        name: String,
        issuedBy: String,
        year: Number
    }],
    evidenceImages: [{
        type: String
    }],
    // Scores from tutor request
    scores: {
        math: Number,
        literature: Number,
        chemistry: Number,
        physics: Number,
        english: Number
    }
});

module.exports = mongoose.model('Account', accountSchema);
