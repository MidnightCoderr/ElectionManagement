import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, RefreshCw, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

function CandidateManagement({ user, onLogout, embedded }) {
    const [candidates, setCandidates] = useState([]);
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', party: '', electionId: '', symbol: '' });
    const [message, setMessage] = useState(null);
    const [filterElection, setFilterElection] = useState('');

    const token = localStorage.getItem('admin_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [electionsRes, candidatesRes] = await Promise.all([
                axios.get('/api/v1/elections', { headers }),
                axios.get('/api/v1/candidates', { headers })
            ]);
            setElections(electionsRes.data.elections || []);
            setCandidates(candidatesRes.data.candidates || []);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/v1/candidates', form, { headers });
            setMessage({ type: 'success', text: 'Candidate added successfully!' });
            setShowForm(false);
            setForm({ name: '', party: '', electionId: '', symbol: '' });
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error?.message || 'Failed to add candidate' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this candidate?')) return;
        try {
            await axios.delete(`/api/v1/candidates/${id}`, { headers });
            setMessage({ type: 'success', text: 'Candidate deleted.' });
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to delete candidate' });
        }
    };

    const filtered = filterElection ? candidates.filter(c => c.electionId === filterElection || String(c.election_id) === filterElection) : candidates;

    const content = (
        <div className={embedded ? '' : 'dashboard-content'}>
                <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>Candidate Management</h1>
                        <p>Add and manage election candidates</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={fetchData} style={{ background: '#374151', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <RefreshCw size={16} /> Refresh
                        </button>
                        <button onClick={() => setShowForm(!showForm)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Plus size={16} /> Add Candidate
                        </button>
                    </div>
                </header>

                {message && (
                    <div style={{ margin: '0 24px 16px', padding: '12px 16px', borderRadius: '8px', background: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#991b1b' }}>
                        {message.text} <button onClick={() => setMessage(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>×</button>
                    </div>
                )}

                {showForm && (
                    <div style={{ margin: '0 24px 24px', background: '#1f2937', padding: '24px', borderRadius: '12px' }}>
                        <h2 style={{ color: '#f9fafb', marginBottom: '16px' }}>Add New Candidate</h2>
                        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Full Name *</label>
                                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: '#f9fafb', boxSizing: 'border-box' }} placeholder="Candidate Name" />
                            </div>
                            <div>
                                <label style={{ color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Party *</label>
                                <input required value={form.party} onChange={e => setForm({ ...form, party: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: '#f9fafb', boxSizing: 'border-box' }} placeholder="Party Name" />
                            </div>
                            <div>
                                <label style={{ color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Election *</label>
                                <select required value={form.electionId} onChange={e => setForm({ ...form, electionId: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: '#f9fafb', boxSizing: 'border-box' }}>
                                    <option value="">Select Election</option>
                                    {elections.map(el => <option key={el.id} value={el.id}>{el.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Symbol / Icon</label>
                                <input value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: '#f9fafb', boxSizing: 'border-box' }} placeholder="e.g. 🌹" />
                            </div>
                            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #374151', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Add Candidate</button>
                            </div>
                        </form>
                    </div>
                )}

                <div style={{ padding: '0 24px 16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <label style={{ color: '#9ca3af' }}>Filter by Election:</label>
                    <select value={filterElection} onChange={e => setFilterElection(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #374151', background: '#1f2937', color: '#f9fafb' }}>
                        <option value="">All Elections</option>
                        {elections.map(el => <option key={el.id} value={el.id}>{el.name}</option>)}
                    </select>
                    <span style={{ color: '#6b7280', fontSize: '13px' }}>{filtered.length} candidate(s)</span>
                </div>

                {loading ? (
                    <div className="loading-state">Loading candidates...</div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
                        <Users size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <p>No candidates found. Add candidates using the button above.</p>
                    </div>
                ) : (
                    <div style={{ padding: '0 24px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#1f2937', borderRadius: '12px', overflow: 'hidden' }}>
                            <thead>
                                <tr style={{ background: '#111827' }}>
                                    {['Symbol', 'Name', 'Party', 'Election', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((c, i) => (
                                    <tr key={c.id || i} style={{ borderTop: '1px solid #374151' }}>
                                        <td style={{ padding: '14px 16px', fontSize: '24px' }}>{c.symbol || '🏛️'}</td>
                                        <td style={{ padding: '14px 16px', color: '#f9fafb', fontWeight: 500 }}>{c.name}</td>
                                        <td style={{ padding: '14px 16px', color: '#9ca3af' }}>{c.party}</td>
                                        <td style={{ padding: '14px 16px', color: '#9ca3af', fontSize: '13px' }}>{elections.find(e => e.id === c.electionId || e.id === c.election_id)?.name || '—'}</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <button onClick={() => handleDelete(c.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
    );

    if (embedded) return content;

    return (
        <div className="dashboard-layout">
            <Sidebar user={user} onLogout={onLogout} activePage="candidates" />
            {content}
        </div>
    );
}

export default CandidateManagement;
