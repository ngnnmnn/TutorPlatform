import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import { BookOpen, Upload, Plus, Trash, GraduationCap, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { X } from 'lucide-react';
import { API_URL } from '../config';

const ScoreInput = ({ label, name, value, onChange }) => (
    <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            name={name}
            value={value}
            onChange={onChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            placeholder="0.0"
        />
    </div>
);

const BecomeTutor = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Scores
    const [scores, setScores] = useState({
        math_score: '',
        literature_score: '',
        chemistry_score: '',
        physic_score: '',
        english_score: ''
    });

    const [university, setUniversity] = useState('');
    const [intro, setIntro] = useState('');
    const [note, setNote] = useState('');

    // Certificates (List of strings)
    const [certificates, setCertificates] = useState(['']);

    // Evidence Files
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);

    // Terms and Captcha
    const [showTerms, setShowTerms] = useState(false);
    const [agreedTerms, setAgreedTerms] = useState(false);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/subjects`);
                setAvailableSubjects(res.data);
            } catch (err) {
                console.error("Error fetching subjects:", err);
            }
        };
        fetchSubjects();
    }, []);

    const handleScoreChange = (e) => {
        setScores({ ...scores, [e.target.name]: e.target.value });
    };

    const handleCertChange = (index, value) => {
        const newCerts = [...certificates];
        newCerts[index] = value;
        setCertificates(newCerts);
    };

    const addCertField = () => {
        setCertificates([...certificates, '']);
    };

    const removeCertField = (index) => {
        const newCerts = certificates.filter((_, i) => i !== index);
        setCertificates(newCerts);
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);

        // Generate previews
        const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeFile = (index) => {
        const newFiles = files.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        setFiles(newFiles);
        setPreviews(newPreviews);
    };

    const handleSubjectToggle = (id) => {
        if (selectedSubjectIds.includes(id)) {
            setSelectedSubjectIds(selectedSubjectIds.filter(item => item !== id));
        } else {
            if (selectedSubjectIds.length >= 3) {
                alert("Bạn chỉ được chọn tối đa 3 môn học.");
                return;
            }
            setSelectedSubjectIds([...selectedSubjectIds, id]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const formData = new FormData();

            // Validate Terms and Captcha
            if (!agreedTerms) {
                setError('Vui lòng đồng ý với điều khoản Gia sư');
                setLoading(false);
                return;
            }

            // Validate Captcha
            if (!captchaToken) {
                setError('Vui lòng xác thực Captcha');
                setLoading(false);
                return;
            }

            formData.append('captchaToken', captchaToken);

            // Append Scores
            Object.keys(scores).forEach(key => {
                formData.append(key, scores[key]);
            });

            formData.append('university', university);
            formData.append('intro', intro);
            formData.append('Note', note);

            // Append Certificates (filter empty)
            const validCerts = certificates.filter(c => c.trim() !== '');
            formData.append('certificates', JSON.stringify(validCerts));

            // Append Files
            files.forEach(file => {
                formData.append('evidence', file);
            });

            // Append Selected Subjects
            formData.append('subjectIDs', JSON.stringify(selectedSubjectIds));

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            await axios.post(`${API_URL}/api/auth/tutor-request`, formData, config);
            alert("Gửi yêu cầu thành công! Vui lòng chờ xét duyệt.");
            navigate('/profile');

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu.');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-inter">
            <Navbar />

            <div className="flex-1 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50">
                {/* Header Section */}
                <div className="text-center mb-10 mt-16 animate-fade-in">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
                        Đăng ký trở thành <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Gia sư</span>
                    </h1>
                    <p className="max-w-xl mx-auto text-gray-600 font-medium">
                        Hoàn thiện hồ sơ để gia nhập đội ngũ gia sư chất lượng cao của chúng tôi.
                    </p>
                </div>

                {/* Main Card */}
                <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10">
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}

                        {/* Section: Academic Performance */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-indigo-50 text-primary">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Năng lực Học thuật</h3>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {[
                                    { label: 'Toán', name: 'math_score' },
                                    { label: 'Văn', name: 'literature_score' },
                                    { label: 'Anh', name: 'english_score' },
                                    { label: 'Lý', name: 'physic_score' },
                                    { label: 'Hóa', name: 'chemistry_score' }
                                ].map((field) => (
                                    <div key={field.name} className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-gray-500 uppercase">{field.label}</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="10"
                                            name={field.name}
                                            value={scores[field.name]}
                                            onChange={handleScoreChange}
                                            required
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-center font-bold text-gray-800"
                                            placeholder="0.0"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section: Subjects */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Môn học đăng ký (Tối đa 3)</h3>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {availableSubjects.map(sub => (
                                    <button
                                        key={sub._id}
                                        type="button"
                                        onClick={() => handleSubjectToggle(sub._id)}
                                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${selectedSubjectIds.includes(sub._id)
                                            ? 'bg-secondary border-secondary text-white shadow-md'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-secondary/50'
                                            }`}
                                    >
                                        {sub.sub_name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Section: Biography */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Lời tự bạch</h3>
                            </div>

                            <textarea
                                value={intro}
                                onChange={(e) => setIntro(e.target.value)}
                                required
                                className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[150px] text-gray-700"
                                placeholder="Hãy giới thiệu ngắn gọn về bản thân, phong cách dạy và kinh nghiệm của bạn..."
                            />
                        </div>

                        {/* Section: Education Info */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Học vấn & Chứng chỉ</h3>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Trường Đại học</label>
                                    <input
                                        type="text"
                                        value={university}
                                        onChange={(e) => setUniversity(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="Ví dụ: Đại học Bách Khoa Hà Nội"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-700">Chứng chỉ & Giải thưởng</label>
                                    {certificates.map((cert, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={cert}
                                                onChange={(e) => handleCertChange(index, e.target.value)}
                                                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                                placeholder="VD: IELTS 7.5, Giải Nhất Toán..."
                                            />
                                            {certificates.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeCertField(index)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addCertField}
                                        className="w-full py-2 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Plus className="w-4 h-4" /> Thêm mới
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Section: Evidence Upload */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600">
                                    <Upload className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Minh chứng & Hồ sơ</h3>
                            </div>

                            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:bg-gray-50 transition-colors relative cursor-pointer group">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center">
                                    <Upload className="w-10 h-10 text-gray-400 mb-2 group-hover:text-primary transition-colors" />
                                    <p className="text-gray-600 font-medium">Nhấn để tải lên ảnh minh chứng</p>
                                    <p className="text-xs text-gray-400 mt-1">(CCCD, Thẻ sinh viên, Bằng cấp...)</p>
                                </div>
                            </div>

                            {previews.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {previews.map((src, index) => (
                                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 group shadow-sm">
                                            <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer Section */}
                        <div className="space-y-6 pt-6 border-t border-gray-100">
                            <div className="space-y-4">
                                <label className="text-sm font-medium text-gray-700">Ghi chú bổ sung</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                    placeholder="Có điều gì khác bạn muốn nhắn gửi không?"
                                />
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setAgreedTerms(!agreedTerms)}>
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${agreedTerms ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                                            {agreedTerms && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            Tôi đã đọc và đồng ý với <button type="button" onClick={(e) => { e.stopPropagation(); setShowTerms(true); }} className="text-primary font-bold hover:underline">Điều khoản Gia sư</button>
                                        </span>
                                    </div>
                                    <ReCAPTCHA
                                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                                        onChange={setCaptchaToken}
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/profile')}
                                        className="px-6 py-3 text-gray-500 font-bold hover:text-gray-700 transition-colors"
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                        {loading ? 'Đang gửi...' : 'Xác nhận Đăng ký'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />

            {/* Modal: Terms */}
            {showTerms && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm shadow-2xl" onClick={() => setShowTerms(false)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Điều Khoản Gia Sư</h2>
                            <button onClick={() => setShowTerms(false)} className="text-gray-400 hover:text-gray-600 p-2">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto space-y-6 text-gray-600 leading-relaxed">
                            <section>
                                <h3 className="font-bold text-gray-900 mb-2">1. Quy định chung</h3>
                                <p>Khi đăng ký trở thành gia sư, bạn cam kết cung cấp thông tin chính xác và đầy đủ về trình độ học vấn cũng như kinh nghiệm giảng dạy.</p>
                            </section>
                            <section>
                                <h3 className="font-bold text-gray-900 mb-2">2. Trách nhiệm</h3>
                                <p>Gia sư có trách nhiệm chuẩn bị kỹ bài giảng, đúng giờ và duy trì thái độ chuyên nghiệp trong suốt quá trình dạy học.</p>
                            </section>
                            <section>
                                <h3 className="font-bold text-gray-900 mb-2">3. Bảo mật</h3>
                                <p>Tuyệt đối không sử dụng thông tin cá nhân của học viên vào mục đích khác ngoài việc hỗ trợ học tập.</p>
                            </section>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => { setAgreedTerms(true); setShowTerms(false); }}
                                className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
                            >
                                Tôi đồng ý
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BecomeTutor;
