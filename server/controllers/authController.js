const Account = require('../models/Account');
const Role = require('../models/Role');
const TutorRequest = require('../models/TutorRequest');
const Evidence = require('../models/Evidence');
const Certificate = require('../models/Certificate');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT
const generateToken = (id, roleName) => {
    return jwt.sign({ id, role: roleName }, process.env.JWT_SECRET || 'fallback_secret_key_123', {
        expiresIn: '30d',
    });
};

// @desc    Register new account
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const {
        full_name,
        email,
        address,
        phone,
        username,
        password,
        role
    } = req.body;

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Email không đúng định dạng' });
    }

    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: 'Số điện thoại không hợp lệ (VN)' });
    }

    // Handle Image Upload
    let imgPath = '';
    if (req.file) {
        // Create URL path (e.g., http://localhost:5000/uploads/filename.jpg)
        // We will configure static serving for 'uploads' in index.js
        const protocol = req.protocol;
        const host = req.get('host');
        console.log("Uploaded file:", req.file);
        // Normalize path separators for URL
        imgPath = `${protocol}://${host}/uploads/${req.file.filename}`;
    } else if (req.body.img) {
        // Fallback to URL if provided textually (though UI will mostly use file)
        imgPath = req.body.img;
    }

    try {
        // Check if account exists (email or username)
        const emailExists = await Account.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const usernameExists = await Account.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Handle Role
        const roleName = role || 'student';
        let roleDoc = await Role.findOne({ role_name: roleName });

        if (!roleDoc) {
            // Optional: Auto-create role if not exists (for robustness) or return error
            // For now, let's return error if role not seeded, or create it if 'student'/'tutor'
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const account = await Account.create({
            roleID: roleDoc._id,
            full_name,
            email,
            address,
            phone,
            username,
            password: hashedPassword,
            img: imgPath || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', // Default avatar
            status: true
        });

        if (account) {
            res.status(201).json({
                _id: account._id,
                full_name: account.full_name,
                email: account.email,
                username: account.username,
                role: roleDoc.role_name,
                img: account.img,
                token: generateToken(account._id, roleDoc.role_name),
            });
        } else {
            res.status(400).json({ message: 'Invalid account data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const account = await Account.findOne({ username }).populate('roleID');

        if (account && (await bcrypt.compare(password, account.password))) {
            const roleName = account.roleID ? account.roleID.role_name : 'student'; // fallback

            res.json({
                _id: account._id,
                full_name: account.full_name,
                email: account.email,
                username: account.username,
                role: roleName,
                img: account.img,
                token: generateToken(account._id, roleName),
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const account = await Account.findById(req.user.id).select('-password').populate('roleID');
        if (!account) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(account);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const account = await Account.findById(req.user.id);

        if (account) {
            account.full_name = req.body.full_name || account.full_name;
            account.email = req.body.email || account.email;
            account.phone = req.body.phone || account.phone;
            account.address = req.body.address || account.address;

            // Allow updating Bio/Subjects etc if they are sent (even if empty string to clear)
            if (req.body.bio !== undefined) account.bio = req.body.bio;
            if (req.body.subjects !== undefined) account.subjects = req.body.subjects;
            if (req.body.education !== undefined) account.education = req.body.education;
            if (req.body.hourlyRate !== undefined) account.hourlyRate = req.body.hourlyRate;

            // Handle Image Upload
            if (req.file) {
                const protocol = req.protocol;
                const host = req.get('host');
                // Normalize path separators for URL
                account.img = `${protocol}://${host}/uploads/${req.file.filename}`;
            }

            const updatedAccount = await account.save();

            // Populate role for frontend consistency
            await updatedAccount.populate('roleID');

            res.json(updatedAccount);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a tutor upgrade request
// @route   POST /api/auth/tutor-request
// @access  Private
const createTutorRequest = async (req, res) => {
    try {
        const {
            math_score,
            literature_score,
            chemistry_score,
            physic_score,
            english_score,
            university,
            Note,
            certificates // Expecting JSON string of array of strings or array
        } = req.body;

        // Create Tutor Request
        const tutorRequest = await TutorRequest.create({
            accountId: req.user.id,
            math_score,
            literature_score,
            chemistry_score,
            physic_score,
            english_score,
            university,
            Note,
            status: 1 // Pending
        });

        // Handle Certificates
        let certList = [];
        try {
            if (typeof certificates === 'string') {
                certList = JSON.parse(certificates);
            } else if (Array.isArray(certificates)) {
                certList = certificates;
            }
        } catch (e) {
            console.error("Error parsing certificates:", e);
        }

        if (certList && certList.length > 0) {
            for (const certName of certList) {
                await Certificate.create({
                    tutorrequestID: tutorRequest._id,
                    certificate_name: certName,
                    status: 1
                });
            }
        }

        // Handle Evidence Images
        if (req.files && req.files.length > 0) {
            const protocol = req.protocol;
            const host = req.get('host');

            for (const file of req.files) {
                const imgPath = `${protocol}://${host}/uploads/evidence/${file.filename}`;
                await Evidence.create({
                    tutorrequestID: tutorRequest._id,
                    img: imgPath,
                    status: 1
                });
            }
        }

        res.status(201).json({ message: 'Yêu cầu nâng cấp đã được gửi thành công!', requestId: tutorRequest._id });

    } catch (error) {
        console.error("Create Tutor Request Error:", error);
        res.status(500).json({ message: 'Lỗi server khi tạo yêu cầu.' });
    }
};

module.exports = { registerUser, loginUser, getMe, updateUserProfile, createTutorRequest };
