import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin, biometricLogin } from '../api/auth.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('voter')
  const [adminForm, setAdminForm] = useState({ username: '', password: '' })
  const [voterForm, setVoterForm] = useState({ biometricTemplate: 'biometric-template-demo', terminalId: 'TERM-001' })
  const [status, setStatus] = useState(null)

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      await adminLogin(adminForm)
      navigate('/app/dashboard')
    } catch (err) {
      setStatus({ error: err.message || 'Invalid admin credentials' })
    }
  }

  const handleVoterLogin = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      await biometricLogin(voterForm)
      navigate('/app/voter')
    } catch (err) {
      setStatus({ error: err.message || 'Biometric authentication failed' })
    }
  }

  return (
    <section className="portal-page portal-page--narrow">
      <div className="section-heading">
        <p className="section-kicker">Secure Access</p>
        <h1>Sign in to your CampusVote workspace.</h1>
      </div>

      <div className="surface-card" style={{ padding: '0' }}>
        <div className="tabs-header" style={{ display: 'flex', borderBottom: '1px solid var(--line-soft)' }}>
          <button 
            className={`tab-btn ${activeTab === 'voter' ? 'is-active' : ''}`}
            onClick={() => { setActiveTab('voter'); setStatus(null); }}
            style={{ 
              flex: 1, 
              padding: '16px', 
              background: 'none', 
              border: 'none', 
              borderBottom: activeTab === 'voter' ? '2px solid var(--brand)' : '2px solid transparent',
              color: activeTab === 'voter' ? 'var(--brand)' : 'var(--ink-soft)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Voter Login
          </button>
          <button 
            className={`tab-btn ${activeTab === 'admin' ? 'is-active' : ''}`}
            onClick={() => { setActiveTab('admin'); setStatus(null); }}
            style={{ 
              flex: 1, 
              padding: '16px', 
              background: 'none', 
              border: 'none', 
              borderBottom: activeTab === 'admin' ? '2px solid var(--brand)' : '2px solid transparent',
              color: activeTab === 'admin' ? 'var(--brand)' : 'var(--ink-soft)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Admin Login
          </button>
        </div>

        <div style={{ padding: '32px' }}>
          {activeTab === 'voter' ? (
            <form onSubmit={handleVoterLogin}>
              <p style={{ color: 'var(--ink-soft)', fontSize: '0.95rem', marginBottom: '24px' }}>
                Voters usually authenticate at a physical terminal. For the web portal, use your biometric token.
              </p>
              <div className="field-group" style={{ marginBottom: '20px' }}>
                <label className="field-label">Biometric Token</label>
                <input 
                  className="field-input" 
                  type="text" 
                  value={voterForm.biometricTemplate}
                  onChange={(e) => setVoterForm({ ...voterForm, biometricTemplate: e.target.value })}
                  placeholder="Paste your biometric hash"
                  required
                />
              </div>
              <button type="submit" className="button button--primary" style={{ width: '100%' }} disabled={status === 'loading'}>
                {status === 'loading' ? 'Authenticating...' : 'Authenticate Biometrically'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin}>
              <div className="field-group" style={{ marginBottom: '20px' }}>
                <label className="field-label">Username</label>
                <input 
                  className="field-input" 
                  type="text" 
                  value={adminForm.username}
                  onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                  placeholder="Admin username"
                  required
                />
              </div>
              <div className="field-group" style={{ marginBottom: '20px' }}>
                <label className="field-label">Password</label>
                <input 
                  className="field-input" 
                  type="password" 
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
              <button type="submit" className="button button--primary" style={{ width: '100%' }} disabled={status === 'loading'}>
                {status === 'loading' ? 'Verifying...' : 'Institutional Sign In'}
              </button>
            </form>
          )}

          {status?.error && (
            <div className="surface-note surface-note--warning" style={{ marginTop: '24px' }}>
              {status.error}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--ink-soft)', fontSize: '0.9rem' }}>
        Don&apos;t have an account? <button className="utility-link" onClick={() => navigate('/create')}>Register now</button>
      </div>
    </section>
  )
}
