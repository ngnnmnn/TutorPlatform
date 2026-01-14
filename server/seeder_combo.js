const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Combo = require('./models/Combo');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error connecting to DB:', error);
        process.exit(1);
    }
};

const importData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Combo.deleteMany();
        console.log('Old Combo Data Cleared...');

        const combos = [
            {
                combo_name: 'Gói 1 Slot (Cơ bản)',
                description: 'Gói cho những gia sư mới bắt đầu',
                slot: 1,
                price: 150000,
                status: true
            },
            {
                combo_name: 'Gói 1 Slot (VIP)',
                description: 'Gói cho những gia sư có lượt booking nhiều nhất',
                slot: 1,
                price: 200000,
                status: true
            },
            {
                combo_name: 'Gói 5 Slot',
                description: 'Gói tiết kiệm với 5 slot booking.',
                slot: 5,
                price: 700000,
                status: true
            },
            {
                combo_name: 'Gói 10 Slot',
                description: 'Gói cao cấp nhất với 10 slot booking.',
                slot: 10,
                price: 1350000,
                status: true
            }
        ];

        await Combo.insertMany(combos);

        console.log('Combo Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error('Error with data import:', error);
        process.exit(1);
    }
};

importData();
