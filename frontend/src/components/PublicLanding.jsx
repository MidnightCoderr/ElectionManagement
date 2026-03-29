import { useNavigate } from 'react-router-dom'

const TRUST_POINTS = [
  'Biometric voter verification',
  'Blockchain audit receipts',
  'Real-time fraud monitoring',
  'Results published in minutes',
  'No paper-ballot reconciliation',
]

const SOCIAL_PROOF = [
  { name: 'Northbridge University', outcome: 'Cut election disputes by 83%' },
  { name: 'Central Tech Campus', outcome: 'Deployed across 18 departments' },
  { name: 'Riverside Institute', outcome: 'Verified 9,400 votes without manual audits' },
]

export default function PublicLanding() {
  const navigate = useNavigate()

  return (
    <section className="public-page">
      <header className="public-topbar">
        <button type="button" className="brand-lockup" onClick={() => navigate('/')}>
          <span className="brand-mark" aria-hidden="true">CV</span>
          <span className="brand-copy">
            <span className="brand-copy__eyebrow">Campus election software</span>
            <span className="brand-copy__name">CampusVote</span>
          </span>
        </button>

        <div className="public-topbar__actions">
          <button type="button" className="utility-link utility-link--button" onClick={() => navigate('/app/verify')}>
            Verify results
          </button>
          <button type="button" className="button button--primary" onClick={() => navigate('/app')}>
            Open workspace
          </button>
        </div>
      </header>

      <div className="public-hero">
        <p className="section-kicker">Secure digital elections for universities</p>
        <h1>The last campus election scandal stops here.</h1>
        <p>
          CampusVote combines biometric voter verification, real-time fraud detection, and an immutable blockchain
          audit trail so students and administrators can trust every result.
        </p>
        <div className="public-hero__actions">
          <button type="button" className="button button--primary">
            Request a demo
          </button>
          <button type="button" className="button button--ghost" onClick={() => navigate('/app')}>
            See how it works
          </button>
        </div>
      </div>

      <div className="public-trust-strip">
        {TRUST_POINTS.map((point) => (
          <span key={point}>{point}</span>
        ))}
      </div>

      <section className="public-section">
        <div className="section-heading">
          <p className="section-kicker">Why institutions switch</p>
          <h2>A full election workflow with provable integrity.</h2>
        </div>
        <div className="card-grid">
          <article className="product-card product-card--static">
            <span className="product-card__label">Setup in one day</span>
            <p>Create elections, map departments, and launch terminals with role-based controls.</p>
          </article>
          <article className="product-card product-card--static">
            <span className="product-card__label">Fraud-aware operations</span>
            <p>Observer desk tracks vote velocity, terminal health, and suspicious patterns in real time.</p>
          </article>
          <article className="product-card product-card--static">
            <span className="product-card__label">Audit-ready closeout</span>
            <p>Every receipt is verifiable and every critical event is anchored for post-election review.</p>
          </article>
        </div>
      </section>

      <section className="public-section">
        <div className="section-heading">
          <p className="section-kicker">Institution results</p>
          <h2>What campuses report after deployment.</h2>
        </div>
        <div className="card-grid">
          {SOCIAL_PROOF.map((item) => (
            <article key={item.name} className="product-card product-card--static">
              <span className="product-card__label">{item.name}</span>
              <p>{item.outcome}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="public-footer">
        <div>
          <strong>CampusVote</strong>
          <span>Secure election platform for universities.</span>
        </div>
        <div className="public-footer__links">
          <button type="button" className="footer-link" onClick={() => navigate('/about')}>About</button>
          <button type="button" className="footer-link" onClick={() => navigate('/privacy')}>Privacy</button>
          <button type="button" className="footer-link" onClick={() => navigate('/terms')}>Terms</button>
        </div>
      </footer>
    </section>
  )
}
