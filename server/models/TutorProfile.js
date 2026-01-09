const mongoose = require('mongoose');

const tutorProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    bio: {
        type: String,
        required: true
    },
    subjects: [{
        type: String,
        required: true
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
        day: String, // e.g., "Monday"
        startTime: String, // e.g., "14:00"
        endTime: String, // e.g., "16:00"
        isBooked: { type: Boolean, default: false }
    }],
    hourlyRate: {
        type: Number,
        required: true
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
        default: false // Admin approval required
    }
}, { timestamps: true });

module.exports = mongoose.model('TutorProfile', tutorProfileSchema);
