import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-light">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

const Home = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary to-secondary text-white">
    <h1 className="text-5xl font-bold mb-4">Tutor Platform</h1>
    <p className="text-xl">Connecting students with the best tutors.</p>
    <button className="mt-8 px-6 py-3 bg-white text-primary font-semibold rounded-full shadow-lg hover:shadow-xl transition-all">
      Get Started
    </button>
  </div>
);

export default App;
