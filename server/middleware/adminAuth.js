// Admin Authorization Middleware
const adminAuth = (req, res, next) => {
    // req.user is set by the auth middleware
    if (!req.user) {
        return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Không có quyền truy cập. Chỉ admin mới được phép.' });
    }

    next();
};

module.exports = adminAuth;
