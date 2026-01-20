const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Account = require('./models/Account');
const Subject = require('./models/Subject');
const TeachSubject = require('./models/TeachSubject');
const TutorRequest = require('./models/TutorRequest');

dotenv.config({ path: './.env' });

const seedSpecificTutors = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        // 1. Define the target mapping
        const assignments = {
            'tutornam': ['Toán học', 'Ngữ văn'],
            'tutormai': ['Tiếng Anh', 'Toán học', 'Hóa học']
        };

        for (const [username, subjectNames] of Object.entries(assignments)) {
            console.log(`Processing ${username}...`);

            // Find Tutor
            const tutor = await Account.findOne({ username: username });
            if (!tutor) {
                console.log(`Tutor ${username} not found! Skipping.`);
                continue;
            }

            // Find Approved Tutor Request
            // Using logic from seeder_subject.js: if not found, maybe create a dummy or skip?
            // User said "2 tutor duoc approve", implying requests exist.
            const tutorRequest = await TutorRequest.findOne({ accountId: tutor._id, status: 2 }); // 2 usually means approved
            if (!tutorRequest) {
                console.log(`Approved TutorRequest for ${username} not found! Skipping.`);
                // Fallback: Try finding ANY request or log error
                continue;
            }

            // Find Subjects
            const subjects = await Subject.find({ sub_name: { $in: subjectNames } });

            // Map found subjects to names to verify all were found
            const foundNames = subjects.map(s => s.sub_name);
            const missing = subjectNames.filter(n => !foundNames.includes(n));
            if (missing.length > 0) {
                console.log(`Warning: Could not find subjects: ${missing.join(', ')}`);
            }

            // Delete existing subjects for this tutor to ensure clean state
            await TeachSubject.deleteMany({ tutorID: tutor._id });

            // Create new TeachSubject entries
            const newEntries = subjects.map(sub => ({
                subjectID: sub._id,
                tutorID: tutor._id,
                tutorReId: tutorRequest._id,
                status: true
            }));

            if (newEntries.length > 0) {
                await TeachSubject.insertMany(newEntries);
                console.log(`Assigned [${foundNames.join(', ')}] to ${username}`);
            }
        }

        console.log('Specific seeding completed.');
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedSpecificTutors();
