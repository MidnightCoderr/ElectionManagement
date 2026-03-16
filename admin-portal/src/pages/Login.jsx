import { useState } from 'react'
import './Login.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const MOCK_MODE = import.meta.env.VITE_MOCK_MODE !== 'false'

const DEMO_USERS = [
  { username: 'admin',    password: 'admin123',    name: 'Arjun Sharma',  role: 'Super Admin' },
  { username: 'observer', password: 'observer123', name: 'Priya Mehta',   role: 'Observer' },
  { username: 'officer',  password: 'officer123',  name: 'Rajesh Verma',  role: 'Field Officer' },
]

export default function Login({ onLogin }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [agreed, setAgreed]       = useState(true)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) { setError('Please fill in all fields.'); return }
    if (!agreed) { setError('Please agree to the Terms & Conditions.'); return }
    setLoading(true); setError('')

    // Mock mode: use demo users
    if (MOCK_MODE) {
      await new Promise(r => setTimeout(r, 900))
      const user = DEMO_USERS.find(u => u.username === email.trim().toLowerCase() && u.password === password)
      if (user) { onLogin({ name: user.name, role: user.role, username: user.username }) }
      else { setError('Invalid credentials. Try: admin / admin123'); setLoading(false) }
      return
    }

    // Real API mode
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email.trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Login failed'); setLoading(false); return }
      // Store admin token for authenticated API calls
      if (data.token) sessionStorage.setItem('admin_token', data.token)
      onLogin({ name: data.admin?.name || email.trim(), role: data.admin?.role || 'Admin', username: email.trim(), token: data.token })
    } catch (err) {
      setError('Unable to connect to server. Try: admin / admin123')
      setLoading(false)
    }
  }

  return (
    <div className="create-page">
      <div className="create-left">
        <div className="cl-o1"/><div className="cl-o2"/>
        <div className="cl-art">
          <svg width="155" height="155" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="70" stroke="rgba(124,92,252,0.12)" strokeWidth="1"/>
            <circle cx="100" cy="100" r="50" stroke="rgba(124,92,252,0.1)" strokeWidth="1"/>
            <circle cx="100" cy="100" r="30" stroke="rgba(124,92,252,0.17)" strokeWidth="1.5"/>
            <circle cx="100" cy="100" r="5" fill="rgba(124,92,252,0.8)"/>
            <line x1="100" y1="30" x2="100" y2="70" stroke="rgba(124,92,252,0.28)" strokeWidth="1"/>
            <line x1="100" y1="130" x2="100" y2="170" stroke="rgba(124,92,252,0.28)" strokeWidth="1"/>
            <line x1="30" y1="100" x2="70" y2="100" stroke="rgba(124,92,252,0.28)" strokeWidth="1"/>
            <line x1="130" y1="100" x2="170" y2="100" stroke="rgba(124,92,252,0.28)" strokeWidth="1"/>
            <circle cx="100" cy="30" r="4" fill="rgba(124,92,252,0.48)"/>
            <circle cx="100" cy="170" r="4" fill="rgba(124,92,252,0.48)"/>
            <circle cx="30" cy="100" r="4" fill="rgba(124,92,252,0.48)"/>
            <circle cx="170" cy="100" r="4" fill="rgba(124,92,252,0.48)"/>
            <path d="M100 70 A30 30 0 0 1 130 100" stroke="rgba(124,92,252,0.32)" strokeWidth="1.5" fill="none" strokeDasharray="4 4"/>
            <path d="M100 130 A30 30 0 0 1 70 100" stroke="rgba(74,74,106,0.32)" strokeWidth="1" fill="none" strokeDasharray="3 5"/>
          </svg>
        </div>
        <div className="cl-text">
          <div className="cl-headline">Capturing Democracy,<br/>Creating Transparency</div>
          <div className="cl-sub">Election Management System · India</div>
          <div className="cl-dots">
            <div className="cl-dot"/><div className="cl-dot"/><div className="cl-dot active"/>
          </div>
        </div>
      </div>

      <div className="create-right">
        <div className="create-form-wrap">
          <div className="form-eyebrow">Admin Portal</div>
          <div className="form-headline">Create an account</div>
          <div className="form-sub">Already have an account? <a href="#">Log in</a></div>

          {error && <div className="form-error">⚠ {error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row-2">
              <input className="form-input" type="text" placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} autoFocus/>
              <input className="form-input" type="text" placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)}/>
            </div>
            <input className="form-input full" type="email" placeholder="Email (use: admin)" value={email} onChange={e => { setEmail(e.target.value); setError('') }}/>
            <div className="pw-wrap">
              <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="Password (use: admin123)" value={password} onChange={e => { setPassword(e.target.value); setError('') }} autoComplete="current-password"/>
              <div className="pw-eye" onClick={() => setShowPass(v => !v)}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/>
                  <circle cx="8" cy="8" r="2"/>
                </svg>
              </div>
            </div>
            <div className="terms-row">
              <div className="checkbox" onClick={() => setAgreed(v => !v)} style={{ opacity: agreed ? 1 : 0.4 }}>
                <svg viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M2 5l2 2.5 4-4"/></svg>
              </div>
              <div className="terms-text">I agree to the <a href="#">Terms &amp; Conditions</a></div>
            </div>
            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? <><span className="spinner">⚙</span>&nbsp; Creating account…</> : <span>Create account</span>}
            </button>
          </form>

          <div className="or-row"><div className="or-line"/><div className="or-text">Or register with</div><div className="or-line"/></div>
          <div className="social-row">
            <button className="social-btn">
              <svg viewBox="0 0 24 24" style={{width:15,height:15}}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button className="social-btn">
              <svg viewBox="0 0 24 24" fill="#8e8ea8" style={{width:15,height:15}}>
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
