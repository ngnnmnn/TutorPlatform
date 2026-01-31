const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    tutor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    knowledge: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    teachingSkill: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    attitude: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    punctuality: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    rating: { // Average of the above
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Add index to ensure one review per booking
reviewSchema.index({ student: 1, tutor: 1, booking: 1 }, { unique: true });
// Also ensure one review per student-tutor pair if we want to limit to 1 review total per tutor
// For now, let's stick to the requirement: "Mỗi user chỉ feedback 1 lần cho gia sư"
reviewSchema.index({ student: 1, tutor: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
