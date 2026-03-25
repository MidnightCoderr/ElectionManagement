import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Vote, Plus, Play, Square, Trash2, RefreshCw } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

function ElectionManagement({ user, onLogout, embedded }) {
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', description: '', startDate: '', endDate: '' });
    const [message, setMessage] = useState(null);

    const token = localStorage.getItem('admin_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => { fetchElections(); }, []);

    const fetchElections = async () => {
        try {
            const res = await axios.get('/api/v1/elections', { headers });
            setElections(res.data.elections || []);
        } catch (err) {
            console.error('Failed to fetch elections:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/v1/elections', form, { headers });
            setMessage({ type: 'success', text: 'Election created successfully!' });
            setShowForm(false);
            setForm({ name: '', description: '', startDate: '', endDate: '' });
            fetchElections();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error?.message || 'Failed to create election' });
        }
    };

    const handleStatusChange = async (id, action) => {
        try {
            await axios.patch(`/api/v1/elections/${id}/${action}`, {}, { headers });
            setMessage({ type: 'success', text: `Election ${action}ed successfully!` });
            fetchElections();
        } catch (err) {
            setMessage({ type: 'error', text: `Failed to ${action} election` });
        }
    };

    const statusBadge = (status) => {
        const colors = { DRAFT: '#6b7280', ACTIVE: '#10b981', CLOSED: '#ef4444', COUNTING: '#f59e0b' };
        return <span style={{ background: colors[status] || '#6b7280', color: '#fff', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>{status}</span>;
    };

    const content = (
        <div className={embedded ? '' : 'dashboard-content'}>
                <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>Election Management</h1>
                        <p>Create and manage elections</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={fetchElections} className="action-btn" style={{ background: '#374151', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <RefreshCw size={16} /> Refresh
                        </button>
                        <button onClick={() => setShowForm(!showForm)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Plus size={16} /> New Election
                        </button>
                    </div>
                </header>

                {message && (
                    <div style={{ margin: '0 24px 16px', padding: '12px 16px', borderRadius: '8px', background: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#991b1b' }}>
                        {message.text}
                        <button onClick={() => setMessage(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>×</button>
                    </div>
                )}

                {showForm && (
                    <div style={{ margin: '0 24px 24px', background: '#1f2937', padding: '24px', borderRadius: '12px' }}>
                        <h2 style={{ color: '#f9fafb', marginBottom: '16px' }}>Create New Election</h2>
                        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Election Name *</label>
                                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: '#f9fafb', boxSizing: 'border-box' }} placeholder="e.g. General Election 2026" />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Description</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: '#f9fafb', boxSizing: 'border-box', resize: 'vertical' }} />
                            </div>
                            <div>
                                <label style={{ color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Start Date *</label>
                                <input required type="datetime-local" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: '#f9fafb', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ color: '#9ca3af', display: 'block', marginBottom: '6px' }}>End Date *</label>
                                <input required type="datetime-local" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: '#f9fafb', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #374151', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Create Election</button>
                            </div>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className="loading-state">Loading elections...</div>
                ) : elections.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
                        <Vote size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <p>No elections yet. Create your first election above.</p>
                    </div>
                ) : (
                    <div style={{ padding: '0 24px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#1f2937', borderRadius: '12px', overflow: 'hidden' }}>
                            <thead>
                                <tr style={{ background: '#111827' }}>
                                    {['Name', 'Status', 'Start Date', 'End Date', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {elections.map((el, i) => (
                                    <tr key={el.id || i} style={{ borderTop: '1px solid #374151' }}>
                                        <td style={{ padding: '14px 16px', color: '#f9fafb', fontWeight: 500 }}>{el.name}</td>
                                        <td style={{ padding: '14px 16px' }}>{statusBadge(el.status)}</td>
                                        <td style={{ padding: '14px 16px', color: '#9ca3af', fontSize: '13px' }}>{el.startDate ? new Date(el.startDate).toLocaleString() : '—'}</td>
                                        <td style={{ padding: '14px 16px', color: '#9ca3af', fontSize: '13px' }}>{el.endDate ? new Date(el.endDate).toLocaleString() : '—'}</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {el.status === 'DRAFT' && (
                                                    <button onClick={() => handleStatusChange(el.id, 'start')} title="Start" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                                                        <Play size={14} /> Start
                                                    </button>
                                                )}
                                                {el.status === 'ACTIVE' && (
                                                    <button onClick={() => handleStatusChange(el.id, 'end')} title="End" style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                                                        <Square size={14} /> End
                                                    </button>
                                                )}
                                            </div>
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
            <Sidebar user={user} onLogout={onLogout} activePage="elections" />
            {content}
        </div>
    );
}

export default ElectionManagement;
