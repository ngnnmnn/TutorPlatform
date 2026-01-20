import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, Clock, Save, ArrowLeft, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UpdateAvailability = () => {
    const navigate = useNavigate();
    const [timeSlots, setTimeSlots] = useState([]);
    const [availability, setAvailability] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Manage week view. Default to current week (starting today or nearest Monday?)
    // Requirement says "update for next week". Let's show 7 days starting from today.
    const [startDate, setStartDate] = useState(new Date());

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [startDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // 1. Get Time Slots
            const slotsRes = await axios.get('http://localhost:5000/api/schedule/time-slots');
            setTimeSlots(slotsRes.data);

            // 2. Get Availability for the range
            // Calculate range
            const end = new Date(startDate);
            end.setDate(startDate.getDate() + 7);

            const avaiRes = await axios.get('http://localhost:5000/api/schedule/availability', {
                params: {
                    start: startDate.toISOString(),
                    end: end.toISOString()
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            setAvailability(avaiRes.data);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysArray = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            days.push(date);
        }
        return days;
    };

    const days = getDaysArray();

    const isSlotSelected = (date, slotId) => {
        return availability.some(av => {
            const avDate = new Date(av.avai_date);
            const targetDate = new Date(date);
            return avDate.getDate() === targetDate.getDate() &&
                avDate.getMonth() === targetDate.getMonth() &&
                avDate.getFullYear() === targetDate.getFullYear() &&
                (av.timeSchId._id === slotId || av.timeSchId === slotId);
        });
    };

    const toggleSlot = (date, slotId) => {
        // Optimistic update
        const dateStr = date.toISOString();
        const existingIndex = availability.findIndex(av => {
            const avDate = new Date(av.avai_date);
            const targetDate = new Date(date);
            return avDate.getDate() === targetDate.getDate() &&
                avDate.getMonth() === targetDate.getMonth() &&
                avDate.getFullYear() === targetDate.getFullYear() &&
                (av.timeSchId._id === slotId || av.timeSchId === slotId);
        });

        if (existingIndex >= 0) {
            // Remove
            const newAvail = [...availability];
            newAvail.splice(existingIndex, 1);
            setAvailability(newAvail);
        } else {
            // Add
            // We need the slot object probably? Or just ID is enough for checking
            setAvailability([...availability, {
                avai_date: dateStr,
                timeSchId: slotId // Mocking structure for local check
            }]);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Group by date to send requests
            const grouped = {};

            // Initialize groups for all days in view to ensure clears happen if all unchecked
            days.forEach(day => {
                const dateKey = day.toISOString().split('T')[0]; // YYYY-MM-DD
                grouped[dateKey] = [];
            });

            // Fill with selected
            availability.forEach(av => {
                const date = new Date(av.avai_date);
                // Check if this availability falls within our current view (to avoid saving data outside view if we were filtering)
                // But simplified: just iterate days in view and find matches in availability
                days.forEach(viewDay => {
                    if (date.getDate() === viewDay.getDate() &&
                        date.getMonth() === viewDay.getMonth() &&
                        date.getFullYear() === viewDay.getFullYear()) {
                        const dateKey = viewDay.toISOString().split('T')[0];
                        // Handle both populated object and raw ID
                        const slotId = typeof av.timeSchId === 'object' ? av.timeSchId._id : av.timeSchId;
                        if (grouped[dateKey] && !grouped[dateKey].includes(slotId)) {
                            grouped[dateKey].push(slotId);
                        }
                    }
                });
            });

            // Send requests
            const promises = Object.keys(grouped).map(dateKey => {
                return axios.post('http://localhost:5000/api/schedule/availability', {
                    date: dateKey,
                    timeSchIds: grouped[dateKey]
                }, config);
            });

            await Promise.all(promises);
            alert('Cập nhật lịch thành công!');
            // Re-fetch to be clean
            fetchData();

        } catch (error) {
            console.error('Error saving:', error);
            alert('Lỗi khi lưu lịch. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    const handleNextWeek = () => {
        const next = new Date(startDate);
        next.setDate(startDate.getDate() + 7);
        setStartDate(next);
    };

    const handlePrevWeek = () => {
        const prev = new Date(startDate);
        prev.setDate(startDate.getDate() - 7);
        // Don't allow past dates?
        if (prev < new Date()) {
            setStartDate(new Date());
        } else {
            setStartDate(prev);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <div className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <button
                            onClick={() => navigate('/my-bookings')}
                            className="flex items-center text-gray-500 hover:text-dark mb-2 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Quay lại
                        </button>
                        <h1 className="text-2xl font-bold text-dark flex items-center gap-2">
                            <Calendar className="w-7 h-7 text-primary" />
                            Cập nhật lịch rảnh
                        </h1>
                        <p className="text-gray-500">Chọn các khung giờ bạn có thể nhận lớp</p>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            'Đang lưu...'
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Lưu thay đổi
                            </>
                        )}
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Controls */}
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div className="font-semibold text-lg text-gray-700">
                            {startDate.toLocaleDateString('vi-VN')} - {days[6].toLocaleDateString('vi-VN')}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handlePrevWeek} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={handleNextWeek} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/80">
                                    <th className="p-4 border-b border-r border-gray-100 min-w-[100px] text-left text-sm font-semibold text-gray-600 sticky left-0 bg-gray-50/80">
                                        Khung giờ
                                    </th>
                                    {days.map((day, i) => (
                                        <th key={i} className="p-4 border-b border-gray-100 min-w-[120px] text-center">
                                            <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                                                {day.toLocaleDateString('vi-VN', { weekday: 'long' })}
                                            </div>
                                            <div className="text-lg font-bold text-dark">
                                                {day.getDate()}/{day.getMonth() + 1}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="p-12 text-center text-gray-500">
                                            Đang tải dữ liệu...
                                        </td>
                                    </tr>
                                ) : (
                                    timeSlots.map((slot) => (
                                        <tr key={slot._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 border-r border-gray-100 text-sm font-medium text-gray-700 sticky left-0 bg-white">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-primary/70" />
                                                    {slot.from} - {slot.to}
                                                </div>
                                            </td>
                                            {days.map((day, i) => {
                                                const selected = isSlotSelected(day, slot._id);
                                                return (
                                                    <td key={i} className="p-2 text-center border-gray-50">
                                                        <button
                                                            onClick={() => toggleSlot(day, slot._id)}
                                                            className={`w-full h-12 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${selected
                                                                    ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
                                                                    : 'bg-white border-gray-100 text-gray-300 hover:border-primary/50'
                                                                }`}
                                                        >
                                                            {selected && <Check className="w-6 h-6" />}
                                                        </button>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-6 text-center text-gray-500 text-sm">
                    * Nhấn vào các ô để chọn/bỏ chọn lịch rảnh. Nhớ nhấn "Lưu thay đổi" sau khi hoàn tất.
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default UpdateAvailability;
