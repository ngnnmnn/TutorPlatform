const Account = require('../models/Account');
const Role = require('../models/Role');
const TutorRequest = require('../models/TutorRequest');
const Evidence = require('../models/Evidence');
const Certificate = require('../models/Certificate');
const TeachSubject = require('../models/TeachSubject');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const axios = require('axios');
const sendEmail = require('../utils/sendEmail');
const fs = require('fs');
const path = require('path');

// Generate JWT
const generateToken = (id, roleName) => {
    return jwt.sign({ id, role: roleName }, process.env.JWT_SECRET || 'fallback_secret_key_123', {
        expiresIn: '30d',
    });
};

// Helper to delete file
const deleteFile = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
        } catch (err) {
            console.error("Error deleting file:", err);
        }
    }
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
        role,
        captchaToken // Recaptcha token from client
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

    // Verify Captcha
    if (!captchaToken) {
        return res.status(400).json({ message: 'Vui lòng hoàn thành Captcha' });
    }

    try {
        const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
        // If not set, maybe skip for dev? but better to enforce or mock. 
        // For now assuming it is set or we handle error.
        if (recaptchaSecret) {
            const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${captchaToken}`;
            const recaptchaRes = await axios.post(verifyUrl);
            if (!recaptchaRes.data.success) {
                if (req.file) deleteFile(req.file.path);
                return res.status(400).json({ message: 'Captcha không hợp lệ, vui lòng thử lại' });
            }
        }
    } catch (err) {
        console.error("Recaptcha Error:", err);
        if (req.file) deleteFile(req.file.path);
        return res.status(500).json({ message: 'Lỗi xác thực Captcha' });
    }

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

        // Handle Role
        const roleName = role || 'student';
        let roleDoc = await Role.findOne({ role_name: roleName });

        if (!roleDoc) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate Verification Token
        const verificationToken = crypto.randomBytes(20).toString('hex');
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        console.log(`Generated verification token for ${email}: ${verificationToken}`);

        const account = await Account.create({
            roleID: roleDoc._id,
            full_name,
            email,
            address,
            phone,
            username,
            password: hashedPassword,
            img: imgPath || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', // Default avatar
            status: true,
            isVerified: false, // Not verified yet
            verificationToken,
            verificationTokenExpires
        });

        if (account) {
            // Send Verification Email
            const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify/${verificationToken}`;

            const message = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h1 style="color: #4F46E5;">Xác thực Email của bạn</h1>
                    <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>TutorPlatform</strong>.</p>
                    <p>Vui lòng click vào nút bên dưới để xác thực email và hoàn tất đăng ký:</p>
                    <div style="margin: 30px 0;">
                        <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email</a>
                    </div>
                    <p style="font-size: 14px; color: #666;">Link này sẽ hết hạn sau 24 giờ.</p>
                    <p style="font-size: 12px; color: #999; margin-top: 30px;">Nếu nút trên không hoạt động, hãy copy link này: ${verificationUrl}</p>
                </div>
            `;

            try {
                await sendEmail({
                    email: account.email,
                    subject: 'Xác thực tài khoản TutorPlatform',
                    message
                });

                res.status(201).json({
                    message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
                    success: true
                });
            } catch (error) {
                console.error("Email send error:", error);
                // Even if email fails, account is created. Maybe returning a warning?
                // Or deleting the account? 
                // For now, let's keep it but tell user.
                res.status(201).json({
                    message: 'Đăng ký thành công nhưng không thể gửi email xác thực. Vui lòng liên hệ admin.',
                    success: true
                });
            }
        } else {
            if (req.file) deleteFile(req.file.path);
            res.status(400).json({ message: 'Invalid account data' });
        }
    } catch (error) {
        console.error(error);
        if (req.file) deleteFile(req.file.path);
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

            // Check if email is verified
            if (!account.isVerified) {
                return res.status(401).json({
                    message: 'Vui lòng xác thực email của bạn trước khi đăng nhập. Kiểm tra hộp thư đến (hoặc spam) để tìm link xác thực.'
                });
            }

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
            certificates, // Expecting JSON string of array of strings or array
            subjectIDs, // Expecting JSON string of array of subject IDs or array
            intro,
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
            intro,
            Note,
            status: 1 // Pending
        });

        // Handle Selected Subjects
        let subList = [];
        try {
            if (typeof subjectIDs === 'string') {
                subList = JSON.parse(subjectIDs);
            } else if (Array.isArray(subjectIDs)) {
                subList = subjectIDs;
            }
        } catch (e) {
            console.error("Error parsing subjectIDs:", e);
        }

        if (subList && subList.length > 0) {
            if (subList.length > 3) {
                return res.status(400).json({ message: 'Bạn chỉ được chọn tối đa 3 môn học.' });
            }
            for (const subId of subList) {
                await TeachSubject.create({
                    subjectID: subId,
                    tutorID: req.user.id,
                    tutorReId: tutorRequest._id,
                    status: false // Not active until request is approved
                });
            }
        } else {
            return res.status(400).json({ message: 'Vui lòng chọn ít nhất 1 môn học để dạy.' });
        }

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

        // Populate role for response (if we want to auto-login, but typically we redirect to login)
        await account.populate('roleID');

        // We can either return JSON or redirect?
        // Let's return JSON for frontend to handle
        res.status(200).json({ message: 'Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { registerUser, loginUser, getMe, updateUserProfile, createTutorRequest, verifyEmail };
