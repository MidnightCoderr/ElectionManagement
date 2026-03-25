import { useState, useEffect, useRef } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import { fetchElections, fetchAuditLogs, fetchCandidates, checkHealth } from '../services/api.js'
import ElectionsContent from './ElectionManagement.jsx'
import CandidatesContent from './CandidateManagement.jsx'
import './Dashboard.css'

// ── Fallback mock data (used when API calls fail) ────────────────────────────
const FALLBACK_ELECTIONS = [
  { election_id: '1', election_name: 'Student Council President 2026', election_type: 'council', start_date: '2026-04-01', status: 'active', total_votes_cast: 2847 },
  { election_id: '2', election_name: 'CS Department CR Election', election_type: 'class_rep', start_date: '2026-04-10', status: 'upcoming', total_votes_cast: 0 },
  { election_id: '3', election_name: 'EE Department CR Election', election_type: 'class_rep', start_date: '2026-03-01', status: 'completed', total_votes_cast: 456 },
]

const ALERTS = [
  { level: 'high',   terminal: 'TERM-00089', msg: 'Unusual voting spike',        detail: '45 votes in 5 minutes — 3x normal rate' },
  { level: 'high',   terminal: 'TERM-00234', msg: 'Multiple failed biometrics',  detail: '12 failed scans in 4 minutes' },
  { level: 'medium', terminal: 'TERM-00012', msg: 'Terminal offline',            detail: 'No heartbeat for 22 minutes' },
  { level: 'low',    terminal: 'TERM-00301', msg: 'Low battery warning',         detail: 'Battery at 8% — needs replacement' },
]

const PAGES = {
  dashboard:  'Dashboard',
  elections:  'Elections',
  candidates: 'Candidates',
  voters:     'Voters',
  alerts:     'Alerts',
  users:      'Admin Users',
  settings:   'Settings',
  logs:       'System Logs',
}

