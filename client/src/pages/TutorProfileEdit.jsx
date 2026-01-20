import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import {
    User, Mail, MapPin, Phone, BookOpen, Clock, Award, Camera, Save, X, Edit2,
    GraduationCap, FileText, Image, Plus, Trash2, School
} from 'lucide-react';
import { API_URL } from '../config';

// Input Helper Component
const InputField = ({ icon: Icon, label, value, onChange, type = "text", placeholder, disabled = false }) => (
    <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type={type}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder={placeholder}
            />
        </div>
    </div>
);

const TutorProfileEdit = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updateLoading, setUpdateLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    // Form Data
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        address: '',
        bio: '',
        subjects: '',
        hourlyRate: '',
        // Education
        school: '',
        degree: '',
        graduationYear: '',
        // Scores
        math: '',
        literature: '',
        chemistry: '',
        physics: '',
        english: '',
    });

    // Certificates
    const [certificates, setCertificates] = useState([]);
    const [newCertificate, setNewCertificate] = useState({ name: '', issuedBy: '', year: '' });

    // Avatar
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');

    // Evidence Images
    const [evidenceImages, setEvidenceImages] = useState([]);
    const [newEvidenceFiles, setNewEvidenceFiles] = useState([]);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const res = await axios.get(`${API_URL}/api/auth/me`, config);
            const data = res.data;

            // Check if user is tutor
            if (data.role !== 'tutor') {
                navigate('/profile');
                return;
            }

            setUser(data);
            setFormData({
                full_name: data.full_name || '',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || '',
                bio: data.bio || '',
                subjects: Array.isArray(data.subjects) ? data.subjects.join(', ') : (data.subjects || ''),
                hourlyRate: data.hourlyRate || '',
                school: data.education?.school || '',
                degree: data.education?.degree || '',
                graduationYear: data.education?.graduationYear || '',
                math: data.scores?.math || '',
                literature: data.scores?.literature || '',
                chemistry: data.scores?.chemistry || '',
                physics: data.scores?.physics || '',
                english: data.scores?.english || '',
            });
            setPreview(data.img || '');
            setCertificates(data.certificates || []);
            setEvidenceImages(data.evidenceImages || []);
        } catch (err) {
            console.error(err);
            setError('Không thể tải thông tin. Vui lòng đăng nhập lại.');
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        if (selectedFile) {
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleEvidenceChange = (e) => {
        const files = Array.from(e.target.files);
        setNewEvidenceFiles(prev => [...prev, ...files]);
    };

    const removeNewEvidence = (index) => {
        setNewEvidenceFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingEvidence = (index) => {
        setEvidenceImages(prev => prev.filter((_, i) => i !== index));
    };

    const addCertificate = () => {
        if (newCertificate.name.trim()) {
            setCertificates(prev => [...prev, { ...newCertificate }]);
            setNewCertificate({ name: '', issuedBy: '', year: '' });
        }
    };

    const removeCertificate = (index) => {
        setCertificates(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            const data = new FormData();
            data.append('full_name', formData.full_name);
            data.append('email', formData.email);
            data.append('phone', formData.phone);
            data.append('address', formData.address);
            data.append('bio', formData.bio);
            data.append('subjects', formData.subjects);
            data.append('hourlyRate', formData.hourlyRate);

            // Education object
            data.append('education', JSON.stringify({
                school: formData.school,
                degree: formData.degree,
                graduationYear: formData.graduationYear ? Number(formData.graduationYear) : null
            }));

            // Scores
            data.append('scores', JSON.stringify({
                math: formData.math ? Number(formData.math) : null,
                literature: formData.literature ? Number(formData.literature) : null,
                chemistry: formData.chemistry ? Number(formData.chemistry) : null,
                physics: formData.physics ? Number(formData.physics) : null,
                english: formData.english ? Number(formData.english) : null
            }));

            // Certificates
            data.append('certificates', JSON.stringify(certificates));

            // Existing evidence images to keep
            data.append('existingEvidenceImages', JSON.stringify(evidenceImages));

            // Profile image
            if (file) {
                data.append('img', file);
            }

            // New evidence files
            newEvidenceFiles.forEach((f) => {
                data.append('evidence', f);
            });

            const res = await axios.put(`${API_URL}/api/tutors/profile`, data, config);
            setUser(res.data);

            // Update local storage
            const lsUser = JSON.parse(localStorage.getItem('user'));
            localStorage.setItem('user', JSON.stringify({ ...lsUser, name: res.data.full_name, img: res.data.img }));

            alert("Cập nhật thành công!");
            window.location.reload();

        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Cập nhật thất bại");
        } finally {
            setUpdateLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center text-red-500 font-medium">
                    {error}
                </div>
                <Footer />
            </div>
        );
    }

    const tabs = [
        { id: 'basic', label: 'Thông tin cơ bản', icon: User },
        { id: 'education', label: 'Học vấn', icon: GraduationCap },
        { id: 'certificates', label: 'Chứng chỉ', icon: Award },
        { id: 'evidence', label: 'Minh chứng', icon: Image },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-indigo-600 rounded-2xl p-8 mb-8 shadow-xl">
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            {/* Avatar */}
                            <div className="relative group">
                                <div className="h-28 w-28 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                                    {preview ? (
                                        <img src={preview} alt="Avatar" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full bg-indigo-100 flex items-center justify-center text-primary text-4xl font-bold">
                                            {user?.full_name?.charAt(0) || 'T'}
                                        </div>
                                    )}
                                </div>
                                <label className="absolute inset-0 h-28 w-28 rounded-full bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-200">
                                    <Camera className="w-8 h-8 text-white mb-1" />
                                    <span className="text-white text-xs font-medium">Thay đổi</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>
                            <div className="text-center md:text-left">
                                <h1 className="text-3xl font-bold text-white mb-2">Chỉnh sửa Hồ sơ Gia sư</h1>
                                <p className="text-white/80">Cập nhật thông tin để thu hút học viên tốt hơn</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
                        <div className="flex overflow-x-auto border-b border-gray-100">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                            ? 'text-primary border-b-2 border-primary bg-primary/5'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        <form onSubmit={handleUpdate} className="p-8">
                            {/* Basic Info Tab */}
                            {activeTab === 'basic' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField
                                            icon={User}
                                            label="Họ và tên"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            placeholder="Nhập họ tên"
                                        />
                                        <InputField
                                            icon={Mail}
                                            label="Email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            type="email"
                                        />
                                        <InputField
                                            icon={Phone}
                                            label="Số điện thoại"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="Nhập số điện thoại"
                                        />
                                        <InputField
                                            icon={MapPin}
                                            label="Địa chỉ"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Nhập địa chỉ"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField
                                            icon={BookOpen}
                                            label="Môn dạy (cách nhau bởi dấu phẩy)"
                                            value={formData.subjects}
                                            onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                                            placeholder="Ví dụ: Toán, Lý, Hóa"
                                        />
                                        <InputField
                                            icon={Clock}
                                            label="Học phí (đ/giờ)"
                                            type="number"
                                            value={formData.hourlyRate}
                                            onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                                            placeholder="Ví dụ: 200000"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">Giới thiệu bản thân</label>
                                        <textarea
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm min-h-[150px] transition-all"
                                            placeholder="Giới thiệu kinh nghiệm và phong cách giảng dạy..."
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Education Tab */}
                            {activeTab === 'education' && (
                                <div className="space-y-6">
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                                        <p className="text-blue-700 text-sm">
                                            <strong>Lưu ý:</strong> Thông tin học vấn sẽ được hiển thị công khai trên hồ sơ của bạn để học viên tham khảo.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField
                                            icon={School}
                                            label="Trường học"
                                            value={formData.school}
                                            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                                            placeholder="Ví dụ: Đại học Bách Khoa Hà Nội"
                                        />
                                        <InputField
                                            icon={GraduationCap}
                                            label="Bằng cấp / Chuyên ngành"
                                            value={formData.degree}
                                            onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                                            placeholder="Ví dụ: Cử nhân Sư phạm Toán"
                                        />
                                    </div>

                                    <InputField
                                        icon={Award}
                                        label="Năm tốt nghiệp"
                                        type="number"
                                        value={formData.graduationYear}
                                        onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                                        placeholder="Ví dụ: 2020"
                                    />

                                    <div className="border-t border-gray-200 pt-6 mt-6">
                                        <h3 className="text-lg font-bold text-dark mb-4">Điểm các môn học (nếu có)</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-gray-600">Toán</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    max="10"
                                                    min="0"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-center"
                                                    value={formData.math}
                                                    onChange={(e) => setFormData({ ...formData, math: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-gray-600">Văn</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    max="10"
                                                    min="0"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-center"
                                                    value={formData.literature}
                                                    onChange={(e) => setFormData({ ...formData, literature: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-gray-600">Hóa</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    max="10"
                                                    min="0"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-center"
                                                    value={formData.chemistry}
                                                    onChange={(e) => setFormData({ ...formData, chemistry: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-gray-600">Lý</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    max="10"
                                                    min="0"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-center"
                                                    value={formData.physics}
                                                    onChange={(e) => setFormData({ ...formData, physics: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-gray-600">Anh</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    max="10"
                                                    min="0"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-center"
                                                    value={formData.english}
                                                    onChange={(e) => setFormData({ ...formData, english: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Certificates Tab */}
                            {activeTab === 'certificates' && (
                                <div className="space-y-6">
                                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6">
                                        <p className="text-green-700 text-sm">
                                            <strong>Mẹo:</strong> Thêm các chứng chỉ, bằng khen để tăng độ tin cậy với học viên.
                                        </p>
                                    </div>

                                    {/* Existing Certificates */}
                                    <div className="space-y-3">
                                        {certificates.map((cert, index) => (
                                            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Award className="w-6 h-6 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-dark">{cert.name}</h4>
                                                    <p className="text-sm text-gray-500">
                                                        {cert.issuedBy} {cert.year && `• ${cert.year}`}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeCertificate(index)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}

                                        {certificates.length === 0 && (
                                            <div className="text-center py-8 text-gray-500">
                                                <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                <p>Chưa có chứng chỉ nào</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Add New Certificate */}
                                    <div className="border-t border-gray-200 pt-6">
                                        <h4 className="font-semibold text-dark mb-4">Thêm chứng chỉ mới</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Tên chứng chỉ"
                                                className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary"
                                                value={newCertificate.name}
                                                onChange={(e) => setNewCertificate({ ...newCertificate, name: e.target.value })}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Cấp bởi"
                                                className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary"
                                                value={newCertificate.issuedBy}
                                                onChange={(e) => setNewCertificate({ ...newCertificate, issuedBy: e.target.value })}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Năm"
                                                className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary"
                                                value={newCertificate.year}
                                                onChange={(e) => setNewCertificate({ ...newCertificate, year: e.target.value })}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addCertificate}
                                            className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary font-medium rounded-xl hover:bg-primary/20 transition-colors"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Thêm chứng chỉ
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Evidence Tab */}
                            {activeTab === 'evidence' && (
                                <div className="space-y-6">
                                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6">
                                        <p className="text-yellow-700 text-sm">
                                            <strong>Lưu ý:</strong> Upload hình ảnh bằng cấp, chứng chỉ để minh chứng cho hồ sơ của bạn.
                                        </p>
                                    </div>

                                    {/* Existing Evidence Images */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {evidenceImages.map((img, index) => (
                                            <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200">
                                                <img src={img} alt={`Evidence ${index + 1}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingEvidence(index)}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}

                                        {/* New Evidence Previews */}
                                        {newEvidenceFiles.map((f, index) => (
                                            <div key={`new-${index}`} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-primary border-dashed">
                                                <img src={URL.createObjectURL(f)} alt={`New Evidence ${index + 1}`} className="w-full h-full object-cover" />
                                                <div className="absolute top-0 left-0 bg-primary text-white text-xs px-2 py-1 rounded-br-lg">Mới</div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewEvidence(index)}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}

                                        {/* Upload Button */}
                                        <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                                            <Plus className="w-8 h-8 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-500">Thêm ảnh</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                multiple
                                                onChange={handleEvidenceChange}
                                            />
                                        </label>
                                    </div>

                                    {evidenceImages.length === 0 && newEvidenceFiles.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <Image className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                            <p>Chưa có hình ảnh minh chứng nào</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => navigate('/profile')}
                                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors flex items-center gap-2"
                                >
                                    <X className="w-5 h-5" />
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateLoading}
                                    className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 flex items-center gap-2"
                                >
                                    {updateLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Save className="w-5 h-5" />
                                    )}
                                    {updateLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default TutorProfileEdit;
