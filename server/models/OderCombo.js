const mongoose = require('mongoose');

const orderComboSchema = new mongoose.Schema({
    comboID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Combo',
        required: true
    },
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: Boolean,
        default: true
    },
    used_slot: {
        type: Number,
        required: true,
        default: 0
    },
    remaining_slot: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('OrderCombo', orderComboSchema);