import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Tutors from './pages/Tutors';
import TutorDetail from './pages/TutorDetail';
import TutorProfileEdit from './pages/TutorProfileEdit';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';

import Profile from './pages/Profile';
import BecomeTutor from './pages/BecomeTutor';
import VerifyEmail from './pages/VerifyEmail';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';

import Schedule from './pages/Schedule';
import MyBookings from './pages/MyBookings';

function App() {
  return (
    <Router>
      <div className="font-sans text-dark antialiased">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tutors" element={<Tutors />} />
          <Route path="/tutors/:id" element={<TutorDetail />} />
          <Route path="/tutor-profile/edit" element={<TutorProfileEdit />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify/:token" element={<VerifyEmail />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/become-tutor" element={<BecomeTutor />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* 404 Catch-all Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

