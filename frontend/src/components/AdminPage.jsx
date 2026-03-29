import { useEffect, useMemo, useState } from 'react'
import { adminLogin, getStoredAdmin, logout } from '../api/auth.js'
import { getAuditLogs, getVoters } from '../api/admin.js'
import { getCandidates, getElections, updateElectionStatus } from '../api/elections.js'
import { getMlHealth } from '../api/ml.js'

function AdminLogin({ onLogin, error }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await adminLogin(form)
      onLogin(response.user || { username: form.username || 'Admin' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="portal-page portal-page--split">
      <div className="surface-card portal-aside">
        <p className="section-kicker">Administrative access</p>
        <h1>Operate elections from a single institutional workspace.</h1>
        <p>
          Manage elections, supervise readiness, inspect voter data, and coordinate live results with a tighter, more professional admin interface.
        </p>
      </div>

      <form className="surface-card form-card" onSubmit={handleSubmit}>
        <label>
          <span className="field-label">Username</span>
          <input className="field-input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </label>
        <label>
          <span className="field-label">Password</span>
          <input className="field-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        {error ? <div className="surface-note surface-note--warning">{error}</div> : null}
        <button type="submit" className="button button--primary">
          {loading ? 'Signing in' : 'Sign in'}
        </button>
      </form>
    </section>
  )
}

export default function AdminPage() {
  const [admin, setAdmin] = useState(() => getStoredAdmin())
  const [tab, setTab] = useState('dashboard')
  const [error, setError] = useState(null)
  const [elections, setElections] = useState([])
  const [voters, setVoters] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [candidates, setCandidates] = useState([])
  const [mlHealth, setMlHealth] = useState(null)

  useEffect(() => {
    if (!admin) return

    async function load() {
      try {
        const electionResponse = await getElections({ limit: 12 })
        const electionList = electionResponse.elections || []
        setElections(electionList)

        const activeElectionId = electionList.find((election) => election.status === 'active')?.election_id || electionList[0]?.election_id

        const [votersResponse, auditResponse, mlResponse, candidateResponse] = await Promise.allSettled([
          getVoters({ limit: 10 }),
          getAuditLogs({ limit: 10 }),
          getMlHealth(),
          activeElectionId ? getCandidates(activeElectionId) : Promise.resolve({ candidates: [] }),
        ])

        if (votersResponse.status === 'fulfilled') setVoters(votersResponse.value.voters || [])
        if (auditResponse.status === 'fulfilled') setAuditLogs(auditResponse.value.logs || auditResponse.value.auditLogs || [])
        if (mlResponse.status === 'fulfilled') setMlHealth(mlResponse.value)
        if (candidateResponse.status === 'fulfilled') setCandidates(candidateResponse.value.candidates || [])
      } catch (err) {
        setError(err.message || 'Failed to load admin data.')
      }
    }

    load()
  }, [admin])

  const dashboardStats = useMemo(() => {
    const active = elections.filter((election) => election.status === 'active')
    const totalVotes = elections.reduce((sum, election) => sum + (election.total_votes_cast || 0), 0)
    const totalVoters = elections.reduce((sum, election) => sum + (election.total_voters || 0), 0)
    return {
      activeCount: active.length,
      totalVotes: totalVotes.toLocaleString(),
      turnout: totalVoters ? `${((totalVotes / totalVoters) * 100).toFixed(1)}%` : 'NA',
    }
  }, [elections])

  async function handleAdminLogin(user) {
    setError(null)
    setAdmin(user)
  }

  async function handleStatusChange(electionId, status) {
    await updateElectionStatus(electionId, status)
    const response = await getElections({ limit: 12 })
    setElections(response.elections || [])
  }

  if (!admin) {
    return <AdminLogin onLogin={handleAdminLogin} error={error} />
  }

  return (
    <section className="workspace-shell">
      <aside className="workspace-sidebar">
        <div className="workspace-sidebar__brand">
          <p className="section-kicker">Admin workspace</p>
          <h2>{admin.username || admin.fullName || 'Administrator'}</h2>
        </div>

        <div className="workspace-nav">
          {[
            ['dashboard', 'Dashboard'],
            ['elections', 'Elections'],
            ['candidates', 'Candidates'],
            ['voters', 'Voters'],
            ['audit', 'Audit log'],
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

        <button
          type="button"
          className="button button--ghost workspace-sidebar__logout"
          onClick={() => {
            logout()
            setAdmin(null)
          }}
        >
          Sign out
        </button>
      </aside>

      <div className="workspace-main">
        <div className="workspace-header">
          <div>
            <p className="section-kicker">Election administration</p>
            <h1>Operational control center</h1>
          </div>
          <div className="detail-inline">
            <span>{dashboardStats.activeCount} active elections</span>
            <span>{mlHealth?.status === 'healthy' ? 'ML healthy' : 'ML offline'}</span>
          </div>
        </div>

        {tab === 'dashboard' ? (
          <>
            <div className="stats-grid">
              <article className="surface-card stat-card"><span>Total votes</span><strong>{dashboardStats.totalVotes}</strong></article>
              <article className="surface-card stat-card"><span>Turnout</span><strong>{dashboardStats.turnout}</strong></article>
              <article className="surface-card stat-card"><span>Candidates</span><strong>{candidates.length}</strong></article>
              <article className="surface-card stat-card"><span>Registered voters</span><strong>{voters.length}</strong></article>
            </div>

            <div className="workspace-grid">
              <div className="surface-card">
                <div className="section-heading section-heading--compact">
                  <p className="section-kicker">System health</p>
                  <h2>Service posture</h2>
                </div>
                <div className="detail-list">
                  <div><span>ML fraud detection</span><strong>{mlHealth?.status === 'healthy' ? `Online · v${mlHealth.version || '1.0.0'}` : 'Offline'}</strong></div>
                  <div><span>Active election count</span><strong>{dashboardStats.activeCount}</strong></div>
                  <div><span>Latest turnout</span><strong>{dashboardStats.turnout}</strong></div>
                </div>
              </div>

              <div className="surface-card">
                <div className="section-heading section-heading--compact">
                  <p className="section-kicker">Recent audit activity</p>
                  <h2>Latest changes</h2>
                </div>
                <div className="stack-list">
                  {auditLogs.slice(0, 4).map((log, index) => (
                    <article key={log.id || index} className="stack-list__item">
                      <strong>{log.action || log.event_type || log.event || 'Administrative event'}</strong>
                      <p>{log.description || log.resource || 'Audit record captured.'}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}

        {tab === 'elections' ? (
          <div className="surface-card table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Election</th>
                  <th>Status</th>
                  <th>Start</th>
                  <th>Votes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {elections.map((election) => (
                  <tr key={election.election_id}>
                    <td>{election.election_name}</td>
                    <td>{election.status}</td>
                    <td>{new Date(election.start_date).toLocaleDateString()}</td>
                    <td>{election.total_votes_cast || 0}</td>
                    <td>
                      {election.status === 'upcoming' ? (
                        <button type="button" className="button button--ghost button--inline" onClick={() => handleStatusChange(election.election_id, 'active')}>
                          Activate
                        </button>
                      ) : null}
                      {election.status === 'active' ? (
                        <button type="button" className="button button--ghost button--inline" onClick={() => handleStatusChange(election.election_id, 'completed')}>
                          Complete
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === 'candidates' ? (
          <div className="surface-card table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Party</th>
                  <th>District</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate.candidate_id}>
                    <td>{candidate.full_name || candidate.candidate_name}</td>
                    <td>{candidate.party_name || 'Independent'}</td>
                    <td>{candidate.district_id || 'NA'}</td>
                    <td>{candidate.status || 'Pending'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === 'voters' ? (
          <div className="surface-card table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>ID</th>
                  <th>District</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {voters.map((voter) => (
                  <tr key={voter.voter_id || voter.id}>
                    <td>{voter.full_name || voter.name}</td>
                    <td>{voter.voter_id || voter.id}</td>
                    <td>{voter.district_id || voter.district || 'NA'}</td>
                    <td>{voter.status || 'Active'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === 'audit' ? (
          <div className="surface-card table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Actor</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log, index) => (
                  <tr key={log.id || index}>
                    <td>{log.action || log.event_type || log.event || 'Event'}</td>
                    <td>{log.user_id || log.actor || 'System'}</td>
                    <td>{log.description || log.resource || 'Audit log entry'}</td>
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
