const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    sub_name: {
        type: String,
        required: true
    },
    status: {
        type: boolean,
        default: true
    }
});

module.exports = mongoose.model('Subject', subjectSchema);