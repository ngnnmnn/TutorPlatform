import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Tutors from './pages/Tutors';

function App() {
  return (
    <Router>
      <div className="font-sans text-dark antialiased">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tutors" element={<Tutors />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
