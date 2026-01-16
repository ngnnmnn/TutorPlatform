const Account = require('../models/Account');
const TutorRequest = require('../models/TutorRequest');
const Certificate = require('../models/Certificate');
const Booking = require('../models/Booking');
const Combo = require('../models/Combo');

// @desc    Get all tutors with filters
// @route   GET /api/tutors
// @access  Public
const getTutors = async (req, res) => {
    try {
        const { keyword, subject } = req.query;

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

            return {
                ...account._doc,
                subject: request.subject || 'Gia sư',
                subjects: [request.subject || 'Chưa cập nhật'],
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
                numReviews: account.numReviews || 0,
                requestNote: request.Note
            };
        }));

        tutors = tutors.filter(t => t !== null);

        // 4. Manual filtering by subject or secondary keyword search
        if (subject) {
            tutors = tutors.filter(t =>
                t.subject.toLowerCase().includes(subject.toLowerCase())
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
                        subject: request.subject || 'Gia sư',
                        subjects: [request.subject || 'Chưa cập nhật'],
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

        res.json(tutors);
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
                subject: request.subject,
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
                subjects: [request.subject],
                bio: request.Note,
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

module.exports = { getTutors, getTutorById };
