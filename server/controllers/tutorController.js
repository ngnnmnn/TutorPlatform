const Account = require('../models/Account');
const fs = require('fs');
const path = require('path');

// Helper to delete file
const deleteFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', err);
        });
    }
};

// @desc    Get all tutors with filters
// @route   GET /api/tutors
// @access  Public
const getTutors = async (req, res) => {
    try {
        const { keyword, subject, minPrice, maxPrice } = req.query;

        // Base query: Only approved tutors (and potentially ensure they are tutors by role if needed)
        // Since we merged, we can rely on isApproved=true which defaults to false for normal users
        let query = { isApproved: true };

        if (keyword) {
            query.$or = [
                { full_name: { $regex: keyword, $options: 'i' } },
                { bio: { $regex: keyword, $options: 'i' } },
                { subjects: { $regex: keyword, $options: 'i' } }
            ];
        }

        if (subject) {
            query.subjects = { $regex: subject, $options: 'i' };
        }

        if (minPrice || maxPrice) {
            query.hourlyRate = {};
            if (minPrice) query.hourlyRate.$gte = Number(minPrice);
            if (maxPrice) query.hourlyRate.$lte = Number(maxPrice);
        }

        const tutors = await Account.find(query)
            .select('-password') // Exclude password
            .sort({ rating: -1 });

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
        const tutor = await Account.findById(req.params.id).select('-password');

        if (tutor && tutor.isApproved) {
            res.json(tutor);
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
            // Delete old image if exists
            if (account.img && account.img.includes('/uploads/')) {
                const oldFilename = account.img.split('/uploads/')[1];
                const oldPath = path.join(process.cwd(), 'uploads', oldFilename);
                deleteFile(oldPath);
            }

            const protocol = req.protocol;
            const host = req.get('host');
            account.img = `${protocol}://${host}/uploads/${req.files.img[0].filename}`;
        }

        // Handle existing evidence images
        if (req.body.existingEvidenceImages !== undefined) {
            try {
                const existingImages = typeof req.body.existingEvidenceImages === 'string'
                    ? JSON.parse(req.body.existingEvidenceImages)
                    : req.body.existingEvidenceImages;

                // Find and delete removed images
                if (account.evidenceImages && account.evidenceImages.length > 0) {
                    account.evidenceImages.forEach(oldImg => {
                        if (!existingImages.includes(oldImg) && oldImg.includes('/uploads/evidence/')) {
                            const filename = oldImg.split('/uploads/evidence/')[1];
                            const filePath = path.join(process.cwd(), 'uploads', 'evidence', filename);
                            deleteFile(filePath);
                        }
                    });
                }

                account.evidenceImages = existingImages;
            } catch (e) {
                console.error('Error parsing existingEvidenceImages:', e);
            }
        }

        // Handle new evidence image uploads
        if (req.files && req.files.evidence && req.files.evidence.length > 0) {
            const protocol = req.protocol;
            const host = req.get('host');
            const newEvidenceUrls = req.files.evidence.map(file =>
                `${protocol}://${host}/uploads/evidence/${file.filename}`
            );
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
