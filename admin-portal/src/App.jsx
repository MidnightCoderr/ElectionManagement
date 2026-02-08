import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ElectionManagement from './pages/ElectionManagement';
import CandidateManagement from './pages/CandidateManagement';
import Results from './pages/Results';
import TerminalMonitoring from './pages/TerminalMonitoring';
import AuditLogs from './pages/AuditLogs';
import './App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check for existing auth token
        const token = localStorage.getItem('admin_token');
        const userData = localStorage.getItem('admin_user');

        if (token && userData) {
            setIsAuthenticated(true);
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogin = (userData, token) => {
        setIsAuthenticated(true);
        setUser(userData);
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(userData));
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
    };

    return (
        <Router>
            <div className="App">
                {!isAuthenticated ? (
                    <Routes>
                        <Route path="/login" element={<Login onLogin={handleLogin} />} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                ) : (
                    <Routes>
                        <Route path="/dashboard" element={<Dashboard user={user} onLogout={handleLogout} />} />
                        <Route path="/elections" element={<ElectionManagement user={user} onLogout={handleLogout} />} />
                        <Route path="/candidates" element={<CandidateManagement user={user} onLogout={handleLogout} />} />
                        <Route path="/results" element={<Results user={user} onLogout={handleLogout} />} />
                        <Route path="/terminals" element={<TerminalMonitoring user={user} onLogout={handleLogout} />} />
                        <Route path="/audit" element={<AuditLogs user={user} onLogout={handleLogout} />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                )}
            </div>
        </Router>
    );
}

export default App;
