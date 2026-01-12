const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    tutorrequestID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TutorRequest',
        required: true
    },
    status: {
        type: Number,
        default: 1
    },
    certificate_name: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Certificate', certificateSchema);