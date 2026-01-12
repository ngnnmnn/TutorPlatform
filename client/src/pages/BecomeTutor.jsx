import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import { BookOpen, Upload, Plus, Trash, GraduationCap, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    const [note, setNote] = useState('');

    // Certificates (List of strings)
    const [certificates, setCertificates] = useState(['']);

    // Evidence Files
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);

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

            // Append Scores
            Object.keys(scores).forEach(key => {
                formData.append(key, scores[key]);
            });

            formData.append('university', university);
            formData.append('Note', note);

            // Append Certificates (filter empty)
            const validCerts = certificates.filter(c => c.trim() !== '');
            formData.append('certificates', JSON.stringify(validCerts));

            // Append Files
            files.forEach(file => {
                formData.append('evidence', file);
            });

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            await axios.post('http://localhost:5000/api/auth/tutor-request', formData, config);
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
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-1 container mx-auto px-4 pt-24 pb-12">
                <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-primary px-8 py-6 text-white">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <GraduationCap className="w-8 h-8" />
                            Đăng ký làm Gia sư
                        </h1>
                        <p className="mt-2 text-primary-100 opacity-90">
                            Cung cấp thông tin học vấn và minh chứng để nâng cấp tài khoản.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        )}

                        {/* Section 1: Scores */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-primary" />
                                Điểm thi Đại học / THPT
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <ScoreInput label="Toán" name="math_score" value={scores.math_score} onChange={handleScoreChange} />
                                <ScoreInput label="Văn" name="literature_score" value={scores.literature_score} onChange={handleScoreChange} />
                                <ScoreInput label="Anh" name="english_score" value={scores.english_score} onChange={handleScoreChange} />
                                <ScoreInput label="Lý" name="physic_score" value={scores.physic_score} onChange={handleScoreChange} />
                                <ScoreInput label="Hóa" name="chemistry_score" value={scores.chemistry_score} onChange={handleScoreChange} />
                            </div>
                        </div>

                        {/* Section 2: Education Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-primary" />
                                Thông tin học vấn
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trường Đại học</label>
                                <input
                                    type="text"
                                    value={university}
                                    onChange={(e) => setUniversity(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    placeholder="Ví dụ: Đại học Bách Khoa Hà Nội"
                                />
                            </div>
                        </div>

                        {/* Section 3: Certificates */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-primary" />
                                Chứng chỉ đạt được
                            </h3>
                            <div className="space-y-3">
                                {certificates.map((cert, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={cert}
                                            onChange={(e) => handleCertChange(index, e.target.value)}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                            placeholder="Tên chứng chỉ (VD: IELTS 7.5, Giải Nhất Toán TP...)"
                                        />
                                        {certificates.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeCertField(index)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addCertField}
                                    className="text-primary hover:text-primary-dark font-medium flex items-center gap-1 text-sm"
                                >
                                    <Plus className="w-4 h-4" /> Thêm chứng chỉ
                                </button>
                            </div>
                        </div>

                        {/* Section 4: Evidence Upload */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                                <Upload className="w-5 h-5 text-primary" />
                                Minh chứng (Ảnh)
                            </h3>
                            <p className="text-sm text-gray-500 italic">
                                Vui lòng tải lên ảnh CCCD, Thẻ sinh viên, và các bằng cấp/chứng chỉ đã khai báo ở trên.
                            </p>

                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center">
                                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                                    <span className="text-gray-600 font-medium">Nhấn để chọn ảnh hoặc kéo thả vào đây</span>
                                    <span className="text-gray-400 text-sm mt-1">Hỗ trợ JPG, PNG</span>
                                </div>
                            </div>

                            {/* Preview Grid */}
                            {previews.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-4">
                                    {previews.map((src, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                            <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Section 5: Note */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                Ghi chú thêm
                            </h3>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary min-h-[100px]"
                                placeholder="Bất kỳ thông tin nào khác bạn muốn chúng tôi biết..."
                            />
                        </div>

                        {/* Submit Actions */}
                        <div className="flex justify-end pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium mr-4"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all flex items-center gap-2"
                            >
                                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default BecomeTutor;
