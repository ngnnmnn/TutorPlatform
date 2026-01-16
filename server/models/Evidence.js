const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema({
    tutorrequestID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TutorRequest',
        required: true
    },
    img: {
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
    }
});

module.exports = mongoose.model('Evidence', evidenceSchema);
