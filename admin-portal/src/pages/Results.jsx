import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Trophy, RefreshCw } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

function Results({ user, onLogout }) {
    const [elections, setElections] = useState([]);
    const [selectedElection, setSelectedElection] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [electionsLoading, setElectionsLoading] = useState(true);

    const token = localStorage.getItem('admin_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        axios.get('/api/v1/elections', { headers })
            .then(res => setElections(res.data.elections || []))
            .catch(err => console.error(err))
            .finally(() => setElectionsLoading(false));
    }, []);

    const fetchResults = async (electionId) => {
        if (!electionId) return;
        setLoading(true);
        setResults(null);
        try {
            const res = await axios.get(`/api/v1/results/${electionId}`, { headers });
            setResults(res.data);
        } catch (err) {
            setResults({ error: err.response?.data?.error?.message || 'Failed to load results' });
        } finally {
            setLoading(false);
        }
    };

    const handleElectionChange = (id) => {
        setSelectedElection(id);
        fetchResults(id);
    };

    const maxVotes = results?.candidates ? Math.max(...results.candidates.map(c => c.voteCount || 0), 1) : 1;

    return (
        <div className="dashboard-layout">
            <Sidebar user={user} onLogout={onLogout} activePage="results" />
            <div className="dashboard-content">
                <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>Election Results</h1>
                        <p>View vote tallies and analytics</p>
                    </div>
                    {selectedElection && (
                        <button onClick={() => fetchResults(selectedElection)} style={{ background: '#374151', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <RefreshCw size={16} /> Refresh
                        </button>
                    )}
                </header>

                <div style={{ padding: '0 24px 24px' }}>
                    <div style={{ background: '#1f2937', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                        <label style={{ color: '#9ca3af', display: 'block', marginBottom: '8px', fontWeight: 500 }}>Select Election</label>
                        {electionsLoading ? (
                            <p style={{ color: '#6b7280' }}>Loading elections...</p>
                        ) : (
                            <select value={selectedElection} onChange={e => handleElectionChange(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: '#f9fafb', fontSize: '15px' }}>
                                <option value="">-- Select an election to view results --</option>
                                {elections.map(el => <option key={el.id} value={el.id}>{el.name} ({el.status})</option>)}
                            </select>
                        )}
                    </div>

                    {loading && <div className="loading-state">Loading results...</div>}

                    {!loading && !selectedElection && (
                        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
                            <BarChart3 size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                            <p>Select an election above to view results.</p>
                        </div>
                    )}

                    {results?.error && (
                        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '16px', borderRadius: '8px' }}>{results.error}</div>
                    )}

                    {results && !results.error && (
                        <>
                            <div className="stats-grid" style={{ marginBottom: '24px' }}>
                                <div className="stat-card">
                                    <div className="stat-icon blue"><BarChart3 size={24} /></div>
                                    <div className="stat-content">
                                        <h3>Total Votes</h3>
                                        <p className="stat-value">{(results.totalVotes || 0).toLocaleString()}</p>
                                        <span className="stat-label">Votes recorded</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon green"><Trophy size={24} /></div>
                                    <div className="stat-content">
                                        <h3>Turnout</h3>
                                        <p className="stat-value">{results.turnoutPercentage ? `${results.turnoutPercentage.toFixed(1)}%` : 'N/A'}</p>
                                        <span className="stat-label">Voter participation</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: '#1f2937', borderRadius: '12px', padding: '24px' }}>
                                <h2 style={{ color: '#f9fafb', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Trophy size={20} color="#f59e0b" /> Candidate Results
                                </h2>
                                {(results.candidates || []).sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0)).map((c, i) => (
                                    <div key={c.id || i} style={{ marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {i === 0 && <span title="Winner">🏆</span>}
                                                <span style={{ color: '#f9fafb', fontWeight: 600 }}>{c.name}</span>
                                                <span style={{ color: '#6b7280', fontSize: '13px' }}>{c.party}</span>
                                            </div>
                                            <span style={{ color: '#3b82f6', fontWeight: 700 }}>{(c.voteCount || 0).toLocaleString()} votes ({results.totalVotes ? ((c.voteCount / results.totalVotes) * 100).toFixed(1) : 0}%)</span>
                                        </div>
                                        <div style={{ background: '#374151', borderRadius: '6px', height: '12px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${((c.voteCount || 0) / maxVotes) * 100}%`,
                                                background: i === 0 ? 'linear-gradient(90deg, #10b981, #3b82f6)' : '#3b82f6',
                                                borderRadius: '6px',
                                                transition: 'width 0.5s ease'
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Results;
