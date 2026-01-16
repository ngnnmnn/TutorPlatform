// 404 Not Found Middleware
const notFound = (req, res, next) => {
    // Check if request expects JSON (API calls)
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(404).json({
            success: false,
            message: `Route not found: ${req.method} ${req.originalUrl}`,
            statusCode: 404
        });
    }

    // Return beautiful HTML 404 page
    res.status(404).send(`
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Không tìm thấy trang | TutorPlatform</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
            overflow: hidden;
            position: relative;
        }
        
        /* Animated background particles */
        .particles {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 0;
        }
        
        .particle {
            position: absolute;
            width: 10px;
            height: 10px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            animation: float 15s infinite;
        }
        
        .particle:nth-child(1) { left: 10%; animation-delay: 0s; animation-duration: 12s; }
        .particle:nth-child(2) { left: 20%; animation-delay: 2s; animation-duration: 14s; }
        .particle:nth-child(3) { left: 30%; animation-delay: 4s; animation-duration: 16s; }
        .particle:nth-child(4) { left: 40%; animation-delay: 1s; animation-duration: 13s; }
        .particle:nth-child(5) { left: 50%; animation-delay: 3s; animation-duration: 15s; }
        .particle:nth-child(6) { left: 60%; animation-delay: 5s; animation-duration: 11s; }
        .particle:nth-child(7) { left: 70%; animation-delay: 2s; animation-duration: 17s; }
        .particle:nth-child(8) { left: 80%; animation-delay: 4s; animation-duration: 14s; }
        .particle:nth-child(9) { left: 90%; animation-delay: 1s; animation-duration: 12s; }
        .particle:nth-child(10) { left: 15%; animation-delay: 3s; animation-duration: 16s; }
        
        @keyframes float {
            0%, 100% {
                transform: translateY(100vh) scale(0);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) scale(1);
                opacity: 0;
            }
        }
        
        .container {
            text-align: center;
            padding: 40px;
            z-index: 1;
            position: relative;
        }
        
        .error-code {
            font-size: 180px;
            font-weight: 700;
            background: linear-gradient(135deg, #818cf8 0%, #c4b5fd 50%, #f0abfc 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            line-height: 1;
            margin-bottom: 20px;
            animation: pulse 2s ease-in-out infinite;
            text-shadow: 0 0 60px rgba(129, 140, 248, 0.3);
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
        }
        
        .error-icon {
            font-size: 80px;
            margin-bottom: 20px;
            animation: bounce 2s ease-in-out infinite;
        }
        
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }
        
        h1 {
            color: #e0e7ff;
            font-size: 32px;
            font-weight: 600;
            margin-bottom: 16px;
        }
        
        p {
            color: #a5b4fc;
            font-size: 18px;
            margin-bottom: 40px;
            max-width: 500px;
            line-height: 1.6;
        }
        
        .path-info {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 12px 24px;
            border-radius: 8px;
            color: #c7d2fe;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            margin-bottom: 40px;
            display: inline-block;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .buttons {
            display: flex;
            gap: 16px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 14px 28px;
            font-size: 16px;
            font-weight: 500;
            text-decoration: none;
            border-radius: 12px;
            transition: all 0.3s ease;
            cursor: pointer;
            border: none;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 30px rgba(99, 102, 241, 0.6);
        }
        
        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: #e0e7ff;
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
        }
        
        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }
        
        .footer {
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            color: #6366f1;
            font-size: 14px;
        }
        
        .footer a {
            color: #818cf8;
            text-decoration: none;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        @media (max-width: 600px) {
            .error-code {
                font-size: 120px;
            }
            
            h1 {
                font-size: 24px;
            }
            
            p {
                font-size: 16px;
                padding: 0 20px;
            }
            
            .buttons {
                flex-direction: column;
                padding: 0 20px;
            }
            
            .btn {
                width: 100%;
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <div class="particles">
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
    </div>
    
    <div class="container">
        <div class="error-icon">🔍</div>
        <div class="error-code">404</div>
        <h1>Oops! Trang không tồn tại</h1>
        <p>Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển đến địa chỉ khác.</p>
        
        <div class="path-info">
            ${req.method} ${req.originalUrl}
        </div>
        
        <div class="buttons">
            <a href="/" class="btn btn-primary">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                </svg>
                Về trang chủ
            </a>
            <button onclick="history.back()" class="btn btn-secondary">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
                </svg>
                Quay lại
            </button>
        </div>
    </div>
    
    <div class="footer">
        <p>© 2026 <a href="/">TutorPlatform</a> - Nền tảng kết nối gia sư</p>
    </div>
</body>
</html>
    `);
};

module.exports = notFound;
