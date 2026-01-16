const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Booking = require('./models/Booking');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const cleanupBookings = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Delete bookings where required fields are missing
        const result = await Booking.deleteMany({
            $or: [
                { startTime: { $exists: false } },
                { endTime: { $exists: false } },
                { subject: { $exists: false } }
            ]
        });

        console.log(`Deleted ${result.deletedCount} invalid bookings.`);
        process.exit();
    } catch (error) {
        console.error('Error cleaning up bookings:', error);
        process.exit(1);
    }
};

cleanupBookings();
