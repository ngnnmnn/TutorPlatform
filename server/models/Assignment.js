const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    tutor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    dueDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'submitted', 'graded'],
        default: 'pending'
    },
    grade: {
        type: Number
    },
    feedback: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
