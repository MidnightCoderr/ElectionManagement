import { useEffect, useMemo, useState } from 'react'
import { getElections } from '../api/elections.js'
import { submitCandidateApplication } from '../api/admin.js'
import { useNavigate } from 'react-router-dom'

const DEPARTMENTS = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Business School', 'Biotechnology']

const MOCK_ELECTIONS = [
  {
    election_id: 'ELEC-2027-SEC',
    election_name: 'General Secretary',
    election_type: 'Executive Campus-wide',
    district_id: 'All students',
    status: 'Upcoming',
    start_date: new Date(Date.now() + 86400000 * 14).toISOString()
  },
  {
    election_id: 'ELEC-2027-REP',
    election_name: 'Engineering Representative',
    election_type: 'Departmental',
    district_id: 'School of Engineering',
    status: 'Upcoming',
    start_date: new Date(Date.now() + 86400000 * 14).toISOString()
  },
  {
    election_id: 'ELEC-2027-CULT',
    election_name: 'Cultural Secretary',
    election_type: 'Executive Campus-wide',
    district_id: 'All students',
    status: 'Upcoming',
    start_date: new Date(Date.now() + 86400000 * 21).toISOString()
  }
]

export default function CandidatePortal() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('browse')
  const [elections, setElections] = useState([])
  const [selectedElection, setSelectedElection] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState(null)
  const [form, setForm] = useState({
    name: '',
    studentId: '',
    department: '',
    year: '',
    cgpa: '',
    email: '',
    phone: '',
    manifesto: '',
  })

  useEffect(() => {
    async function load() {
      try {
        const response = await getElections({ limit: 20 })
        if (response.elections && response.elections.length > 0) {
          setElections(response.elections)
        } else {
          setElections(MOCK_ELECTIONS)
        }
      } catch {
        setElections(MOCK_ELECTIONS)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const eligible = useMemo(() => {
    const cgpa = Number(form.cgpa)
    return Boolean(form.name && form.studentId && form.department && cgpa >= 7)
  }, [form])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!selectedElection || !eligible) return

    setStatus('loading')

    try {
      await submitCandidateApplication({
        electionId: selectedElection.election_id,
        ...form,
      })

      setApplications((current) => [
        ...current,
        {
          id: `APP-${Date.now()}`,
          election: selectedElection.election_name,
          department: form.department,
          status: 'Pending review',
          submittedAt: new Date().toLocaleDateString(),
        },
      ])
      setStatus('success')
      setTab('status')
      setForm({
        name: '',
        studentId: '',
        department: '',
        year: '',
        cgpa: '',
        email: '',
        phone: '',
        manifesto: '',
      })
    } catch (err) {
      setStatus({ error: err.message || 'Application submission failed.' })
    }
  }

  return (
    <section className="portal-page">
      <div className="section-heading">
        <p className="section-kicker">Candidacy</p>
        <h1>Ready to represent your student body?</h1>
        <p>Browse open seats and submit your application to join the next student council leadership.</p>
      </div>

      <div className="tab-strip">
        {[
          ['browse', 'Browse elections'],
          ['apply', 'Application form'],
          ['status', 'Application status'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`tab-strip__item${tab === id ? ' is-active' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'browse' ? (
        <div className="card-grid">
          {loading ? <div className="surface-card">Loading elections…</div> : null}
          {!loading && elections.length === 0 ? (
            <div className="surface-card empty-state">
              <span className="empty-state__icon">🗳️</span>
              <h3>No elections open for candidacy yet</h3>
              <p>Applications for upcoming seats haven&apos;t opened yet. Check back soon or contact your campus election administrator to inquire about nomination windows.</p>
              <button type="button" className="button button--ghost" onClick={() => navigate('/app')}>Return to overview</button>
            </div>
          ) : null}
          {elections.map((election) => (
            <article key={election.election_id} className="product-card product-card--static">
              <span className="product-card__label">{election.election_name}</span>
              <p>{election.election_type || 'General election'} · {election.district_id || 'All districts'}</p>
              <div className="detail-inline">
                <span>{election.status}</span>
                <span>{new Date(election.start_date).toLocaleDateString()}</span>
              </div>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => {
                  setSelectedElection(election)
                  setTab('apply')
                  setStatus(null)
                }}
              >
                Prepare application
              </button>
            </article>
          ))}
        </div>
      ) : null}

      {tab === 'apply' ? (
        <div className="portal-page portal-page--split compact">
          <div className="surface-card portal-aside">
            <p className="section-kicker">Eligibility</p>
            <h2>{selectedElection?.election_name || 'Select an election first'}</h2>
            <div className="detail-list">
              <div><span>Minimum CGPA</span><strong>7.0</strong></div>
              <div><span>Disciplinary status</span><strong>Clear record required</strong></div>
              <div><span>Attendance</span><strong>75% or above</strong></div>
            </div>
          </div>

          <form className="surface-card form-card" onSubmit={handleSubmit}>
            <div className="field-grid">
              <label>
                <span className="field-label">Full name</span>
                <input className="field-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <label>
                <span className="field-label">Student ID</span>
                <input className="field-input" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} />
              </label>
            </div>

            <div className="field-grid">
              <label>
                <span className="field-label">Department</span>
                <select className="field-input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((department) => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="field-label">CGPA</span>
                <input className="field-input" value={form.cgpa} onChange={(e) => setForm({ ...form, cgpa: e.target.value })} />
              </label>
            </div>

            <div className="field-grid">
              <label>
                <span className="field-label">Email</span>
                <input className="field-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
              <label>
                <span className="field-label">Phone</span>
                <input className="field-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </label>
            </div>

            <label>
              <span className="field-label">Manifesto</span>
              <textarea className="field-input field-input--textarea" value={form.manifesto} onChange={(e) => setForm({ ...form, manifesto: e.target.value })} />
            </label>

            {status === 'success' ? <div className="surface-note surface-note--success">Application submitted for review.</div> : null}
            {status?.error ? <div className="surface-note surface-note--warning">{status.error}</div> : null}

            <div className="form-actions">
              <button type="button" className="button button--ghost" onClick={() => setTab('browse')}>
                Choose election
              </button>
              <button type="submit" className="button button--primary" disabled={!selectedElection || !eligible || status === 'loading'}>
                {status === 'loading' ? 'Submitting' : 'Submit application'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {tab === 'status' ? (
        <div className="surface-card">
          <div className="section-heading section-heading--compact">
            <p className="section-kicker">Application tracking</p>
            <h2>Current submissions</h2>
          </div>
          {applications.length === 0 ? (
            <div className="surface-card empty-state">
              <span className="empty-state__icon">📄</span>
              <h3>No active applications</h3>
              <p>Register as a formal candidate for an upcoming election. Ensure you&apos;ve read the compliance guidelines before submitting.</p>
            </div>
          ) : (
            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Election</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr key={application.id}>
                      <td>{application.election}</td>
                      <td>{application.department}</td>
                      <td>{application.status}</td>
                      <td>{application.submittedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </section>
  )
}
