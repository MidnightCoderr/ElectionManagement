import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import VerifyReceipt from './pages/VerifyReceipt';
import Results from './pages/Results';
import About from './pages/About';
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/verify" element={<VerifyReceipt />} />
                    <Route path="/results" element={<Results />} />
                    <Route path="/about" element={<About />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
