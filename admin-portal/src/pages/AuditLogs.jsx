import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, RefreshCw, Search, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

function AuditLogs({ user, onLogout }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 20;

    const token = localStorage.getItem('admin_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => { fetchLogs(); }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/v1/audit', { headers, params: { limit: 200 } });
            setLogs(res.data.logs || res.data.auditLogs || []);
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const filtered = logs.filter(log => {
        const matchSearch = !search || JSON.stringify(log).toLowerCase().includes(search.toLowerCase());
        const matchLevel = !filterLevel || log.level === filterLevel || log.severity === filterLevel;
        return matchSearch && matchLevel;
    });

    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

    const levelIcon = (level) => {
        const l = (level || '').toUpperCase();
        if (l === 'ERROR' || l === 'CRITICAL') return <AlertTriangle size={14} color="#ef4444" />;
        if (l === 'WARN' || l === 'WARNING') return <AlertTriangle size={14} color="#f59e0b" />;
        if (l === 'SUCCESS') return <CheckCircle size={14} color="#10b981" />;
        return <Info size={14} color="#3b82f6" />;
    };

    const levelColor = (level) => {
        const l = (level || '').toUpperCase();
        if (l === 'ERROR' || l === 'CRITICAL') return { bg: '#fef2f2', color: '#991b1b' };
        if (l === 'WARN' || l === 'WARNING') return { bg: '#fffbeb', color: '#92400e' };
        if (l === 'SUCCESS') return { bg: '#ecfdf5', color: '#065f46' };
        return { bg: '#eff6ff', color: '#1e40af' };
    };

    return (
        <div className="dashboard-layout">
            <Sidebar user={user} onLogout={onLogout} activePage="audit" />
            <div className="dashboard-content">
                <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>Audit Logs</h1>
                        <p>Complete system activity trail</p>
                    </div>
                    <button onClick={fetchLogs} style={{ background: '#374151', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <RefreshCw size={16} /> Refresh
                    </button>
                </header>

                <div style={{ padding: '0 24px 16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                        <input
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search logs..."
                            style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #374151', background: '#1f2937', color: '#f9fafb', boxSizing: 'border-box' }}
                        />
                    </div>
                    <select value={filterLevel} onChange={e => { setFilterLevel(e.target.value); setPage(1); }}
                        style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #374151', background: '#1f2937', color: '#f9fafb' }}>
                        <option value="">All Levels</option>
                        {['INFO', 'WARN', 'ERROR', 'SUCCESS', 'CRITICAL'].map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <span style={{ color: '#6b7280', fontSize: '13px' }}>{filtered.length} entries</span>
                </div>

                {loading ? (
                    <div className="loading-state">Loading audit logs...</div>
                ) : paginated.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
                        <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <p>{search || filterLevel ? 'No logs match your filter.' : 'No audit logs available.'}</p>
                    </div>
                ) : (
                    <div style={{ padding: '0 24px' }}>
                        <div style={{ background: '#1f2937', borderRadius: '12px', overflow: 'hidden' }}>
                            {paginated.map((log, i) => {
                                const lc = levelColor(log.level || log.severity);
                                return (
                                    <div key={log.id || i} style={{ padding: '12px 16px', borderBottom: i < paginated.length - 1 ? '1px solid #374151' : 'none', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                        <span style={{ marginTop: '2px', flexShrink: 0 }}>{levelIcon(log.level || log.severity)}</span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <span style={{ ...lc, padding: '1px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>{(log.level || log.severity || 'INFO').toUpperCase()}</span>
                                                    {log.action && <span style={{ color: '#9ca3af', fontWeight: 600, fontSize: '13px' }}>{log.action}</span>}
                                                    {log.userId && <span style={{ color: '#6b7280', fontSize: '12px' }}>by {log.userId}</span>}
                                                </div>
                                                <span style={{ color: '#6b7280', fontSize: '12px', flexShrink: 0 }}>
                                                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                                                </span>
                                            </div>
                                            <p style={{ color: '#d1d5db', margin: 0, fontSize: '13px', wordBreak: 'break-word' }}>
                                                {log.message || log.details || JSON.stringify(log.metadata || {})}
                                            </p>
                                            {log.ipAddress && <span style={{ color: '#6b7280', fontSize: '11px' }}>IP: {log.ipAddress}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px', paddingBottom: '24px' }}>
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #374151', background: page === 1 ? '#1f2937' : '#374151', color: '#f9fafb', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
                                    ← Prev
                                </button>
                                <span style={{ padding: '8px 16px', color: '#9ca3af', fontSize: '14px' }}>Page {page} of {totalPages}</span>
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #374151', background: page === totalPages ? '#1f2937' : '#374151', color: '#f9fafb', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>
                                    Next →
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AuditLogs;
