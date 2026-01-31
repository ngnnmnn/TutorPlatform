const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Account = require('./models/Account');
const Role = require('./models/Role');

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
        await Account.deleteMany();
        await Role.deleteMany();


        console.log('Data Cleared...');

        // 1. Create Roles
        const createdRoles = await Role.insertMany([
            { role_name: 'admin', description: 'Administrator with full access' },
            { role_name: 'tutor', description: 'Tutor account' },
            { role_name: 'student', description: 'Student account' }
        ]);

        const adminRole = createdRoles.find(r => r.role_name === 'admin');
        const tutorRole = createdRoles.find(r => r.role_name === 'tutor');
        const studentRole = createdRoles.find(r => r.role_name === 'student');

        // 2. Create Accounts
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        // Admin Account
        await Account.create({
            roleID: adminRole._id,
            full_name: 'Admin User',
            email: 'admin@example.com',
            address: 'Hanoi, Vietnam',
            phone: '0901234567',
            username: 'admin',
            password: hashedPassword,
            status: true,
            isVerified: true,
            img: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
        });

        // Student Account
        await Account.create({
            roleID: studentRole._id,
            full_name: 'Nguyen Van Student',
            email: 'student@example.com',
            address: 'Da Nang, Vietnam',
            phone: '0909876543',
            username: 'student',
            password: hashedPassword,
            status: true,
            isVerified: true,
            img: 'https://cdn-icons-png.flaticon.com/512/3135/3135768.png'
        });

        // Tutor Account 1
        await Account.create({
            roleID: tutorRole._id,
            full_name: 'Tran Thi Mai',
            email: 'mai@example.com',
            address: 'Ho Chi Minh City',
            phone: '0912345678',
            username: 'tutormai',
            password: hashedPassword,
            status: true,
            isVerified: true,
            img: 'https://cdn-icons-png.flaticon.com/512/3135/3135755.png',
            // Tutor Profile Data
            bio: 'Gia sư Toán có kinh nghiệm 5 năm luyện thi đại học.',
            subjects: ['Toán', 'Giải tích', 'Đại số'],
            education: {
                school: 'Đại học Sư phạm TP.HCM',
                degree: 'Cử nhân Sư phạm Toán',
                graduationYear: 2022
            },
            hourlyRate: 150000,
            rating: 0,
            numReviews: 0,
            isApproved: true
        });

        // Tutor Account 2
        await Account.create({
            roleID: tutorRole._id,
            full_name: 'Le Hoang Nam',
            email: 'nam@example.com',
            address: 'Hanoi, Vietnam',
            phone: '0987123456',
            username: 'tutornam',
            password: hashedPassword,
            status: true,
            isVerified: true,
            img: 'https://cdn-icons-png.flaticon.com/512/3135/3135789.png',
            // Tutor Profile Data
            bio: 'Chuyên gia Vật lý, phương pháp dạy dễ hiểu, tận tâm.',
            subjects: ['Vật lý', 'Khoa học tự nhiên'],
            education: {
                school: 'Đại học Bách Khoa',
                degree: 'Tiến sĩ Vật lý',
                graduationYear: 2020
            },
            hourlyRate: 200000,
            rating: 0,
            numReviews: 0,
            isApproved: true
        });

        // Additional Student Accounts
        const studentData = [
            { name: 'Pham Minh Tuan', email: 'tuan@example.com', phone: '0911223344', user: 'student1' },
            { name: 'Le Thi Hoa', email: 'hoa@example.com', phone: '0922334455', user: 'student2' },
            { name: 'Tran Van Bao', email: 'bao@example.com', phone: '0933445566', user: 'student3' }
        ];

        for (const s of studentData) {
            await Account.create({
                roleID: studentRole._id,
                full_name: s.name,
                email: s.email,
                address: 'Vietnam',
                phone: s.phone,
                username: s.user,
                password: hashedPassword,
                status: true,
                isVerified: true,
                img: 'https://cdn-icons-png.flaticon.com/512/3135/3135768.png'
            });
        }

        console.log('Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error('Error with data import:', error);
        process.exit(1);
    }
};

importData();