// ── Main component ─────────────────────────────────────────────────────────
export default function Dashboard({ admin, onLogout }) {
  const [page, setPage]             = useState('dashboard')
  const [votes, setVotes]           = useState(0)
  const [clock, setClock]           = useState('')
  const [elections, setElections]   = useState([])
  const [activity, setActivity]     = useState([])
  const [backendUp, setBackendUp]   = useState(null)
  const canvasRef                   = useRef(null)

  // Live clock
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-IN'))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Fetch elections and activity from API on mount
  useEffect(() => {
    async function loadData() {
      try {
        const health = await checkHealth()
        setBackendUp(health.status === 'healthy')
      } catch { setBackendUp(false) }

      try {
        const data = await fetchElections()
        const elecs = data.elections || []
        setElections(elecs.length > 0 ? elecs : FALLBACK_ELECTIONS)
        const activeElection = elecs.find(e => e.status === 'active')
        if (activeElection) setVotes(activeElection.total_votes_cast || 0)
        else setVotes(1234567)
      } catch { setElections(FALLBACK_ELECTIONS); setVotes(1234567) }

      try {
        const data = await fetchAuditLogs({ limit: 6 })
        const logs = data.logs || []
        const colorMap = { vote_cast: 'green', admin_login: 'orange', fraud_alert: 'red', candidate_added: 'blue', election_created: 'gold' }
        setActivity(logs.length > 0
          ? logs.map(l => ({
              color: colorMap[l.event_type] || 'blue',
              text: l.action || l.event_type,
              time: new Date(l.timestamp).toLocaleTimeString('en-IN'),
            }))
          : [
              { color: 'green', text: 'Terminal TERM-00045 came back online', time: '2 min ago' },
              { color: 'red', text: 'HIGH alert: Unusual voting spike on TERM-00089', time: '5 min ago' },
              { color: 'blue', text: 'Candidate list updated for Karnataka election', time: '12 min ago' },
              { color: 'orange', text: 'Admin Priya Mehta logged in from 192.168.1.42', time: '18 min ago' },
              { color: 'green', text: '1,234,567th vote cast — General Election 2024', time: '21 min ago' },
              { color: 'gold', text: 'Blockchain snapshot published to Ethereum mainnet', time: '1 hr ago' },
            ]
        )
      } catch {
        setActivity([
          { color: 'green', text: 'Terminal TERM-00045 came back online', time: '2 min ago' },
          { color: 'red', text: 'HIGH alert: Unusual voting spike on TERM-00089', time: '5 min ago' },
          { color: 'blue', text: 'Candidate list updated for Karnataka election', time: '12 min ago' },
          { color: 'orange', text: 'Admin Priya Mehta logged in from 192.168.1.42', time: '18 min ago' },
        ])
      }
    }
    loadData()
  }, [])

  // Live vote counter (simulated increment when backend is not live)
  useEffect(() => {
    const id = setInterval(() => setVotes(v => v + Math.floor(Math.random() * 8 + 1)), 2500)
    return () => clearInterval(id)
  }, [])

  // Draw chart when on dashboard
  useEffect(() => {
    if (page !== 'dashboard') return
    requestAnimationFrame(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      canvas.width  = canvas.offsetWidth || 600
      canvas.height = 160
      const w = canvas.width, h = canvas.height
      const pts = Array.from({ length: 48 }, (_, i) =>
        3000 + Math.sin(i * 0.3) * 1500 + Math.random() * 2000
      )
      ctx.clearRect(0, 0, w, h)
      // Grid
      ctx.strokeStyle = '#21262d'; ctx.lineWidth = 1
      for (let i = 0; i < 4; i++) {
        const y = (h / 4) * i
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
      }
      // Gradient fill
      const grad = ctx.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, 'rgba(255,107,0,.35)')
      grad.addColorStop(1, 'rgba(255,107,0,0)')
      ctx.beginPath(); ctx.moveTo(0, h)
      pts.forEach((v, i) => { const x = (w / pts.length) * i, y = h - (v / 7000) * h; ctx.lineTo(x, y) })
      ctx.lineTo(w, h); ctx.closePath(); ctx.fillStyle = grad; ctx.fill()
      // Line
      ctx.beginPath()
      pts.forEach((v, i) => { const x = (w / pts.length) * i, y = h - (v / 7000) * h; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) })
      ctx.strokeStyle = '#FF6B00'; ctx.lineWidth = 2; ctx.stroke()
    })
  }, [page])

  function handleNavigate(id) {
    if (id === 'logout') { onLogout(); return }
    setPage(id)
  }

  const termStatuses = Array.from({ length: 64 }, (_, i) => {
    const r = Math.random()
    if (i === 11 || i === 33) return 'offline'
    return r < .05 ? 'offline' : r < .12 ? 'warn' : 'online'
  })

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
      <Sidebar activePage={page} onNavigate={handleNavigate} admin={admin} />

      <div className="dashboard">
        {/* Topbar */}
        <div className="dash-topbar">
          <div className="dash-topbar-left">
            <div>
              <div className="dash-page-title">{PAGES[page] || 'Dashboard'}</div>
              <div className="dash-breadcrumb">Admin Portal &nbsp;/&nbsp; {PAGES[page] || 'Dashboard'}</div>
            </div>
            {page === 'dashboard' && <span className="live-badge">🔴 LIVE</span>}
          </div>
          <div className="dash-topbar-right">
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>{clock}</span>
            {backendUp !== null && (
              <span style={{ fontSize: 11, color: backendUp ? '#22d47a' : '#f04f58', fontWeight: 600 }}>
                {backendUp ? 'API Connected' : 'API Offline (Mock)'}
              </span>
            )}
            <button className="topbar-btn">Export</button>
            <button className="topbar-btn primary" onClick={() => setPage('elections')}>
              + New Election
            </button>
          </div>
        </div>

        {/* ── DASHBOARD PAGE ── */}
        {page === 'dashboard' && (
          <div className="dash-content">

            {/* KPIs */}
            <div>
              <div className="section-title">Live Overview · Student Council Election 2026</div>
              <div className="kpi-grid">
                {[
                  { color: 'green',  icon: '🗳',  label: 'Total Votes',       value: votes.toLocaleString('en-IN'), sub: '↑ live updates' },
                  { color: 'blue',   icon: '📊', label: 'Voter Turnout',      value: '67.3%',    sub: 'of 4,230 registered students' },
                  { color: 'orange', icon: '🖥',  label: 'Active Terminals',  value: '12',       sub: 'of 15 total' },
                  { color: 'purple', icon: '🏫',  label: 'Departments',       value: '6',        sub: 'of 6 total' },
                  { color: 'red',    icon: '🚨', label: 'Active Alerts',      value: '2',         sub: '1 High · 1 Medium' },
                  { color: 'gold',   icon: '⛓',  label: 'Blockchain Blocks', value: '892',      sub: 'last block 8s ago' },
                ].map(k => (
                  <div key={k.label} className={`kpi-card ${k.color}`}>
                    <div className="kpi-icon">{k.icon}</div>
                    <div className="kpi-label">{k.label}</div>
                    <div className="kpi-value">{k.value}</div>
                    <div className="kpi-sub">{k.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart + Activity */}
            <div className="three-col">
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">📈 Voting Rate — Last 4 Hours</div>
                  <button className="panel-action">Export CSV</button>
                </div>
                <div className="chart-wrap">
                  <canvas ref={canvasRef} style={{ width: '100%', height: 160 }} />
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">⚡ Live Activity</div>
                  <button className="panel-action">View All</button>
                </div>
                {activity.map((a, i) => (
                  <div key={i} className="activity-item">
                    <div className={`activity-dot ${a.color}`} />
                    <div className="activity-text">{a.text}</div>
                    <div className="activity-time">{a.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Turnout by party + Alerts */}
            <div className="two-col">
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">📊 Turnout by Department</div>
                </div>
                <div className="progress-bar-wrap">
                  {[
                    { label: 'Computer Science', pct: 82, color: '#FF6B00' },
                    { label: 'Electrical Eng.',  pct: 75, color: '#2563EB' },
                    { label: 'Mechanical Eng.',  pct: 68, color: '#138808' },
                    { label: 'Business School',  pct: 61, color: '#7c3aed' },
                    { label: 'Civil Eng.',        pct: 54, color: '#E67E22' },
                    { label: 'Biotechnology',     pct: 48, color: '#1DB954' },
                  ].map(d => (
                    <div key={d.label} className="progress-bar-row">
                      <span className="progress-bar-label">{d.label}</span>
                      <div className="progress-bar-track">
                        <div className="progress-bar-fill" style={{ width: `${d.pct}%`, background: d.color }} />
                      </div>
                      <span className="progress-bar-value">{d.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">🚨 Recent Alerts</div>
                  <button className="panel-action" onClick={() => setPage('alerts')}>View All</button>
                </div>
                {ALERTS.map((a, i) => (
                  <div key={i} className="alert-row">
                    <span className={`alert-level ${a.level}`}>{a.level.toUpperCase()}</span>
                    <div style={{ flex: 1 }}>
                      <div className="alert-msg">{a.msg}</div>
                      <div className="alert-detail">{a.terminal} · {a.detail}</div>
                      <div className="alert-actions-row">
                        <button className="alert-btn danger">Investigate</button>
                        <button className="alert-btn muted">Dismiss</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Elections table + Terminal grid */}
            <div className="two-col">
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">🗳 Elections</div>
                  <button className="panel-action" onClick={() => setPage('elections')}>Manage</button>
                </div>
                <table className="data-table">
                  <thead>
                    <tr><th>Election</th><th>Date</th><th>Status</th><th>Votes</th></tr>
                  </thead>
                  <tbody>
                    {elections.map(e => (
                      <tr key={e.election_id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{e.election_name}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{e.election_type}</div>
                        </td>
                        <td style={{ color: 'var(--muted)', fontSize: 12 }}>{e.start_date}</td>
                        <td><span className={`status-badge ${e.status}`}>{e.status}</span></td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{(e.total_votes_cast || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">🖥 Terminal Status</div>
                  <button className="panel-action" onClick={() => setPage('terminals')}>Full View</button>
                </div>
                <div className="terminal-grid">
                  {termStatuses.map((s, i) => (
                    <div key={i} className={`t-dot ${s}`} title={`TERM-${String(i+1).padStart(5,'0')}: ${s}`} />
                  ))}
                </div>
                <div className="t-legend">
                  <span><span style={{ color: 'var(--green)' }}>■</span> Online: 45,234</span>
                  <span><span style={{ color: 'var(--orange)' }}>■</span> Warn: 1,502</span>
                  <span><span style={{ color: 'var(--red)' }}>■</span> Offline: 1,264</span>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">⚡ Quick Actions</div>
              </div>
              <div className="quick-actions">
                {[
                  { icon: '➕', label: 'New Election',     sub: 'Create & configure',  page: 'elections' },
                  { icon: '👤', label: 'Add Candidate',    sub: 'Register candidate',  page: 'candidates' },
                  { icon: '📋', label: 'Import Voters',    sub: 'Bulk CSV upload',     page: 'voters' },
                  { icon: '👥', label: 'Manage Admins',    sub: 'Roles & access',      page: 'users' },
                  { icon: '⚙',  label: 'Settings',         sub: 'System config',       page: 'settings' },
                ].map(a => (
                  <button key={a.label} className="quick-action-card" onClick={() => setPage(a.page)}>
                    <div className="quick-action-icon">{a.icon}</div>
                    <div className="quick-action-label">{a.label}</div>
                    <div className="quick-action-sub">{a.sub}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ── OTHER PAGES ── */}
        {page !== 'dashboard' && (
          <div className="dash-content">
            {page === 'elections' && <ElectionsContent user={admin} onLogout={onLogout} embedded />}
            {page === 'candidates' && <CandidatesContent user={admin} onLogout={onLogout} embedded />}
            {!['elections','candidates'].includes(page) && (
              <PlaceholderPage page={page} pageName={PAGES[page]} onBack={() => setPage('dashboard')} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Placeholder for non-dashboard pages ────────────────────────────────────
function PlaceholderPage({ page, pageName, onBack }) {
  const configs = {
    elections:  { icon: '🗳',  desc: 'Create, configure and monitor student elections. Set dates, add candidates, assign terminals.' },
    candidates: { icon: '👤', desc: 'Register and manage election candidates, parties and manifesto details.' },
    voters:     { icon: '📋', desc: 'Manage student voter rolls, import CSV data, and verify biometric registrations.' },
    terminals:  { icon: '🖥',  desc: 'Register voting terminals, monitor status, push firmware updates.' },
    results:    { icon: '📈', desc: 'View real-time election results, tallies by department, candidate and position.' },
    audit:      { icon: '📜', desc: 'Full immutable audit log of all system events, votes, and admin actions.' },
    alerts:     { icon: '🚨', desc: 'Manage fraud detection alerts, investigate anomalies, configure thresholds.' },
    users:      { icon: '👥', desc: 'Manage admin users, roles, permissions and two-factor authentication.' },
    settings:   { icon: '⚙',  desc: 'Configure system parameters, blockchain settings, and notifications.' },
    logs:       { icon: '🔍', desc: 'Raw system and server logs for debugging and infrastructure monitoring.' },
  }
  const cfg = configs[page] || { icon: '📄', desc: 'This page is under construction.' }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 16, padding: 48, textAlign: 'center',
      animation: 'fadeSlideUp .4s ease',
    }}>
      <div style={{ fontSize: 64 }}>{cfg.icon}</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{pageName}</h2>
      <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 400, lineHeight: 1.7 }}>{cfg.desc}</p>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '10px 20px', color: 'var(--muted)', fontSize: 13,
      }}>
        🚧 &nbsp;Full UI for this section coming soon
      </div>
      <button
        onClick={onBack}
        style={{
          background: 'var(--saffron)', color: '#fff', border: 'none',
          borderRadius: 8, padding: '10px 24px', fontFamily: 'inherit',
          fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 8,
        }}
      >
        ← Back to Dashboard
      </button>
    </div>
  )
}
