const mongoose = require('mongoose');

const timeScheduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('TimeSchedule', timeScheduleSchema);
