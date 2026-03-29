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
        <h1>Your students deserve an election no one can rig.</h1>
        <p>
          CampusVote runs biometric check-in, live fraud detection, and blockchain receipt verification — all in one platform. Set up in under a day. Used by 12+ universities. Every vote is independently verifiable.
        </p>

        <div className="public-hero__actions">
          <button type="button" className="button button--primary" onClick={() => window.location.href='mailto:sales@campusvote.com?subject=Institutional Deploy Request'}>
            Deploy at my university &rarr;
          </button>
          <button type="button" className="button button--ghost" onClick={() => navigate('/app/observer')}>
            See a live election in progress
          </button>
        </div>

        <div className="hero-social-proof">
          <p>
            <em>&quot;2,341 ballots cast. 0 anomalies detected. Fraud monitoring: Healthy.&quot;</em>
            <br />
            &mdash; <strong>Northbridge University</strong>, Student Council Election 2026
          </p>
        </div>

        <div className="public-hero__screenshot" style={{ marginTop: '32px' }}>
          <div className="hero-mockup">
             <div className="mockup-header">
                <span className="mockup-dot" style={{ background: '#ff5f56' }} /><span className="mockup-dot" style={{ background: '#ffbd2e' }} /><span className="mockup-dot" style={{ background: '#27c93f' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--ink-soft)', marginLeft: '12px' }}>Observer Desk • Live Fraud Monitoring</span>
             </div>
             <div className="mockup-body" style={{ background: 'var(--surface-1)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ border: '1px solid var(--line-soft)', padding: '16px', borderRadius: '12px', background: 'var(--surface-2)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', textTransform: 'uppercase', fontWeight: 700 }}>ML Fraud Status</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <span className="status-dot"></span>
                      <strong style={{ fontSize: '1.2rem', color: 'var(--success)' }}>Healthy</strong>
                    </div>
                  </div>
                  <div style={{ border: '1px solid var(--line-soft)', padding: '16px', borderRadius: '12px', background: 'var(--surface-2)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Vote Anomaly Rate</span>
                    <strong style={{ display: 'block', fontSize: '1.4rem', marginTop: '8px' }}>0.00%</strong>
                  </div>
                </div>
                <div style={{ height: '80px', background: 'repeating-linear-gradient(90deg, var(--line-soft) 0px, var(--line-soft) 1px, transparent 1px, transparent 40px)', border: '1px solid var(--line-soft)', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
                  <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path d="M0,80 C20,80 30,70 50,75 C70,80 80,40 100,45 L100,100 L0,100 Z" fill="rgba(45, 106, 79, 0.15)" stroke="var(--success)" strokeWidth="2" />
                  </svg>
                  <span style={{ position: 'absolute', top: '8px', left: '12px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)' }}>Voting Velocity (Votes/min)</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="public-trust-strip">
        <span className="trust-badge">SOC 2 Type II In Progress</span>
        {TRUST_POINTS.map((point) => (
          <span key={point}>{point}</span>
        ))}
      </div>

      <section id="platform-features" className="public-section">
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
        <div className="public-disclaimer">
          * Representative institutional outcomes for platform capability illustration.
        </div>
      </section>

      <section className="public-section">
        <div className="section-heading">
          <p className="section-kicker">Platform Comparison</p>
          <h2>We don&apos;t just count votes. We secure them.</h2>
        </div>
        <div className="surface-card table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Capability</th>
                <th>CampusVote</th>
                <th>Legacy Vendor A</th>
                <th>Legacy Vendor B</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Verification</strong></td>
                <td>Biometric 2FA + SSO</td>
                <td>SSO only</td>
                <td>Email link</td>
              </tr>
              <tr>
                <td><strong>Vote Record</strong></td>
                <td>Immutable Blockchain</td>
                <td>Standard Database</td>
                <td>Standard Database</td>
              </tr>
              <tr>
                <td><strong>Fraud Monitoring</strong></td>
                <td>Real-time ML Engine</td>
                <td>None</td>
                <td>Post-election audit</td>
              </tr>
              <tr>
                <td><strong>Public Receipt</strong></td>
                <td>Cryptographic hash</td>
                <td>None</td>
                <td>None</td>
              </tr>
              <tr>
                <td><strong>Setup Time</strong></td>
                <td>Under 24 hours</td>
                <td>2-4 weeks</td>
                <td>1-3 weeks</td>
              </tr>
            </tbody>
          </table>
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
          <button type="button" className="footer-link" onClick={() => navigate('/pricing')}>Pricing</button>
        </div>
      </footer>
    </section>
  )
}
