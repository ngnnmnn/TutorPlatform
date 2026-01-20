import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import { User, Mail, MapPin, Phone, BookOpen, Star, Clock, Award, Camera, Save, X, Edit2, Lock } from 'lucide-react';

// Input Helper Component
const InputField = ({ icon: Icon, label, value, onChange, type = "text", placeholder }) => (
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                placeholder={placeholder}
            />
        </div>
    </div>
);

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [formData, setFormData] = useState({});
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            const res = await axios.get('http://localhost:5000/api/auth/me', config);
            setUser(res.data);
            setFormData({
                full_name: res.data.full_name || '',
                email: res.data.email || '',
                phone: res.data.phone || '',
                address: res.data.address || '',
                bio: res.data.bio || '',
                subjects: Array.isArray(res.data.subjects) ? res.data.subjects.join(', ') : (res.data.subjects || ''),
                education: res.data.education?.degree || res.data.education || '',
                hourlyRate: res.data.hourlyRate || '',
            });
            setPreview(res.data.img || '');
        } catch (err) {
            console.error(err);
            setError('Không thể tải thông tin cá nhân. Vui lòng đăng nhập lại.');
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
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

            // Only append tutor fields if user is tutor
            if (user.role === 'tutor') {
                data.append('bio', formData.bio);
                data.append('subjects', formData.subjects);
                data.append('education', formData.education);
                data.append('hourlyRate', formData.hourlyRate);
            }

            if (file) {
                data.append('img', file);
            }

            const res = await axios.put('http://localhost:5000/api/auth/me', data, config);
            setUser(res.data);
            setIsEditing(false);

            // Update local storage user data (name/img might change)
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



    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header / Cover */}
                    <div className="h-32 bg-gradient-to-r from-primary to-indigo-600 relative">
                        {!isEditing && (
                            <div className="absolute top-4 right-4 flex gap-2">
                                {user.role === 'tutor' && (
                                    <button
                                        type="button"
                                        onClick={() => window.location.href = '/tutor-profile/edit'}
                                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm font-medium transition-all flex items-center gap-2"
                                    >
                                        <Award className="w-4 h-4" />
                                        Chỉnh sửa hồ sơ gia sư
                                    </button>
                                )}
                                <button
                                    onClick={() => window.location.href = '/change-password'}
                                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm font-medium transition-all flex items-center gap-2"
                                >
                                    <Lock className="w-4 h-4" />
                                    Đổi mật khẩu
                                </button>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm font-medium transition-all flex items-center gap-2"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Chỉnh sửa nhanh
                                </button>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleUpdate} className="px-8 pb-8">
                        {/* Avatar Section */}
                        <div className="relative flex justify-between items-end -mt-12 mb-8">
                            <div className="flex items-end">
                                <div className="h-28 w-28 rounded-full border-4 border-white bg-white shadow-md overflow-hidden relative group">
                                    {preview ? (
                                        <img src={preview} alt="Avatar" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full bg-indigo-100 flex items-center justify-center text-primary text-4xl font-bold">
                                            {user.full_name?.charAt(0) || 'U'}
                                        </div>
                                    )}

                                    {isEditing && (
                                        <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-200">
                                            <Camera className="w-8 h-8 text-white mb-1" />
                                            <span className="text-white text-xs font-medium">Thay đổi</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                        </label>
                                    )}
                                </div>
                                <div className="ml-5 mb-2">
                                    {isEditing ? (
                                        <div className="mb-1">
                                            <input
                                                type="text"
                                                className="text-2xl font-bold text-dark border-b-2 border-gray-200 focus:border-primary outline-none px-1 bg-transparent w-full"
                                                value={formData.full_name}
                                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                placeholder="Nhập họ tên"
                                            />
                                        </div>
                                    ) : (
                                        <h1 className="text-3xl font-bold text-dark">{user.full_name}</h1>
                                    )}
                                    {!isEditing && <p className="text-gray-500 font-medium">@{user.username}</p>}
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex gap-3 mb-2">
                                    <button
                                        type="button"
                                        onClick={() => { setIsEditing(false); setPreview(user.img); setFormData({ ...formData, email: user.email }); }}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        <X className="w-4 h-4" /> Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updateLoading}
                                        className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 flex items-center gap-2"
                                    >
                                        {updateLoading ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        {updateLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Main Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Left Column: Personal Info */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 border-b pb-2">
                                    <User className="w-5 h-5 text-primary" />
                                    <h3 className="text-lg font-bold text-dark">Thông tin cá nhân</h3>
                                </div>

                                <div className="space-y-4">
                                    {isEditing ? (
                                        <>
                                            <InputField
                                                icon={Mail}
                                                label="Email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                                <Mail className="w-5 h-5 text-gray-400" />
                                                <span className="text-gray-700">{user.email}</span>
                                            </div>
                                            <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                                <Phone className="w-5 h-5 text-gray-400" />
                                                <span className="text-gray-700">{user.phone || 'Chưa cập nhật'}</span>
                                            </div>
                                            <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                                <MapPin className="w-5 h-5 text-gray-400" />
                                                <span className="text-gray-700">{user.address || 'Chưa cập nhật'}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Role Specific */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 border-b pb-2">
                                    <Award className="w-5 h-5 text-primary" />
                                    <h3 className="text-lg font-bold text-dark">
                                        {user.role === 'tutor' ? 'Thông tin gia sư' : 'Hồ sơ học viên'}
                                    </h3>
                                </div>

                                {user.role === 'tutor' ? (
                                    <div className="space-y-4">
                                        {isEditing ? (
                                            <>
                                                <InputField
                                                    icon={BookOpen}
                                                    label="Môn dạy"
                                                    value={formData.subjects}
                                                    onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                                                    placeholder="Ví dụ: Toán, Lý, Hóa"
                                                />
                                                <InputField
                                                    icon={Award}
                                                    label="Trình độ học vấn"
                                                    value={formData.education}
                                                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                                                    placeholder="Ví dụ: Sinh viên ĐH Bách Khoa"
                                                />
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium text-gray-700">Học phí (đ/giờ)</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <Clock className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                        <input
                                                            type="number"
                                                            value={formData.hourlyRate}
                                                            onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm"
                                                            placeholder="Ví dụ: 200000"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium text-gray-700">Giới thiệu bản thân</label>
                                                    <textarea
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm min-h-[120px]"
                                                        placeholder="Giới thiệu kinh nghiệm và phong cách giảng dạy..."
                                                        value={formData.bio}
                                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <BookOpen className="w-5 h-5 text-gray-400" />
                                                        <span className="font-medium text-gray-900">Môn dạy</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {user.subjects && user.subjects.length > 0 ? (
                                                            (Array.isArray(user.subjects) ? user.subjects : [user.subjects]).map((sub, idx) => (
                                                                <span key={idx} className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                                                                    {sub}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-sm text-gray-500">Chưa cập nhật</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-4 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                                    <Award className="w-5 h-5 text-gray-400 mt-1" />
                                                    <div>
                                                        <span className="font-medium text-gray-900">Học vấn</span>
                                                        <p className="text-sm text-gray-600">{user.education?.degree || user.education || 'Chưa cập nhật'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                                    <Clock className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <span className="font-medium text-gray-900">Học phí</span>
                                                        <span className="text-sm text-gray-600 ml-2">{user.hourlyRate ? `${Number(user.hourlyRate).toLocaleString()} đ/giờ` : 'Liên hệ'}</span>
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100">
                                                    <span className="font-medium text-indigo-900 block mb-2">Giới thiệu</span>
                                                    <p className="text-sm text-indigo-700 italic">"{user.bio || 'Chưa có giới thiệu'}"</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-6 rounded-xl bg-gray-50 border border-gray-200 text-center">
                                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                            <User className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <h4 className="font-bold text-gray-900 mb-2">Xin chào, {user.full_name}!</h4>
                                        <p className="text-sm text-gray-600">
                                            Chào mừng bạn đến với TutorPlatform. Hãy cập nhật đầy đủ thông tin để các gia sư có thể dễ dàng liên hệ với bạn nhé.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Button for Student Upgrade */}
                        {user.role !== 'tutor' && (
                            <div className="mt-8 pt-8 border-t">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 flexitems-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-lg text-blue-900 mb-1">Trở thành Gia sư?</h4>
                                        <p className="text-sm text-blue-700 mb-4">Chia sẻ kiến thức và kiếm thêm thu nhập ngay hôm nay.</p>
                                    </div>
                                    <button
                                        onClick={() => window.location.href = '/become-tutor'}
                                        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition-colors w-full sm:w-auto"
                                    >
                                        Đăng ký ngay
                                    </button>
                                </div>
                            </div>
                        )}

                    </form>
                </div>
            </div >

            <Footer />
        </div >
    );
};

export default Profile;
