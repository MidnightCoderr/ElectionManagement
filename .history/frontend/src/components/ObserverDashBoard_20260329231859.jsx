import { useEffect, useMemo, useState } from 'react'
import { getElections } from '../api/elections.js'
import { getMlHealth } from '../api/ml.js'

const ALERTS = [
  { severity: 'Critical', title: 'Voting spike detected', detail: 'TERM-045 · 150 votes in 5 minutes' },
  { severity: 'Medium', title: 'Terminal offline', detail: 'TERM-012 · connectivity issue' },
  { severity: 'Medium', title: 'Battery warning', detail: 'TERM-301 · 8% remaining' },
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

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let frame = 0
    const steps = Math.max(12, Math.floor(duration / 40))
    const timer = window.setInterval(() => {
      frame += 1
      const progress = Math.min(frame / steps, 1)
      setValue(Math.round(target * progress))
      if (progress >= 1) window.clearInterval(timer)
    }, duration / steps)
    return () => window.clearInterval(timer)
  }, [target, duration])

  return value
}

export default function ObserverDashBoard() {
  const [tab, setTab] = useState('overview')
  const [elections, setElections] = useState([])
  const [mlHealth, setMlHealth] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [electionResponse, mlResponse] = await Promise.allSettled([
          getElections({ limit: 10 }),
          getMlHealth(),
        ])

        if (electionResponse.status === 'fulfilled') {
          setElections(electionResponse.value.elections || [])
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
    const active = elections.filter((election) => election.status === 'active')
    const totalVotes = elections.reduce((sum, election) => sum + (election.total_votes_cast || 0), 0)
    const totalVoters = elections.reduce((sum, election) => sum + (election.total_voters || 0), 0)

    return {
      activeCount: active.length,
      turnout: totalVoters ? `${((totalVotes / totalVoters) * 100).toFixed(1)}%` : 'NA',
      totalVotes: totalVotes.toLocaleString(),
      totalVoters: totalVoters.toLocaleString(),
      leadElection: active[0]?.election_name || 'Campus election monitor',
    }
  }, [elections])

  const totalVotes = useCountUp(Number(summary.totalVotes.replace(/,/g, '')) || 0)
  const totalVoters = useCountUp(Number(summary.totalVoters.replace(/,/g, '')) || 0)

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
          <span>ML engine</span>
          <strong>{mlHealth?.status === 'healthy' ? 'Online' : 'Offline'}</strong>
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
            <strong>{loading ? '...' : totalVotes.toLocaleString()}</strong>
          </article>
          <article className="surface-card stat-card">
            <span>Registered voters</span>
            <strong>{loading ? '...' : totalVoters.toLocaleString()}</strong>
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
                <div><span>Fraud detection</span><strong>{mlHealth?.status === 'healthy' ? `Healthy · v${mlHealth.version || '1.0.0'}` : 'Service offline'}</strong></div>
                <div><span>High-risk terminals</span><strong>2 flagged for follow-up</strong></div>
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
              <article key={alert.title} className="surface-card stack-list__item stack-list__item--alert">
                <div className="detail-inline">
                  <strong>{alert.title}</strong>
                  <span>{alert.severity}</span>
                </div>
                <p>{alert.detail}</p>
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
