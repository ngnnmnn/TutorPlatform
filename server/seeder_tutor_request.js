const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Account = require('./models/Account');
const TutorRequest = require('./models/TutorRequest');

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

const seedTutorRequests = async () => {
    await connectDB();

    try {
        const tutors = await Account.find({ username: { $in: ['tutormai', 'tutornam'] } });

        if (tutors.length === 0) {
            console.log("No tutors found to seed requests for.");
            process.exit();
        }

        await TutorRequest.deleteMany({ accountId: { $in: tutors.map(t => t._id) } });

        const maiRequest = {
            accountId: tutors.find(t => t.username === 'tutormai')._id,
            math_score: 9.0,
            literature_score: 8.5,
            chemistry_score: 8.0,
            physic_score: 8.5,
            english_score: 9.0,
            university: 'Đại học Sư phạm TP.HCM',
            Note: `Gia sư có kinh nghiệm, nhiệt tình`,
            status: 2,
            subject: 'Toan'
        };

        const namRequest = {
            accountId: tutors.find(t => t.username === 'tutornam')._id,
            math_score: 9.5,
            literature_score: 7.0,
            chemistry_score: 9.0,
            physic_score: 9.5,
            english_score: 8.0,
            university: 'Đại học Bách Khoa',
            Note: `Chuyên gia luyện thi đại học khối A`,
            status: 2,
            subject: 'Vat Ly'
        };

        const requests = [maiRequest, namRequest];

        await TutorRequest.insertMany(requests);
        console.log('TutorRequests Seeded for:', tutors.map(t => t.username).join(', '));
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedTutorRequests();
