const TutorRequest = require('../models/TutorRequest');
const Account = require('../models/Account');
const Evidence = require('../models/Evidence');
const Certificate = require('../models/Certificate');
const sendEmail = require('../utils/sendEmail');

// Status: 1 = Pending, 2 = Approved, 3 = Rejected

// @desc    Get all tutor requests
// @route   GET /api/admin/tutor-requests
// @access  Private/Admin
const getAllTutorRequests = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        let query = {};
        if (status) {
            query.status = parseInt(status);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const tutorRequests = await TutorRequest.find(query)
            .populate('accountId', 'full_name email phone username img')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get certificates and evidence for each request
        const requestsWithDetails = await Promise.all(
            tutorRequests.map(async (request) => {
                const certificates = await Certificate.find({ tutorrequestID: request._id });
                const evidence = await Evidence.find({ tutorrequestID: request._id });

                return {
                    ...request.toObject(),
                    certificates,
                    evidence
                };
            })
        );

        const total = await TutorRequest.countDocuments(query);

        res.json({
            requests: requestsWithDetails,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalRequests: total,
                hasMore: skip + tutorRequests.length < total
            }
        });
    } catch (error) {
        console.error('Get Tutor Requests Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single tutor request by ID
// @route   GET /api/admin/tutor-requests/:id
// @access  Private/Admin
const getTutorRequestById = async (req, res) => {
    try {
        const tutorRequest = await TutorRequest.findById(req.params.id)
            .populate('accountId', 'full_name email phone username img address createdAt');

        if (!tutorRequest) {
            return res.status(404).json({ message: 'Không tìm thấy yêu cầu' });
        }

        const certificates = await Certificate.find({ tutorrequestID: tutorRequest._id });
        const evidence = await Evidence.find({ tutorrequestID: tutorRequest._id });

        res.json({
            ...tutorRequest.toObject(),
            certificates,
            evidence
        });
    } catch (error) {
        console.error('Get Tutor Request Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Approve tutor request
// @route   PUT /api/admin/tutor-requests/:id/approve
// @access  Private/Admin
const approveTutorRequest = async (req, res) => {
    try {
        const tutorRequest = await TutorRequest.findById(req.params.id);

        if (!tutorRequest) {
            return res.status(404).json({ message: 'Không tìm thấy yêu cầu' });
        }

        if (tutorRequest.status !== 1) {
            return res.status(400).json({ message: 'Yêu cầu này đã được xử lý trước đó' });
        }

        // Update request status to Approved
        tutorRequest.status = 2;
        await tutorRequest.save();

        // Get certificates and evidence from request
        const certificates = await Certificate.find({ tutorrequestID: tutorRequest._id });
        const evidence = await Evidence.find({ tutorrequestID: tutorRequest._id });

        // Update user role to tutor and copy data
        const account = await Account.findById(tutorRequest.accountId);
        if (account) {
            account.role = 'tutor';
            account.isApproved = true;
            account.tutorRequestId = tutorRequest._id;

            // Copy scores
            account.scores = {
                math: tutorRequest.math_score,
                literature: tutorRequest.literature_score,
                chemistry: tutorRequest.chemistry_score,
                physics: tutorRequest.physic_score,
                english: tutorRequest.english_score
            };

            // Copy certificates
            account.certificates = certificates.map(cert => ({
                name: cert.certificate_name,
                issuedBy: '',
                year: new Date().getFullYear()
            }));

            // Copy evidence images
            account.evidenceImages = evidence.map(ev => ev.img);

            // Set default education from university in request
            if (!account.education || !account.education.school) {
                account.education = {
                    school: tutorRequest.university,
                    degree: 'Sinh viên/Cử nhân',
                    graduationYear: new Date().getFullYear()
                };
            }

            await account.save();

            // Send approval email
            try {
                const message = `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h1 style="color: #10B981;">🎉 Chúc mừng! Yêu cầu trở thành Gia sư đã được duyệt</h1>
                        <p>Xin chào <strong>${account.full_name}</strong>,</p>
                        <p>Chúng tôi vui mừng thông báo rằng yêu cầu trở thành gia sư của bạn đã được <strong style="color: #10B981;">CHẤP THUẬN</strong>!</p>
                        <p>Bạn có thể đăng nhập và bắt đầu:</p>
                        <ul>
                            <li>Cập nhật hồ sơ gia sư của bạn</li>
                            <li>Thiết lập lịch dạy</li>
                            <li>Nhận học viên đầu tiên</li>
                        </ul>
                        <div style="margin: 30px 0;">
                            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/tutors/${account._id}" 
                               style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                                Xem hồ sơ gia sư của tôi
                            </a>
                        </div>
                        <p>Cảm ơn bạn đã tham gia TutorPlatform!</p>
                    </div>
                `;

                await sendEmail({
                    email: account.email,
                    subject: '🎉 Yêu cầu trở thành Gia sư đã được duyệt - TutorPlatform',
                    message
                });
            } catch (emailError) {
                console.error('Email send error:', emailError);
            }
        }

        res.json({
            message: 'Đã duyệt yêu cầu thành công',
            tutorRequest: tutorRequest
        });
    } catch (error) {
        console.error('Approve Request Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reject tutor request
// @route   PUT /api/admin/tutor-requests/:id/reject
// @access  Private/Admin
const rejectTutorRequest = async (req, res) => {
    try {
        const { reason } = req.body;
        const tutorRequest = await TutorRequest.findById(req.params.id);

        if (!tutorRequest) {
            return res.status(404).json({ message: 'Không tìm thấy yêu cầu' });
        }

        if (tutorRequest.status !== 1) {
            return res.status(400).json({ message: 'Yêu cầu này đã được xử lý trước đó' });
        }

        // Update request status to Rejected
        tutorRequest.status = 3;
        tutorRequest.Note = reason || 'Yêu cầu không đạt tiêu chuẩn';
        await tutorRequest.save();

        // Send rejection email
        const account = await Account.findById(tutorRequest.accountId);
        if (account) {
            try {
                const message = `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h1 style="color: #EF4444;">Thông báo về yêu cầu trở thành Gia sư</h1>
                        <p>Xin chào <strong>${account.full_name}</strong>,</p>
                        <p>Chúng tôi rất tiếc phải thông báo rằng yêu cầu trở thành gia sư của bạn <strong style="color: #EF4444;">chưa được chấp thuận</strong>.</p>
                        ${reason ? `<p><strong>Lý do:</strong> ${reason}</p>` : ''}
                        <p>Bạn có thể:</p>
                        <ul>
                            <li>Cập nhật hồ sơ và bổ sung thêm thông tin</li>
                            <li>Gửi lại yêu cầu sau khi hoàn thiện</li>
                            <li>Liên hệ hỗ trợ nếu cần thêm thông tin</li>
                        </ul>
                        <p>Cảm ơn bạn đã quan tâm đến TutorPlatform!</p>
                    </div>
                `;

                await sendEmail({
                    email: account.email,
                    subject: 'Thông báo về yêu cầu trở thành Gia sư - TutorPlatform',
                    message
                });
            } catch (emailError) {
                console.error('Email send error:', emailError);
            }
        }

        res.json({
            message: 'Đã từ chối yêu cầu',
            tutorRequest: tutorRequest
        });
    } catch (error) {
        console.error('Reject Request Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await Account.countDocuments();
        const totalTutors = await Account.countDocuments({ role: 'tutor' });
        const totalStudents = await Account.countDocuments({ role: 'student' });

        const pendingRequests = await TutorRequest.countDocuments({ status: 1 });
        const approvedRequests = await TutorRequest.countDocuments({ status: 2 });
        const rejectedRequests = await TutorRequest.countDocuments({ status: 3 });

        // Recent requests
        const recentRequests = await TutorRequest.find()
            .populate('accountId', 'full_name email img')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            users: {
                total: totalUsers,
                tutors: totalTutors,
                students: totalStudents
            },
            requests: {
                pending: pendingRequests,
                approved: approvedRequests,
                rejected: rejectedRequests,
                total: pendingRequests + approvedRequests + rejectedRequests
            },
            recentRequests
        });
    } catch (error) {
        console.error('Get Stats Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getAllTutorRequests,
    getTutorRequestById,
    approveTutorRequest,
    rejectTutorRequest,
    getDashboardStats
};
