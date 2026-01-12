const mongoose = require('mongoose');

const tutorRequestSchema = new mongoose.Schema({
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    math_score: {
        type: Number,
        required: true
    },
    literature_score: {
        type: Number,
        required: true
    },
    chemistry_score: {
        type: Number,
        required: true
    },
    physic_score: {
        type: Number,
        required: true
    },
    english_score: {
        type: Number,
        required: true
    },
    university: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    Note: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('TutorRequest', tutorRequestSchema);
