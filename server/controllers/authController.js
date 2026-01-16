<<<<<<< Updated upstream
const User = require('../models/User');
=======
const Account = require('../models/Account');
// Role is now embedded in Account model as a string enum
const TutorRequest = require('../models/TutorRequest');
const Evidence = require('../models/Evidence');
const Certificate = require('../models/Certificate');
>>>>>>> Stashed changes
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });

<<<<<<< Updated upstream
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
=======
    // Handle Image Upload
    let imgPath = '';
    if (req.file) {
        const protocol = req.protocol;
        const host = req.get('host');
        // Normalize path separators for URL
        imgPath = `${protocol}://${host}/uploads/${req.file.filename}`;
    } else if (req.body.img) {
        imgPath = req.body.img;
    }

    try {
        // Check if account exists (email or username)
        const emailExists = await Account.findOne({ email });
        if (emailExists) {
            if (req.file) deleteFile(req.file.path);
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        const usernameExists = await Account.findOne({ username });
        if (usernameExists) {
            if (req.file) deleteFile(req.file.path);
            return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
        }

        const phoneExists = await Account.findOne({ phone });
        if (phoneExists) {
            if (req.file) deleteFile(req.file.path);
            return res.status(400).json({ message: 'Số điện thoại đã tồn tại' });
        }

        // Validate Role
        const validRoles = ['admin', 'tutor', 'student'];
        const accountRole = role || 'student';
        if (!validRoles.includes(accountRole)) {
            if (req.file) deleteFile(req.file.path);
            return res.status(400).json({ message: 'Invalid role' });
>>>>>>> Stashed changes
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

<<<<<<< Updated upstream
        const user = await User.create({
            name,
=======
        // Generate Verification Token
        const verificationToken = crypto.randomBytes(20).toString('hex');
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        console.log(`Generated verification token for ${email}: ${verificationToken}`);

        const account = await Account.create({
            role: accountRole,
            full_name,
>>>>>>> Stashed changes
            email,
            password: hashedPassword,
            role: role || 'student'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
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
    const { email, password } = req.body;

    try {
<<<<<<< Updated upstream
        const user = await User.findOne({ email });
=======
        const account = await Account.findOne({ username });

        if (account && (await bcrypt.compare(password, account.password))) {

            // Check if email is verified
            if (!account.isVerified) {
                return res.status(401).json({
                    message: 'Vui lòng xác thực email của bạn trước khi đăng nhập. Kiểm tra hộp thư đến (hoặc spam) để tìm link xác thực.'
                });
            }

            const roleName = account.role || 'student'; // fallback
>>>>>>> Stashed changes

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
<<<<<<< Updated upstream
            res.status(401).json({ message: 'Invalid email or password' });
=======
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
        const account = await Account.findById(req.user.id).select('-password');
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

            // Handle Image Upload (Profile Update)
            if (req.file) {
                // Delete old image if it exists and is a local file
                if (account.img && account.img.includes('/uploads/')) {
                    const oldFilename = account.img.split('/uploads/')[1];
                    const oldPath = path.join(process.cwd(), 'server', 'uploads', oldFilename);
                    deleteFile(oldPath);
                }

                const protocol = req.protocol;
                const host = req.get('host');
                account.img = `${protocol}://${host}/uploads/${req.file.filename}`;
            }

            const updatedAccount = await account.save();

            // Role is now embedded, no need to populate

            res.json(updatedAccount);
        } else {
            res.status(404).json({ message: 'User not found' });
>>>>>>> Stashed changes
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

<<<<<<< Updated upstream
module.exports = { registerUser, loginUser };
=======
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
            certificates, // Expecting JSON string of array of strings or array
            captchaToken // Recaptcha token
        } = req.body;

        // Verify Captcha
        if (!captchaToken) {
            return res.status(400).json({ message: 'Vui lòng hoàn thành Captcha' });
        }

        try {
            const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
            if (recaptchaSecret) {
                const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${captchaToken}`;
                const recaptchaRes = await axios.post(verifyUrl);
                if (!recaptchaRes.data.success) {
                    return res.status(400).json({ message: 'Captcha không hợp lệ, vui lòng thử lại' });
                }
            }
        } catch (err) {
            console.error("Recaptcha Error:", err);
            return res.status(500).json({ message: 'Lỗi xác thực Captcha' });
        }

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
        if (req.files && req.files.evidence && req.files.evidence.length > 0) {
            const protocol = req.protocol;
            const host = req.get('host');

            for (const file of req.files.evidence) {
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

// @desc    Verify email
// @route   GET /api/auth/verify/:token
// @access  Public
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const now = new Date();
        console.log(`Verifying token: ${token}`);

        const account = await Account.findOne({
            verificationToken: token
        });

        if (!account) {
            console.log(`Account not found for token: ${token}`);
            return res.status(400).json({ message: 'Token không hợp lệ' });
        }

        console.log(`Found account: ${account.email}, Expires at: ${account.verificationTokenExpires}`);

        if (account.verificationTokenExpires < now) {
            console.log(`Token expired for: ${account.email}`);
            return res.status(400).json({ message: 'Token đã hết hạn' });
        }

        if (account.isVerified) {
            return res.status(200).json({ message: 'Email đã được xác thực trước đó. Bạn có thể đăng nhập.' });
        }

        // Reset token and set verified
        account.isVerified = true;
        account.verificationToken = undefined;
        account.verificationTokenExpires = undefined;
        await account.save();

        // Role is now embedded, no need to populate

        // We can either return JSON or redirect?
        // Let's return JSON for frontend to handle
        res.status(200).json({ message: 'Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { registerUser, loginUser, getMe, updateUserProfile, createTutorRequest, verifyEmail };
>>>>>>> Stashed changes
