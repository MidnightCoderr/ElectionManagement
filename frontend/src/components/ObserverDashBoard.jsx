import { useEffect, useMemo, useState } from 'react'
import { getMlHealth } from '../api/ml.js'
import { loadElectionSnapshot } from '../lib/electionSnapshot.js'

const ALERTS = [
  { timestamp: new Date(Date.now() - 120000).toISOString(), severity: 'Critical', title: 'Voting spike detected', detail: 'TERM-045 · 150 votes in 5 minutes' },
  { timestamp: new Date(Date.now() - 14400000).toISOString(), severity: 'Medium', title: 'Terminal offline', detail: 'TERM-012 · connectivity issue' },
  { timestamp: new Date(Date.now() - 3600000).toISOString(), severity: 'Medium', title: 'Battery warning', detail: 'TERM-301 · 8% remaining' },
]

const FEED = [
  { time: '14:23:05', type: 'Vote', terminal: 'TERM-045', event: 'Ballot recorded for candidate 3' },
  { time: '14:22:58', type: 'Auth', terminal: 'TERM-089', event: 'Biometric match confirmed' },
  { time: '14:22:44', type: 'Auth', terminal: 'TERM-156', event: 'Identity verification passed' },
  { time: '14:22:30', type: 'Vote', terminal: 'TERM-045', event: 'Ballot recorded for candidate 2' },
]

const TERMINALS = [
  { id: 'TERM-001', location: 'CS Building - Lab A', status: 'Online', votes: 342, battery: '92%' },
  { id: 'TERM-012', location: 'EE Building - Room 201', status: 'Offline', votes: 0, battery: '45%' },
  { id: 'TERM-045', location: 'Student Center', status: 'Online', votes: 512, battery: '85%' },
  { id: 'TERM-301', location: 'Sports Complex', status: 'Warning', votes: 145, battery: '8%' },
]



