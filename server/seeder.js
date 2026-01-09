const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const TutorProfile = require('./models/TutorProfile');
const bcrypt = require('bcryptjs');

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
        await User.deleteMany();
        await TutorProfile.deleteMany();

        console.log('Data Cleared...');

        // Create Users
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        const studentUser = await User.create({
            name: 'Nguyễn Văn A',
            email: 'student@example.com',
            password: hashedPassword,
            role: 'student'
        });

        const tutorUser1 = await User.create({
            name: 'Trần Thị Mai',
            email: 'mai@example.com',
            password: hashedPassword,
            role: 'tutor'
        });

        const tutorUser2 = await User.create({
            name: 'Lê Hoàng Nam',
            email: 'nam@example.com',
            password: hashedPassword,
            role: 'tutor'
        });

        // Create Tutor Profiles
        await TutorProfile.create({
            user: tutorUser1._id,
            bio: 'Gia sư Toán có kinh nghiệm 5 năm luyện thi đại học.',
            subjects: ['Toán', 'Giải tích', 'Đại số'],
            education: {
                school: 'Đại học Sư phạm TP.HCM',
                degree: 'Cử nhân Sư phạm Toán',
                graduationYear: 2022
            },
            hourlyRate: 150000,
            rating: 4.8,
            numReviews: 12,
            isApproved: true
        });

        await TutorProfile.create({
            user: tutorUser2._id,
            bio: 'Chuyên gia Vật lý, phương pháp dạy dễ hiểu, tận tâm.',
            subjects: ['Vật lý', 'Khoa học tự nhiên'],
            education: {
                school: 'Đại học Bách Khoa',
                degree: 'Tiến sĩ Vật lý',
                graduationYear: 2020
            },
            hourlyRate: 200000,
            rating: 5.0,
            numReviews: 5,
            isApproved: true
        });

        console.log('Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error('Error with data import:', error);
        process.exit(1);
    }
};

importData();
