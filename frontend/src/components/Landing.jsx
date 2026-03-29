import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

const ROLES = [
  { id: 'voter', label: 'Cast your vote', path: '/voter' },
  { id: 'candidate', label: 'Manage candidacy', path: '/candidate' },
  { id: 'observer', label: 'Monitor live status', path: '/observer' },
  { id: 'admin', label: 'Run election ops', path: '/dashboard' },
]

const ROLE_CARDS = [
  {
    id: 'voter',
    title: 'Voter Terminal',
    body: 'Cast your ballot with biometric check-in and instant receipt verification.',
    cta: 'Go to my ballot',
    path: '/voter',
    duration: 'Takes about 2 minutes',
    status: 'Polls open until 6:00 PM today',
    large: true,
  },
  {
    id: 'observer',
    title: 'Observer Desk',
    body: 'Watch turnout, alerts, and vote flow as polling continues.',
    cta: 'Watch live results',
    path: '/observer',
    duration: 'Live view',
    status: 'Election in progress',
  },
  {
    id: 'admin',
    title: 'Admin Workspace',
    body: 'Manage terminals, candidate records, and closeout decisions.',
    cta: 'Manage this election',
    path: '/dashboard',
    duration: 'Restricted access',
    status: 'Ops controls',
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const closesInText = useMemo(() => 'Closes in 4h 22m', [])

  return (
    <section className="landing-page">
      <div className="landing-hero">
        <div className="landing-hero__copy">
          <p className="section-kicker">Campus election portal</p>
          <h1>Run your campus election with confidence.</h1>
          <p className="landing-hero__lede">
            From voter check-in to certified results, every step stays fast, transparent, and easy to manage.
          </p>

          <div className="landing-task-chips">
            <span>You are here to:</span>
            <div className="task-chip-row">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  className={`task-chip${role.id === 'admin' ? ' task-chip--muted' : ''}`}
                  onClick={() => navigate(role.path)}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          <div className="landing-hero__actions">
            <button type="button" className="button button--primary" onClick={() => navigate('/voter')}>
              Go to my ballot
            </button>
            <button type="button" className="button button--ghost" onClick={() => navigate('/verify')}>
              Verify results
            </button>
          </div>
        </div>

        <div className="landing-hero__panel">
          <div className="hero-panel__header">
            <span className="section-kicker">Status</span>
            <span className="hero-panel__badge">Student council election</span>
          </div>

          <div className="status-strip">
            <span className="status-dot" />
            Election live - {closesInText} - Polls open now
          </div>

          <div className="hero-panel__rail hero-panel__rail--system">
            <div>
              <span>Terminals active</span>
              <strong>12 terminals</strong>
            </div>
            <div>
              <span>Votes cast</span>
              <strong>2,341 ballots</strong>
            </div>
            <div>
              <span>Last ballot</span>
              <strong>3 minutes ago</strong>
            </div>
          </div>

          <div className="operator-strip">
            <span className="operator-pill">
              <span className="operator-pill__dot" />
              Fraud monitoring: Healthy <span className="status-cursor" />
            </span>
            <span className="operator-pill">Verification path: Biometric plus blockchain</span>
          </div>
        </div>
      </div>

      <div className="landing-section">
        <div className="section-heading">
          <p className="section-kicker">Role workspaces</p>
          <h2>Pick the space that matches your role.</h2>
        </div>

        <div className="role-grid">
          {ROLE_CARDS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`role-card${item.large ? ' role-card--primary' : ''}${item.id === 'admin' ? ' role-card--admin' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="role-card__label">{item.title}</span>
              <p>{item.body}</p>
              <div className="role-card__meta">
                <span className="role-dot" />
                {item.status}
              </div>
              <div className="role-card__meta role-card__meta--muted">{item.duration}</div>
              <span className="role-card__cta">{item.cta}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
