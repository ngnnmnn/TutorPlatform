// Fix: Create the 2 missing bookings for students whose tutor "Nguyễn Công Đức Anh" 
// was not matched (DB name is "Nguyễn Công Anh Đức")
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Account = require('./models/Account');
const Booking = require('./models/Booking');
const TeachSubject = require('./models/TeachSubject');
const Subject = require('./models/Subject');

dotenv.config({ path: path.join(__dirname, '.env') });

async function main() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected');

        // Find the tutor "Nguyễn Công Anh Đức"
        const tutor = await Account.findOne({ username: 'nguyenconganhduc' });
        if (!tutor) { console.log('Tutor not found!'); process.exit(1); }

        // Find what subject they teach
        const ts = await TeachSubject.findOne({ tutorID: tutor._id });
        const subject = await Subject.findById(ts.subjectID);
        console.log(`Tutor: ${tutor.full_name} teaches ${subject.sub_name}`);

        // The 2 students who need bookings
        const students = [
            { username: 'lamstorm2008', date: new Date(2026, 1, 28) },  // 28/2/2026
            { username: 'thangpro77', date: new Date(2026, 1, 28) }    // 28/2/2026
        ];

        for (const s of students) {
            const student = await Account.findOne({ username: s.username });
            if (!student) { console.log(`Student ${s.username} not found!`); continue; }

            // Random 2-hour slot 15:00-21:00
            const starts = [15, 16, 17, 18, 19];
            const start = starts[Math.floor(Math.random() * starts.length)];
            const pad = (n) => n.toString().padStart(2, '0');

            await Booking.create({
                student: student._id,
                tutor: tutor._id,
                subject: subject.sub_name,
                grade: '12',
                date: s.date,
                startTime: `${pad(start)}:00`,
                endTime: `${pad(start + 2)}:00`,
                learningMode: 'online',
                status: 'pending',
                note: `Học thử - ${student.full_name}`
            });
            console.log(`✅ Booking created: ${student.full_name} → ${tutor.full_name} on ${s.date.toLocaleDateString('vi-VN')}`);
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();
