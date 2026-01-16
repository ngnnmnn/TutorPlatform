const mongoose = require('mongoose');
const dotenv = require('dotenv');
const TimeSchedule = require('./models/TimeSchedule');

dotenv.config({ path: './.env' });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const seedTimeSchedules = async () => {
    await connectDB();

    const schedules = [
        {
            title: 'Ca sáng',
            from: '08:00',
            to: '10:00',
            status: true
        },
        {
            title: 'Ca chiều',
            from: '14:00',
            to: '16:00',
            status: true
        },
        {
            title: 'Ca tối',
            from: '19:00',
            to: '21:00',
            status: true
        }
    ];

    try {
        await TimeSchedule.deleteMany(); // Clear existing
        await TimeSchedule.insertMany(schedules);
        console.log('Time Schedules Seeded!');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedTimeSchedules();
