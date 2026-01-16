const mongoose = require('mongoose');

const comboSchema = new mongoose.Schema({
    combo_name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    slot: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    price: {
        type: Number,
        required: true
    }

});

module.exports = mongoose.model('Combo', comboSchema);