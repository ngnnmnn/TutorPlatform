import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="not-found-container">
            {/* Animated Particles Background */}
            <div className="particles">
                {[...Array(15)].map((_, i) => (
                    <div key={i} className="particle" style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${10 + Math.random() * 10}s`
                    }} />
                ))}
            </div>

            <div className="not-found-content">
                {/* Animated Icon */}
                <div className="error-icon">
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M15 9l-6 6M9 9l6 6" />
                    </svg>
                </div>

                {/* Error Code */}
                <h1 className="error-code">404</h1>

                {/* Message */}
                <h2 className="error-title">Trang không tồn tại</h2>
                <p className="error-message">
                    Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển đến địa chỉ khác.
                </p>

                {/* Buttons */}
                <div className="error-buttons">
                    <Link to="/" className="btn-primary">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                        Về trang chủ
                    </Link>
                    <button onClick={() => navigate(-1)} className="btn-secondary">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Quay lại
                    </button>
                </div>

                {/* Decorative Elements */}
                <div className="floating-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                </div>
            </div>

            <style jsx>{`
                .not-found-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
                    position: relative;
                    overflow: hidden;
                    padding: 20px;
                }

                .particles {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                }

                .particle {
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    animation: floatUp 15s infinite linear;
                }

                @keyframes floatUp {
                    0% {
                        transform: translateY(100vh) scale(0);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 0.5;
                    }
                    100% {
                        transform: translateY(-100vh) scale(1);
                        opacity: 0;
                    }
                }

                .not-found-content {
                    text-align: center;
                    z-index: 10;
                    position: relative;
                }

                .error-icon {
                    color: #818cf8;
                    margin-bottom: 20px;
                    animation: pulse 2s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }

                .error-code {
                    font-size: 160px;
                    font-weight: 800;
                    background: linear-gradient(135deg, #818cf8 0%, #c4b5fd 50%, #f0abfc 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    line-height: 1;
                    margin: 0 0 20px 0;
                    text-shadow: 0 0 80px rgba(129, 140, 248, 0.5);
                    animation: glow 3s ease-in-out infinite alternate;
                }

                @keyframes glow {
                    from { filter: drop-shadow(0 0 20px rgba(129, 140, 248, 0.3)); }
                    to { filter: drop-shadow(0 0 40px rgba(129, 140, 248, 0.6)); }
                }

                .error-title {
                    color: #e0e7ff;
                    font-size: 28px;
                    font-weight: 600;
                    margin: 0 0 16px 0;
                }

                .error-message {
                    color: #a5b4fc;
                    font-size: 16px;
                    max-width: 400px;
                    margin: 0 auto 40px;
                    line-height: 1.6;
                }

                .error-buttons {
                    display: flex;
                    gap: 16px;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .btn-primary, .btn-secondary {
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
                    font-family: inherit;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    color: white;
                    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
                }

                .btn-primary:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 30px rgba(99, 102, 241, 0.6);
                }

                .btn-secondary {
                    background: rgba(255, 255, 255, 0.1);
                    color: #e0e7ff;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                }

                .btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-3px);
                }

                .floating-shapes {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    top: 0;
                    left: 0;
                    pointer-events: none;
                    z-index: -1;
                }

                .shape {
                    position: absolute;
                    border-radius: 50%;
                    background: linear-gradient(135deg, rgba(129, 140, 248, 0.1), rgba(196, 181, 253, 0.05));
                    animation: float 20s infinite ease-in-out;
                }

                .shape-1 {
                    width: 300px;
                    height: 300px;
                    top: -100px;
                    right: -100px;
                    animation-delay: 0s;
                }

                .shape-2 {
                    width: 200px;
                    height: 200px;
                    bottom: -50px;
                    left: -50px;
                    animation-delay: -5s;
                }

                .shape-3 {
                    width: 150px;
                    height: 150px;
                    top: 50%;
                    left: 10%;
                    animation-delay: -10s;
                }

                @keyframes float {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    25% { transform: translate(10px, -20px) rotate(5deg); }
                    50% { transform: translate(-10px, 10px) rotate(-5deg); }
                    75% { transform: translate(20px, 10px) rotate(3deg); }
                }

                @media (max-width: 600px) {
                    .error-code {
                        font-size: 100px;
                    }

                    .error-title {
                        font-size: 22px;
                    }

                    .error-buttons {
                        flex-direction: column;
                        width: 100%;
                    }

                    .btn-primary, .btn-secondary {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
};

export default NotFound;
