const mongoose = require('mongoose');

const teachSubjectSchema = new mongoose.Schema({
    subjectID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    tutorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    tutorReId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TutorRequest',
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('TeachSubject', teachSubjectSchema);