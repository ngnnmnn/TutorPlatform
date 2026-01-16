const mongoose = require("mongoose");

const availableSchema = new mongoose.Schema({
    tutorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true
    },
    timeSchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TimeSchedule",
        required: true
    },
    avai_date: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    Note: {
        type: String,
        default: ""
    },
    status: {
        type: Number,
        default: 1
    }
})

module.exports = mongoose.model("AvailableSchedules", availableSchema);