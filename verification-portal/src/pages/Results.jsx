import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BarChart3, Trophy, ArrowLeft, RefreshCw } from 'lucide-react';

const API_BASE = 'http://localhost:3000/api/v1';

function Results() {
    const [elections, setElections] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [electionsLoading, setElectionsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get(`${API_BASE}/elections`)
            .then(res => setElections((res.data.elections || []).filter(e => e.status === 'CLOSED' || e.status === 'COUNTING')))
            .catch(() => setError('Could not load elections from blockchain.'))
            .finally(() => setElectionsLoading(false));
    }, []);

    const fetchResults = async (id) => {
        if (!id) return;
        setLoading(true);
        setResults(null);
        setError('');
        try {
            const res = await axios.get(`${API_BASE}/results/${id}`);
            setResults(res.data);
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to load results. Results may not be available yet.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (id) => { setSelectedId(id); fetchResults(id); };
    const maxVotes = results?.candidates ? Math.max(...results.candidates.map(c => c.voteCount || 0), 1) : 1;

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '32px 16px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Link to="/" style={{ color: '#475569', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}>
                    <ArrowLeft size={16} /> Back to Home
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ color: '#0B1F3A', fontSize: '32px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>Public Election Results</h1>
                    <p style={{ color: '#475569', margin: 0 }}>Live results sourced directly from the blockchain</p>
                </div>

                <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
                    <label style={{ color: '#475569', display: 'block', marginBottom: '10px', fontWeight: 600, fontSize: '14px' }}>Select Election</label>
                    {electionsLoading ? (
                        <p style={{ color: '#94A3B8' }}>Loading elections from blockchain...</p>
                    ) : elections.length === 0 ? (
                        <p style={{ color: '#94A3B8' }}>No completed elections available yet.</p>
                    ) : (
                        <select value={selectedId} onChange={e => handleSelect(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#0F172A', fontSize: '15px', fontFamily: 'Inter, sans-serif' }}>
                            <option value="">-- Select a completed election --</option>
                            {elections.map(el => <option key={el.id} value={el.id}>{el.name}</option>)}
                        </select>
                    )}
                    {selectedId && (
                        <button onClick={() => fetchResults(selectedId)} style={{ marginTop: '12px', background: '#FFFFFF', color: '#475569', border: '1px solid #E2E8F0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s' }}>
                            <RefreshCw size={14} /> Refresh from blockchain
                        </button>
                    )}
                </div>

                {error && (
                    <div style={{ background: 'rgba(185,28,28,0.04)', border: '1px solid rgba(185,28,28,0.15)', color: '#B91C1C', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px' }}>
                        {error}
                    </div>
                )}

                {loading && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⛓️</div>
                        <p>Fetching results from blockchain...</p>
                    </div>
                )}

                {!loading && !selectedId && !error && (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>
                        <BarChart3 size={48} style={{ marginBottom: '16px', opacity: 0.4 }} />
                        <p>Select an election above to view its results.</p>
                    </div>
                )}

                {results && !loading && (
                    <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '28px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                            <div>
                                <h2 style={{ color: '#0B1F3A', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                                    <Trophy size={20} color="#C9A227" /> Results
                                </h2>
                                <p style={{ color: '#475569', margin: 0, fontSize: '13px' }}>Total votes: {(results.totalVotes || 0).toLocaleString()} · Turnout: {results.turnoutPercentage ? `${results.turnoutPercentage.toFixed(1)}%` : 'N/A'}</p>
                            </div>
                            <span style={{ background: 'rgba(201,162,39,0.08)', color: '#C9A227', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, alignSelf: 'center', border: '1px solid rgba(201,162,39,0.2)' }}>⛓️ Blockchain Verified</span>
                        </div>

                        {(results.candidates || []).sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0)).map((c, i) => (
                            <div key={c.id || i} style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '20px' }}>{i === 0 ? '🏆' : `#${i + 1}`}</span>
                                        <div>
                                            <p style={{ color: '#0F172A', fontWeight: 600, margin: 0 }}>{c.name}</p>
                                            <p style={{ color: '#475569', fontSize: '12px', margin: 0 }}>{c.party}</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ color: '#4F46E5', fontWeight: 700, margin: 0 }}>{(c.voteCount || 0).toLocaleString()}</p>
                                        <p style={{ color: '#475569', fontSize: '12px', margin: 0 }}>
                                            {results.totalVotes ? `${((c.voteCount / results.totalVotes) * 100).toFixed(1)}%` : '0%'}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ background: '#F1F5F9', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${((c.voteCount || 0) / maxVotes) * 100}%`,
                                        background: i === 0 ? 'linear-gradient(90deg, #C9A227, #15803D)' : 'linear-gradient(90deg, #4F46E5, #1B3B6F)',
                                        borderRadius: '8px',
                                        transition: 'width 0.6s ease'
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Results;
