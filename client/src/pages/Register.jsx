import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, Mail, Lock, BookOpen, MapPin, Phone, Image as ImageIcon, CheckCircle, X } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import registerBg from '../assets/register_bg.jpg';
import { API_URL } from '../config';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        username: '',
        password: '',
        address: '',
        phone: '',
    });
    const [file, setFile] = useState(null);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [showTerms, setShowTerms] = useState(false); // New state for terms modal
    const [agreedTerms, setAgreedTerms] = useState(false); // New state for terms agreement
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(''); // New success state
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/;
        const fileRegex = /\.(jpg|jpeg|png)$/i;

        if (!formData.full_name) return "Vui lòng nhập họ và tên";
        if (!formData.email || !emailRegex.test(formData.email)) return "Email không hợp lệ";
        if (!formData.username) return "Vui lòng nhập tên đăng nhập";
        if (!formData.phone || !phoneRegex.test(formData.phone)) return "Số điện thoại không hợp lệ (VN)";
        if (!formData.password) return "Vui lòng nhập mật khẩu";
        if (!agreedTerms) return "Vui lòng đồng ý với điều khoản sử dụng";
        if (!captchaToken) return "Vui lòng hoàn thành xác thực Captcha";

        if (file) {
            if (!fileRegex.test(file.name)) {
                return "Chỉ chấp nhận file ảnh (png, jpg, jpeg)";
            }
            // Optional: Check size (e.g. 5MB)
            if (file.size > 5 * 1024 * 1024) {
                return "File ảnh quá lớn (tối đa 5MB)";
            }
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(''); // Clear previous success message

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            setLoading(false);
            return;
        }

        try {
            const data = new FormData();
            data.append('full_name', formData.full_name);
            data.append('email', formData.email);
            data.append('username', formData.username);
            data.append('password', formData.password);
            data.append('address', formData.address);
            data.append('phone', formData.phone);
            data.append('role', 'student'); // Default role
            data.append('captchaToken', captchaToken); // Send captcha token

            if (file) {
                data.append('img', file);
            }

            const res = await axios.post(`${API_URL}/api/auth/register`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Don't auto login, show success message
            setSuccess(res.data.message);
            // localStorage.setItem('token', res.data.token);
            // localStorage.setItem('user', JSON.stringify(res.data));
            // window.location.href = '/';
        } catch (err) {
            console.error("Registration Error:", err);
            let errMsg = 'Đăng ký thất bại. Vui lòng thử lại.';

            if (err.response) {
                // Server responded with a status code
                errMsg = err.response.data?.message || `Lỗi máy chủ (${err.response.status})`;
            } else if (err.request) {
                // request made but no response
                errMsg = 'Không có phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng.';
            } else {
                // something else happened
                errMsg = err.message;
            }

            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col bg-blue-50 bg-cover bg-center bg-no-repeat relative"
            style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${registerBg})`
            }}
        >
            <Navbar />

            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-12">
                <div className="max-w-2xl w-full space-y-8 bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-dark">Tạo tài khoản học viên</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Bắt đầu hành trình học tập cùng TutorPlatform
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div className="text-center py-8">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Đăng ký thành công!</h3>
                            <p className="text-gray-600 mb-6">{success}</p>
                            <Link to="/login" className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
                                Đăng nhập ngay
                            </Link>
                        </div>
                    ) : (
                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và Tên</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            placeholder="Nguyễn Văn A"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            placeholder="vidu@gmail.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            placeholder="username123"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            placeholder="0912..."
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            placeholder="Hà Nội, VN"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg, image/jpg"
                                            id="file-upload"
                                            className="hidden"
                                            onChange={(e) => setFile(e.target.files[0])}
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
                                        >
                                            <div className="flex flex-col items-center space-y-2">
                                                {file ? (
                                                    <>
                                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                            <ImageIcon className="w-5 h-5 text-green-600" />
                                                        </div>
                                                        <span className="text-sm font-medium text-green-600">{file.name}</span>
                                                        <span className="text-xs text-gray-400">Nhấn để thay đổi</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                            <ImageIcon className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-600 group-hover:text-primary">Chọn tệp hình ảnh</span>
                                                        <span className="text-xs text-gray-400">PNG, JPG up to 5MB</span>
                                                    </>
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="terms"
                                            checked={agreedTerms}
                                            onChange={(e) => setAgreedTerms(e.target.checked)}
                                            className="mt-1 w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                                        />
                                        <label htmlFor="terms" className="text-sm text-gray-700">
                                            Tôi đã đọc và đồng ý với <button type="button" onClick={() => setShowTerms(true)} className="text-primary font-bold hover:underline">Điều khoản sử dụng</button> của Website.
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <ReCAPTCHA
                                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"} // Use Test Key if env is missing
                                    onChange={setCaptchaToken}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg shadow-primary/30 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
                            </button>
                        </form>
                    )}

                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600">
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="font-bold text-primary hover:text-primary/80">
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Terms Modal */}
            {showTerms && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-fade-in">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <h2 className="text-xl font-bold text-gray-800">Điều Khoản Sử Dụng</h2>
                            <button onClick={() => setShowTerms(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto prose prose-sm max-w-none text-gray-600">
                            <h3>1. Giới thiệu</h3>
                            <p>Chào mừng bạn đến với website TutorPlatform (sau đây gọi là “Website”). Website là nền tảng trung gian kết nối Gia sư và Học viên/Phụ huynh nhằm hỗ trợ việc tìm kiếm, trao đổi và thỏa thuận học tập. Khi truy cập hoặc sử dụng Website, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý bị ràng buộc bởi các Điều khoản sử dụng này.</p>

                            <h3>2. Đối tượng áp dụng</h3>
                            <p>Điều khoản này áp dụng cho tất cả người dùng Website, bao gồm: Gia sư, Học viên, Phụ huynh. Người dùng phải từ 18 tuổi trở lên hoặc có sự đồng ý của người giám hộ hợp pháp.</p>

                            <h3>3. Vai trò của Website</h3>
                            <p>Website không trực tiếp tổ chức, quản lý hay giảng dạy. Website chỉ đóng vai trò trung gian kết nối thông tin và cung cấp nền tảng trao đổi. Mọi thỏa thuận về nội dung học, thời gian, học phí là trách nhiệm của hai bên liên quan.</p>

                            <h3>4. Tài khoản người dùng</h3>
                            <p>Người dùng phải cung cấp thông tin chính xác, đầy đủ và trung thực. Mỗi người dùng chỉ được tạo một tài khoản duy nhất. Người dùng chịu trách nhiệm bảo mật thông tin tài khoản và mọi hoạt động phát sinh từ tài khoản của mình. Website có quyền tạm khóa hoặc chấm dứt tài khoản nếu phát hiện vi phạm.</p>

                            <h3>5. Quy định đối với Gia sư</h3>
                            <p>Gia sư cam kết cung cấp thông tin đúng sự thật về trình độ, kinh nghiệm, chuyên môn. Thực hiện giảng dạy đúng nội dung đã thỏa thuận. Tuân thủ đạo đức nghề nghiệp và pháp luật. Website không chịu trách nhiệm đối với chất lượng giảng dạy hoặc kết quả học tập.</p>

                            <h3>6. Quy định đối với Học viên / Phụ huynh</h3>
                            <p>Cam kết cung cấp thông tin học tập trung thực, tôn trọng Gia sư, và thực hiện đầy đủ nghĩa vụ tài chính.</p>

                            <h3>7. Phí dịch vụ và thanh toán</h3>
                            <p>Website có thể thu phí giới thiệu hoặc phí dịch vụ. Các khoản phí đã thanh toán không hoàn lại trừ trường hợp quy định khác.</p>

                            <h3>8. Hủy lớp và khiếu nại</h3>
                            <p>Việc hủy lớp phải được thông báo trước. Website chỉ đóng vai trò ghi nhận phản ánh và hỗ trợ trung gian khi tranh chấp. Website không chịu trách nhiệm bồi thường thiệt hại giữa hai bên.</p>

                            <h3>9. Hành vi bị nghiêm cấm</h3>
                            <p>Cung cấp thông tin giả mạo, đăng tải nội dung vi phạm pháp luật, quấy rối, lừa đảo, hoặc cố tình giao dịch ngoài nền tảng nhằm trốn phí.</p>

                            <h3>10. Bảo mật thông tin</h3>
                            <p>Website cam kết bảo mật thông tin theo quy định pháp luật. Người dùng đồng ý cho phép thu thập, lưu trữ, xử lý dữ liệu nhằm vận hành dịch vụ.</p>

                            <h3>11. Giới hạn trách nhiệm</h3>
                            <p>Website không chịu trách nhiệm đối với kết quả học tập, tranh chấp cá nhân, hoặc thiệt hại phát sinh ngoài sự kiểm soát.</p>

                            <h3>12. Thay đổi điều khoản</h3>
                            <p>Website có quyền cập nhật điều khoản bất cứ lúc nào. Việc tiếp tục sử dụng đồng nghĩa với chấp thuận thay đổi.</p>

                            <h3>13. Luật áp dụng</h3>
                            <p>Điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Mọi tranh chấp giải quyết tại cơ quan có thẩm quyền tại Việt Nam.</p>

                            <h3>14. Thông tin liên hệ</h3>
                            <p>Email: admin@tutorplatform.com | Hotline: 1900 xxxx</p>
                        </div>
                        <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex justify-end">
                            <button
                                onClick={() => {
                                    setAgreedTerms(true);
                                    setShowTerms(false);
                                }}
                                className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
                            >
                                Tôi đồng ý
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div >
    );
};

export default Register;
