const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const XLSX = require('xlsx');

const Account = require('./models/Account');
const Booking = require('./models/Booking');
const TeachSubject = require('./models/TeachSubject');
const Subject = require('./models/Subject');

dotenv.config({ path: path.join(__dirname, '.env') });

// ── Excel serial → JS Date ──
function excelSerialToDate(serial) {
    const utcDays = Math.floor(serial) - 25569;
    return new Date(utcDays * 86400 * 1000);
}

// ── Parse date from Excel value, force year 2026 ──
function parseBookingDate(value) {
    if (typeof value === 'number') {
        const d = excelSerialToDate(value);
        d.setFullYear(2026);
        return d;
    }
    if (typeof value === 'string') {
        const parts = value.split('/');
        if (parts.length === 3) {
            let [day, month, year] = parts.map(Number);
            if (year < 2000) year = 2026;
            return new Date(year, month - 1, day);
        }
    }
    return null;
}

// ── Random 2-hour slot between 15:00 and 21:00 ──
function randomTimeSlot() {
    const startHours = [15, 16, 17, 18, 19];
    const start = startHours[Math.floor(Math.random() * startHours.length)];
    const pad = (n) => n.toString().padStart(2, '0');
    return { startTime: `${pad(start)}:00`, endTime: `${pad(start + 2)}:00` };
}

// ── Normalize name ──
function normalizeName(name) {
    return name.replace(/\s+/g, ' ').trim();
}

async function main() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected\n');

        // ── 1. Read Excel ──
        const excelPath = path.join(__dirname, '..', 'client', 'src', 'assets', 'Danh sách hsinh .xlsx');
        const wb = XLSX.readFile(excelPath);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

        // ── 2. Load tutors + subject mappings ──
        const allTutors = await Account.find({ role: 'tutor' });
        const allSubjects = await Subject.find({});
        const subjectMap = {};
        allSubjects.forEach(s => { subjectMap[s._id.toString()] = s.sub_name; });
        const allTeachSubjects = await TeachSubject.find({});

        // Build tutor lookup by normalized name
        const tutorLookup = {};
        for (const tutor of allTutors) {
            const ts = allTeachSubjects.filter(t => t.tutorID.toString() === tutor._id.toString());
            const subName = ts.length > 0 ? subjectMap[ts[0].subjectID.toString()] : null;
            tutorLookup[normalizeName(tutor.full_name)] = { tutorDoc: tutor, subject: subName };
        }

        // ── Name aliases for mismatches between Excel and DB ──
        const tutorAliases = {
            'Nguyễn Công Đức Anh': 'Nguyễn Công Anh Đức'
        };

        // ── 3. Parse students from Excel ──
        let currentGrade = '';
        const students = [];

        for (let i = 3; i < rows.length; i++) {
            const row = rows[i];
            const name = row[3] ? row[3].toString().trim() : '';
            const username = row[4] ? row[4].toString().trim() : '';
            const email = row[6] ? row[6].toString().trim() : '';
            const dateVal = row[7];
            let tutorName = row[8] ? row[8].toString().trim() : '';

            if (!name || !username) continue;

            if (row[1] && row[1] !== '') currentGrade = row[1].toString();

            // Apply alias
            const normalizedTutor = normalizeName(tutorName);
            const resolvedTutor = tutorAliases[normalizedTutor] || normalizedTutor;

            students.push({ name, username, email, grade: currentGrade, dateVal, tutorName: resolvedTutor });
        }

        console.log(`📋 Found ${students.length} students in Excel\n`);

        // ── 4. Delete old bookings created by the previous seed ──
        // Find seeded student accounts
        const seededUsernames = students.map(s => s.username);
        const existingStudents = await Account.find({ username: { $in: seededUsernames } });
        const existingIds = existingStudents.map(s => s._id);

        const deleteResult = await Booking.deleteMany({ student: { $in: existingIds } });
        console.log(`🗑️  Deleted ${deleteResult.deletedCount} old bookings\n`);

        // ── 5. Hash password ──
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        // ── 6. Create/update accounts + bookings ──
        let accountsCreated = 0;
        let bookingsCreated = 0;

        for (const s of students) {
            // --- Account ---
            let studentAccount = await Account.findOne({
                $or: [{ username: s.username }, { email: s.email }]
            });

            if (!studentAccount) {
                studentAccount = await Account.create({
                    role: 'student',
                    full_name: s.name,
                    email: s.email,
                    username: s.username,
                    password: hashedPassword,
                    status: true,
                    isVerified: true
                });
                accountsCreated++;
                console.log(`👤 Created account: ${s.name} (${s.username})`);
            } else {
                if (!studentAccount.isVerified) {
                    studentAccount.isVerified = true;
                    await studentAccount.save();
                }
                console.log(`✔️  Account exists: ${s.name} (${s.username})`);
            }

            // --- Tutor ---
            const tutorInfo = tutorLookup[s.tutorName];
            if (!tutorInfo) {
                console.log(`❌ Tutor not found: "${s.tutorName}" — skipping booking for ${s.name}`);
                continue;
            }

            // --- Date ---
            const bookingDate = parseBookingDate(s.dateVal);
            if (!bookingDate) {
                console.log(`❌ Invalid date for ${s.name}: ${s.dateVal}`);
                continue;
            }

            // --- Price based on grade ---
            const price = (s.grade === '10' || s.grade === '11') ? 200000 : 280000;

            // --- Time ---
            const { startTime, endTime } = randomTimeSlot();

            // --- Create booking (APPROVED with price) ---
            await Booking.create({
                student: studentAccount._id,
                tutor: tutorInfo.tutorDoc._id,
                subject: tutorInfo.subject || 'Toán học',
                grade: s.grade,
                date: bookingDate,
                startTime,
                endTime,
                price,
                learningMode: 'online',
                status: 'approved',
                adminApproved: true,
                tutorConfirmed: true,
                note: `Học thử - ${s.name}`
            });

            bookingsCreated++;
            const dateStr = bookingDate.toLocaleDateString('vi-VN');
            console.log(`📅 Booking: ${s.name} → ${tutorInfo.tutorDoc.full_name} (${tutorInfo.subject}) | ${dateStr} ${startTime}-${endTime} | ${price.toLocaleString()}đ | ✅ Approved`);
        }

        console.log(`\n✅ Done! ${accountsCreated} new accounts, ${bookingsCreated} bookings (all approved with price).`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

main();
