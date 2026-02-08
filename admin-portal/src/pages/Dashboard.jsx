import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BarChart3, Users, Vote, Server, AlertTriangle, Activity } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

function Dashboard({ user, onLogout }) {
    const [stats, setStats] = useState({
        totalElections: 0,
        activeElections: 0,
        totalVoters: 0,
        totalTerminals: 0,
        onlineTerminals: 0,
        recentAlerts: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('admin_token');

            // Fetch elections
            const electionsRes = await axios.get('/api/v1/elections', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const elections = electionsRes.data.elections || [];
            const activeElections = elections.filter(e => e.status === 'ACTIVE').length;

            // TODO: Fetch actual stats from API
            setStats({
                totalElections: elections.length,
                activeElections,
                totalVoters: 0,  // TODO: Implement voter count API
                totalTerminals: 0,  // TODO: Implement terminal count API
                onlineTerminals: 0,  // TODO: Implement terminal status API
                recentAlerts: []  // TODO: Implement alerts API
            });

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar user={user} onLogout={onLogout} activePage="dashboard" />

            <div className="dashboard-content">
                <header className="dashboard-header">
                    <h1>Dashboard</h1>
                    <p>Welcome back, {user.username}!</p>
                </header>

                {loading ? (
                    <div className="loading-state">Loading...</div>
                ) : (
                    <>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon blue">
                                    <Vote size={24} />
                                </div>
                                <div className="stat-content">
                                    <h3>Total Elections</h3>
                                    <p className="stat-value">{stats.totalElections}</p>
                                    <span className="stat-label">{stats.activeElections} active</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon green">
                                    <Users size={24} />
                                </div>
                                <div className="stat-content">
                                    <h3>Registered Voters</h3>
                                    <p className="stat-value">{stats.totalVoters.toLocaleString()}</p>
                                    <span className="stat-label">Across all districts</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon purple">
                                    <Server size={24} />
                                </div>
                                <div className="stat-content">
                                    <h3>IoT Terminals</h3>
                                    <p className="stat-value">{stats.totalTerminals}</p>
                                    <span className="stat-label">{stats.onlineTerminals} online</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon orange">
                                    <Activity size={24} />
                                </div>
                                <div className="stat-content">
                                    <h3>System Status</h3>
                                    <p className="stat-value">✅ Healthy</p>
                                    <span className="stat-label">All systems operational</span>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-sections">
                            <div className="section">
                                <h2>Quick Actions</h2>
                                <div className="action-grid">
                                    <Link to="/elections" className="action-card">
                                        <Vote size={32} />
                                        <h3>Create Election</h3>
                                        <p>Set up a new election</p>
                                    </Link>

                                    <Link to="/candidates" className="action-card">
                                        <Users size={32} />
                                        <h3>Manage Candidates</h3>
                                        <p>Add or update candidates</p>
                                    </Link>

                                    <Link to="/terminals" className="action-card">
                                        <Server size={32} />
                                        <h3>Monitor Terminals</h3>
                                        <p>View terminal status</p>
                                    </Link>

                                    <Link to="/results" className="action-card">
                                        <BarChart3 size={32} />
                                        <h3>View Results</h3>
                                        <p>Election results & analytics</p>
                                    </Link>
                                </div>
                            </div>

                            {stats.recentAlerts.length > 0 && (
                                <div className="section alerts-section">
                                    <h2><AlertTriangle size={20} /> Recent Alerts</h2>
                                    <div className="alerts-list">
                                        {stats.recentAlerts.map((alert, idx) => (
                                            <div key={idx} className={`alert-item ${alert.severity}`}>
                                                <span className="alert-time">{alert.time}</span>
                                                <span className="alert-message">{alert.message}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
