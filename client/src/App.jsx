import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Tutors from './pages/Tutors';
import TutorDetail from './pages/TutorDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';

function App() {
  return (
    <Router>
      <div className="font-sans text-dark antialiased">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tutors" element={<Tutors />} />
          <Route path="/tutors/:id" element={<TutorDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/feed" element={<Feed />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
