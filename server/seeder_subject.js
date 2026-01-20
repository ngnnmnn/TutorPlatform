const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Subject = require('./models/Subject');
const Account = require('./models/Account');
const TeachSubject = require('./models/TeachSubject');
const TutorRequest = require('./models/TutorRequest');

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

        // 1. Clear existing Subjects and TeachSubject relationships
        await Subject.deleteMany();
        await TeachSubject.deleteMany();

        console.log('Subject and TeachSubject Data Cleared...');

        // 2. Create Subjects
        const subjects = [
            { sub_name: 'Toán học' },
            { sub_name: 'Ngữ văn' },
            { sub_name: 'Tiếng Anh' },
            { sub_name: 'Hóa học' },
            { sub_name: 'Vật lý' }
        ];

        const createdSubjects = await Subject.insertMany(subjects);
        console.log('Subjects created:', createdSubjects.map(s => s.sub_name));

        // 3. Find Tutor Role
        // 4. Get all tutors
        const tutors = await Account.find({ role: 'tutor' });
        console.log(`Found ${tutors.length} tutors.`);

        // 5. Assign 1-3 random subjects to each tutor
        const teachSubjectEntries = [];

        for (const tutor of tutors) {
            // Create a dummy TutorRequest for compatibility since tutorReId is now required
            let dummyRequest = await TutorRequest.findOne({ accountId: tutor._id });
            if (!dummyRequest) {
                const intros = {
                    'tutormai': 'Tôi có 5 năm kinh nghiệm dạy kèm môn Toán cho học sinh ôn thi đại học. Phương pháp dạy nhiệt tình, dễ hiểu và bám sát đề thi.',
                    'tutornam': 'Chuyên gia Vật lý với phương pháp giảng dạy hiện đại, giúp học sinh nắm vững bản chất kiến thức và rèn luyện kỹ năng giải bài tập nhanh.'
                };

                dummyRequest = await TutorRequest.create({
                    accountId: tutor._id,
                    intro: intros[tutor.username] || 'Tôi là gia sư tâm huyết với mong muốn giúp học sinh cải thiện kết quả học tập.',
                    math_score: 9.0,
                    literature_score: 8.5,
                    chemistry_score: 8.0,
                    physic_score: 8.0,
                    english_score: 9.0,
                    university: tutor.username === 'tutormai' ? 'Đại học Sư phạm TP.HCM' : 'Đại học Bách Khoa',
                    status: 2, // Approved
                    Note: 'Seeded tutor'
                });
            }

            // Shuffle subjects and pick a random number between 1 and 3
            const shuffled = [...createdSubjects].sort(() => 0.5 - Math.random());
            const numSubjects = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
            const selectedSubjects = shuffled.slice(0, numSubjects);

            for (const subject of selectedSubjects) {
                teachSubjectEntries.push({
                    subjectID: subject._id,
                    tutorID: tutor._id,
                    tutorReId: dummyRequest._id,
                    status: true // Active for seeded tutors
                });
            }
        }

        if (teachSubjectEntries.length > 0) {
            await TeachSubject.insertMany(teachSubjectEntries);
            console.log(`Successfully linked ${teachSubjectEntries.length} tutor-subject relationships.`);
        } else {
            console.log('No tutor-subject relationships to create.');
        }

        console.log('Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error('Error with data import:', error);
        process.exit(1);
    }
};

importData();