export default function ObserverDashBoard() {
  const [tab, setTab] = useState('overview')
  const [snapshot, setSnapshot] = useState(null)
  const [mlHealth, setMlHealth] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [snapshotResponse, mlResponse] = await Promise.allSettled([
          loadElectionSnapshot(),
          getMlHealth(),
        ])

        if (snapshotResponse.status === 'fulfilled') {
          setSnapshot(snapshotResponse.value)
        }

        if (mlResponse.status === 'fulfilled') {
          setMlHealth(mlResponse.value)
        } else {
          setMlHealth({ status: 'offline' })
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const summary = useMemo(() => {
    return {
      activeCount: snapshot?.activeCount ?? 0,
      turnout: snapshot?.turnoutLabel ?? 'NA',
      totalVotes: snapshot?.totalVotes ?? 0,
      totalVoters: snapshot?.totalVoters ?? 0,
      leadElection: snapshot?.electionName || 'Campus election monitor',
      isDemo: Boolean(snapshot?.isDemo),
    }
  }, [snapshot])

  const totalVotesCount = summary.totalVotes
  const totalVotersCount = summary.totalVoters

  return (
    <section className="workspace-shell">
      <aside className="workspace-sidebar">
        <div className="workspace-sidebar__brand">
          <p className="section-kicker">Observer desk</p>
          <h2>Monitoring</h2>
        </div>

        <div className="workspace-nav">
          {[
            ['overview', 'Overview'],
            ['feed', 'Live feed'],
            ['alerts', 'Alerts'],
            ['terminals', 'Terminals'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`workspace-nav__item${tab === id ? ' is-active' : ''}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="workspace-sidebar__footer">
          <div className="status-label">
             <span>ML engine</span>
             <strong className={mlHealth?.status === 'healthy' ? 'status--online' : 'status--offline'}>
               {mlHealth?.status === 'healthy' ? 'Online' : 'Monitoring Active'}
             </strong>
          </div>
        </div>
      </aside>

      <div className="workspace-main">
        <div className="workspace-header">
          <div>
            <p className="section-kicker">Election oversight</p>
            <h1>{summary.leadElection}</h1>
          </div>
          <div className="detail-inline">
            <span>{summary.activeCount} active</span>
            <span>{summary.turnout} turnout</span>
          </div>
        </div>

        <div className="stats-grid">
          <article className="surface-card stat-card">
            <span>Total votes</span>
            <strong>{loading ? '...' : totalVotesCount.toLocaleString()}</strong>
          </article>
          <article className="surface-card stat-card">
            <span>Registered voters</span>
            <strong>{loading ? '...' : totalVotersCount.toLocaleString()}</strong>
          </article>
          <article className="surface-card stat-card">
            <span>Turnout</span>
            <strong>{loading ? '...' : summary.turnout}</strong>
          </article>
          <article className="surface-card stat-card">
            <span>Alert count</span>
            <strong>{ALERTS.length}</strong>
          </article>
        </div>

        {tab === 'overview' ? (
          <div className="workspace-grid">
            <div className="surface-card">
              <div className="section-heading section-heading--compact">
                <p className="section-kicker">Current posture</p>
                <h2>Operational summary</h2>
              </div>
              <div className="detail-list">
                <div><span>Lead election</span><strong>{summary.leadElection}</strong></div>
                <div>
                  <span>Fraud detection</span>
                  <strong className={mlHealth?.status === 'healthy' ? '' : 'text--muted'}>
                    {mlHealth?.status === 'healthy' ? `Active · v${mlHealth.version || '1.0.0'}` : 'Simulated Traffic Tracking'}
                  </strong>
                </div>
                <div><span>High-risk terminals</span><strong>0 anomalies detected</strong></div>
              </div>
            </div>

            <div className="surface-card">
              <div className="section-heading section-heading--compact">
                <p className="section-kicker">Recent alerts</p>
                <h2>Items requiring attention</h2>
              </div>
              <div className="stack-list">
                {ALERTS.map((alert) => (
                  <article key={alert.title} className="stack-list__item">
                    <strong>{alert.title}</strong>
                    <span>{alert.severity}</span>
                    <p>{alert.detail}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'feed' ? (
          <div className="surface-card table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Terminal</th>
                  <th>Event</th>
                </tr>
              </thead>
              <tbody>
                {FEED.map((item) => (
                  <tr key={`${item.time}-${item.terminal}`}>
                    <td>{item.time}</td>
                    <td>{item.type}</td>
                    <td>{item.terminal}</td>
                    <td>{item.event}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === 'alerts' ? (
          <div className="stack-list">
            {ALERTS.map((alert) => (
              <article key={alert.title} className="surface-card stack-list__item stack-list__item--alert" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div className="detail-inline" style={{ marginBottom: '8px' }}>
                    <strong>{alert.title}</strong>
                    <span>{alert.severity}</span>
                    <span style={{ color: 'var(--ink-muted)', fontSize: '0.75rem' }}>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p style={{ margin: 0 }}>{alert.detail}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--line-soft)', paddingTop: '12px' }}>
                  <button type="button" className="button button--ghost" onClick={() => alert('Viewing logs...')}>Investigate</button>
                  <button type="button" className="button button--primary" onClick={() => alert('Acknowledged.')}>Acknowledge</button>
                  <button type="button" className="button button--ghost" onClick={() => alert('Escalated to local authorities.')} style={{ color: 'var(--danger)', marginLeft: 'auto' }}>Escalate</button>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {tab === 'terminals' ? (
          <div className="surface-card table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Terminal</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Votes</th>
                  <th>Battery</th>
                </tr>
              </thead>
              <tbody>
                {TERMINALS.map((terminal) => (
                  <tr key={terminal.id}>
                    <td>{terminal.id}</td>
                    <td>{terminal.location}</td>
                    <td>{terminal.status}</td>
                    <td>{terminal.votes}</td>
                    <td>{terminal.battery}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  )
}
