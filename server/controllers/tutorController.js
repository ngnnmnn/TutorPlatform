const Account = require('../models/Account');
const TutorRequest = require('../models/TutorRequest');
const Certificate = require('../models/Certificate');
const Booking = require('../models/Booking');
const Combo = require('../models/Combo');
const TeachSubject = require('../models/TeachSubject');

// @desc    Get all tutors with filters
// @route   GET /api/tutors
// @access  Public
const getTutors = async (req, res) => {
    try {
        const { keyword, subject, minRating, minBookingCount, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        // 1. Find all approved tutor accounts
        let accountQuery = { isApproved: true };
        if (keyword) {
            accountQuery.full_name = { $regex: keyword, $options: 'i' };
        }

        const accounts = await Account.find(accountQuery).select('-password');

        // 2. Find their tutor requests
        const requests = await TutorRequest.find({
            accountId: { $in: accounts.map(a => a._id) },
            status: 2
        });

        // 3. Fetch Combo prices for tiered logic
        const basicCombo = await Combo.findOne({ combo_name: { $regex: /Cơ bản/i } });
        const vipCombo = await Combo.findOne({ combo_name: { $regex: /VIP/i } });

        const price1 = basicCombo ? basicCombo.price : 150000;
        const price2 = vipCombo ? vipCombo.price : 200000;

        // 4. Merge and Filter
        let tutors = await Promise.all(accounts.map(async (account) => {
            const request = requests.find(r => r.accountId.toString() === account._id.toString());
            if (!request) return null;

            const bookingCount = await Booking.countDocuments({
                tutor: account._id,
                status: { $in: ['confirmed', 'completed'] }
            });

            const displayPrice = bookingCount < 50 ? price1 : price2;

            // Fetch subjects
            const teachSubjects = await TeachSubject.find({ tutorReId: request._id }).populate('subjectID');
            const subjectNames = teachSubjects.map(ts => ts.subjectID?.sub_name).filter(Boolean);

            return {
                ...account._doc,
                subject: 'Gia sư',
                subjects: subjectNames,
                bio: request.intro || request.Note || 'Chưa có giới thiệu',
                university: request.university || 'Chưa cập nhật',
                education: {
                    school: request.university || 'Chưa cập nhật',
                    degree: 'Gia sư'
                },
                hourlyRate: displayPrice,
                bookingCount: bookingCount,
                displayPrice: displayPrice,
                rating: account.rating || 0,
                numReviews: account.numReviews || 0,
                requestNote: request.Note
            };
        }));

        tutors = tutors.filter(t => t !== null);

        // 4. Manual filtering by subject or secondary keyword search
        if (subject) {
            tutors = tutors.filter(t =>
                t.subjects.some(s => s.toLowerCase().includes(subject.toLowerCase()))
            );
        }

        // Re-run if keyword didn't match names but might match bio
        if (keyword && tutors.length === 0) {
            const reqsByNote = await TutorRequest.find({
                status: 2,
                $or: [
                    { Note: { $regex: keyword, $options: 'i' } },
                    { subject: { $regex: keyword, $options: 'i' } },
                    { university: { $regex: keyword, $options: 'i' } }
                ]
            });

            if (reqsByNote.length > 0) {
                const accountsByReq = await Account.find({
                    _id: { $in: reqsByNote.map(r => r.accountId) },
                    isApproved: true
                }).select('-password');

                const extraTutors = await Promise.all(accountsByReq.map(async (account) => {
                    const request = reqsByNote.find(r => r.accountId.toString() === account._id.toString());

                    const bookingCount = await Booking.countDocuments({
                        tutor: account._id,
                        status: { $in: ['confirmed', 'completed'] }
                    });
                    const displayPrice = bookingCount < 50 ? price1 : price2;

                    return {
                        ...account._doc,
                        subject: 'Gia sư',
                        subjects: [],
                        bio: request.Note || 'Chưa có giới thiệu',
                        university: request.university || 'Chưa cập nhật',
                        education: {
                            school: request.university || 'Chưa cập nhật',
                            degree: 'Gia sư'
                        },
                        hourlyRate: displayPrice,
                        bookingCount: bookingCount,
                        displayPrice: displayPrice,
                        rating: account.rating || 5.0,
                        numReviews: account.numReviews || 0
                    };
                }));

                // Merge and remove duplicates
                const existingIds = new Set(tutors.map(t => t._id.toString()));
                extraTutors.forEach(t => {
                    if (!existingIds.has(t._id.toString())) tutors.push(t);
                });
            }
        }

        // 5. Apply Rating and Booking Count Filters
        if (minRating) {
            tutors = tutors.filter(t => t.rating >= Number(minRating));
        }
        if (minBookingCount) {
            tutors = tutors.filter(t => t.bookingCount >= Number(minBookingCount));
        }

        // 6. Pagination
        const total = tutors.length;
        const paginatedTutors = tutors.slice(skip, skip + Number(limit));

        res.json({
            tutors: paginatedTutors,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single tutor by ID
// @route   GET /api/tutors/:id
// @access  Public
const getTutorById = async (req, res) => {
    try {
        const account = await Account.findById(req.params.id).select('-password');

        if (account && account.isApproved) {
            // Find approved TutorRequest
            const request = await TutorRequest.findOne({ accountId: account._id, status: 2 });

            if (!request) {
                return res.status(404).json({ message: 'Tutor request details not found' });
            }

            // Find Certificates
            const certificates = await Certificate.find({ tutorrequestID: request._id });

            // Find Subjects from TeachSubject using tutorReId (same as Admin)
            const teachSubjects = await TeachSubject.find({ tutorReId: request._id }).populate('subjectID');
            const subjectList = teachSubjects.map(ts => ts.subjectID ? ts.subjectID.sub_name : null).filter(s => s);

            // Count completed/confirmed bookings for dynamic pricing
            const bookingCount = await Booking.countDocuments({
                tutor: account._id,
                status: { $in: ['confirmed', 'completed'] }
            });

            // Fetch Combo prices
            const combo1 = await Combo.findOne({ combo_name: { $regex: /Gói 1 Slot \(Cơ bản\)/i } });
            const combo2 = await Combo.findOne({ combo_name: { $regex: /Gói 1 Slot \(VIP\)/i } });

            const price1 = combo1 ? combo1.price : 150000;
            const price2 = combo2 ? combo2.price : 200000;

            const displayPrice = bookingCount < 50 ? price1 : price2;

            // Merge data
            const tutorData = {
                ...account._doc,
                subject: 'Gia sư',
                university: request.university,
                Note: request.Note,
                scores: {
                    math: request.math_score,
                    literature: request.literature_score,
                    chemistry: request.chemistry_score,
                    physic: request.physic_score,
                    english: request.english_score
                },
                salary: request.salary,
                bookingCount,
                displayPrice,
                certificates: certificates.map(c => c.certificate_name),
                // Provide fallbacks for frontend compatibility if it expects specific objects
                education: {
                    school: request.university,
                    degree: 'Gia sư'
                },
                subjects: subjectList,
                bio: request.Note,
                intro: request.intro,
                hourlyRate: displayPrice
            };

            res.json(tutorData);
        } else {
            res.status(404).json({ message: 'Tutor not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

// @desc    Update tutor profile
// @route   PUT /api/tutors/profile
// @access  Private (Tutor only)
const updateTutorProfile = async (req, res) => {
    try {
        const account = await Account.findById(req.user.id);

        if (!account) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Only tutors can update tutor profile
        if (account.role !== 'tutor') {
            return res.status(403).json({ message: 'Access denied. Tutor only.' });
        }

        // Update basic info
        account.full_name = req.body.full_name || account.full_name;
        account.email = req.body.email || account.email;
        account.phone = req.body.phone || account.phone;
        account.address = req.body.address || account.address;

        // Update tutor-specific fields
        if (req.body.bio !== undefined) account.bio = req.body.bio;
        if (req.body.subjects !== undefined) {
            if (typeof req.body.subjects === 'string') {
                account.subjects = req.body.subjects.split(',').map(s => s.trim()).filter(s => s);
            } else {
                account.subjects = req.body.subjects;
            }
        }
        if (req.body.hourlyRate !== undefined) account.hourlyRate = Number(req.body.hourlyRate);

        // Update education object
        if (req.body.education !== undefined) {
            try {
                const education = typeof req.body.education === 'string'
                    ? JSON.parse(req.body.education)
                    : req.body.education;
                account.education = {
                    school: education.school || account.education?.school,
                    degree: education.degree || account.education?.degree,
                    graduationYear: education.graduationYear || account.education?.graduationYear
                };
            } catch (e) {
                // If parsing fails, treat as degree string
                account.education = { degree: req.body.education };
            }
        }

        // Update scores
        if (req.body.scores !== undefined) {
            try {
                const scores = typeof req.body.scores === 'string'
                    ? JSON.parse(req.body.scores)
                    : req.body.scores;
                account.scores = {
                    math: scores.math || account.scores?.math,
                    literature: scores.literature || account.scores?.literature,
                    chemistry: scores.chemistry || account.scores?.chemistry,
                    physics: scores.physics || account.scores?.physics,
                    english: scores.english || account.scores?.english
                };
            } catch (e) {
                console.error('Error parsing scores:', e);
            }
        }

        // Update certificates
        if (req.body.certificates !== undefined) {
            try {
                const certificates = typeof req.body.certificates === 'string'
                    ? JSON.parse(req.body.certificates)
                    : req.body.certificates;
                account.certificates = certificates.map(cert => ({
                    name: cert.name,
                    issuedBy: cert.issuedBy,
                    year: cert.year ? Number(cert.year) : null
                }));
            } catch (e) {
                console.error('Error parsing certificates:', e);
            }
        }

        // Handle profile image upload
        if (req.files && req.files.img && req.files.img[0]) {
            account.img = req.files.img[0].path; // Cloudinary URL
        }

        // Handle existing evidence images
        if (req.body.existingEvidenceImages !== undefined) {
            try {
                const existingImages = typeof req.body.existingEvidenceImages === 'string'
                    ? JSON.parse(req.body.existingEvidenceImages)
                    : req.body.existingEvidenceImages;

                account.evidenceImages = existingImages;
            } catch (e) {
                console.error('Error parsing existingEvidenceImages:', e);
            }
        }

        // Handle new evidence image uploads
        if (req.files && req.files.evidence && req.files.evidence.length > 0) {
            const newEvidenceUrls = req.files.evidence.map(file => file.path); // Cloudinary URLs
            account.evidenceImages = [...(account.evidenceImages || []), ...newEvidenceUrls];
        }

        const updatedAccount = await account.save();

        // Return without password
        const { password, ...accountData } = updatedAccount.toObject();
        res.json(accountData);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getTutors, getTutorById, updateTutorProfile };
