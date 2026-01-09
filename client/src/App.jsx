import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <div className="font-sans text-dark antialiased">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Add more routes here later */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
