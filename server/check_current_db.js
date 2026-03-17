const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function main() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected');

        const Account = require('./models/Account');
        const Subject = require('./models/Subject');
        const TeachSubject = require('./models/TeachSubject');

        // Get all tutors
        const tutors = await Account.find({ role: 'tutor' }, { full_name: 1, username: 1 });
        
        // Get all subjects
        const subjects = await Subject.find({});
        const subjectMap = {};
        subjects.forEach(s => { subjectMap[s._id.toString()] = s.sub_name; });

        // Get all teach-subject relationships
        const teachSubjects = await TeachSubject.find({});
        
        console.log('\n--- Tutor-Subject Mapping ---');
        for (const tutor of tutors) {
            const ts = teachSubjects.filter(t => t.tutorID.toString() === tutor._id.toString());
            const subNames = ts.map(t => subjectMap[t.subjectID.toString()] || 'unknown');
            console.log(`${tutor.full_name} (${tutor.username}): [${subNames.join(', ')}]`);
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();
