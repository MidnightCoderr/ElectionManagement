import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Server, Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

function TerminalMonitoring({ user, onLogout }) {
    const [terminals, setTerminals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const token = localStorage.getItem('admin_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchTerminals();
        const interval = setInterval(fetchTerminals, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchTerminals = async () => {
        try {
            const res = await axios.get('/api/v1/terminals', { headers });
            setTerminals(res.data.terminals || []);
            setLastRefresh(new Date());
        } catch (err) {
            console.error('Failed to fetch terminals:', err);
            // Show mock data if API unavailable
            setTerminals([]);
        } finally {
            setLoading(false);
        }
    };

    const sendCommand = async (terminalId, command) => {
        try {
            await axios.post(`/api/v1/terminals/${terminalId}/command`, { command }, { headers });
        } catch (err) {
            console.error('Failed to send command:', err);
        }
    };

    const online = terminals.filter(t => t.status === 'ONLINE').length;
    const offline = terminals.filter(t => t.status !== 'ONLINE').length;
    const alerts = terminals.filter(t => t.tamperDetected).length;

    const statusColor = { ONLINE: '#10b981', OFFLINE: '#6b7280', ERROR: '#ef4444', MAINTENANCE: '#f59e0b' };

    return (
        <div className="dashboard-layout">
            <Sidebar user={user} onLogout={onLogout} activePage="terminals" />
            <div className="dashboard-content">
                <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>Terminal Monitoring</h1>
                        <p>IoT voting terminal health & status</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <button onClick={fetchTerminals} style={{ background: '#374151', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <RefreshCw size={16} /> Refresh
                        </button>
                        <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '6px' }}>Last: {lastRefresh.toLocaleTimeString()} · Auto-refresh 15s</p>
                    </div>
                </header>

                <div className="stats-grid" style={{ padding: '0 24px 24px' }}>
                    <div className="stat-card">
                        <div className="stat-icon green"><Wifi size={24} /></div>
                        <div className="stat-content">
                            <h3>Online</h3>
                            <p className="stat-value">{online}</p>
                            <span className="stat-label">Active terminals</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(107,114,128,0.15)' }}><WifiOff size={24} color="#6b7280" /></div>
                        <div className="stat-content">
                            <h3>Offline</h3>
                            <p className="stat-value">{offline}</p>
                            <span className="stat-label">Disconnected</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon orange"><AlertTriangle size={24} /></div>
                        <div className="stat-content">
                            <h3>Tamper Alerts</h3>
                            <p className="stat-value">{alerts}</p>
                            <span className="stat-label">Need attention</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon blue"><Server size={24} /></div>
                        <div className="stat-content">
                            <h3>Total</h3>
                            <p className="stat-value">{terminals.length}</p>
                            <span className="stat-label">Registered terminals</span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">Loading terminals...</div>
                ) : terminals.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
                        <Server size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <p>No IoT terminals registered yet.</p>
                        <p style={{ fontSize: '13px', marginTop: '8px' }}>Terminals appear here automatically when they connect via MQTT.</p>
                    </div>
                ) : (
                    <div style={{ padding: '0 24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                            {terminals.map((t, i) => (
                                <div key={t.id || i} style={{ background: '#1f2937', borderRadius: '12px', padding: '20px', border: `1px solid ${t.tamperDetected ? '#ef4444' : '#374151'}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <div>
                                            <h3 style={{ color: '#f9fafb', margin: 0, marginBottom: '4px' }}>{t.terminalId || t.id}</h3>
                                            <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>{t.location || 'Unknown location'}</p>
                                        </div>
                                        <span style={{ background: statusColor[t.status] || '#6b7280', color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                                            {t.status || 'UNKNOWN'}
                                        </span>
                                    </div>
                                    {t.tamperDetected && (
                                        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <AlertTriangle size={14} /> Tamper detected!
                                        </div>
                                    )}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                        {[
                                            ['Battery', t.batteryLevel ? `${t.batteryLevel}%` : '—'],
                                            ['Last Seen', t.lastHeartbeat ? new Date(t.lastHeartbeat).toLocaleTimeString() : '—'],
                                            ['Votes Cast', t.votesCount || 0],
                                            ['Uptime', t.uptime || '—']
                                        ].map(([label, value]) => (
                                            <div key={label}>
                                                <p style={{ color: '#6b7280', fontSize: '11px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                                                <p style={{ color: '#f9fafb', fontSize: '14px', margin: 0, fontWeight: 500 }}>{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => sendCommand(t.id, 'lock')} style={{ flex: 1, padding: '7px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>🔒 Lock</button>
                                        <button onClick={() => sendCommand(t.id, 'unlock')} style={{ flex: 1, padding: '7px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>🔓 Unlock</button>
                                        <button onClick={() => sendCommand(t.id, 'restart')} style={{ flex: 1, padding: '7px', background: '#374151', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>↺ Restart</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TerminalMonitoring;
