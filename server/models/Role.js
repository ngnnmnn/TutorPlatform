const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    role_name: {
        type: String,
        required: true,
        enum: ['admin', 'tutor', 'student'],
        unique: true
    },
    description: {
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
    }
});

module.exports = mongoose.model('Role', roleSchema);
