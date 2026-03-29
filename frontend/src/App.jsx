import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import Landing from './components/Landing.jsx'
import PublicLanding from './components/PublicLanding.jsx'
import LegalPage from './components/LegalPage.jsx'
import VoterUI from './components/VoterUI.jsx'
import ObserverDashBoard from './components/ObserverDashBoard.jsx'
import AdminPage from './components/AdminPage.jsx'
import VerificationPortal from './components/VerificationPortal.jsx'
import CandidatePortal from './components/CandidatePortal.jsx'
import CreateAccount from './components/CreateAccount.jsx'
import './index.css'

const ROLE_TABS = [
  { id: 'voter', label: 'Voter', path: '/app/voter' },
  { id: 'candidate', label: 'Candidate', path: '/app/candidate' },
  { id: 'observer', label: 'Observer', path: '/app/observer' },
]

function deriveActiveRole(pathname) {
  if (pathname.startsWith('/app/candidate')) return 'candidate'
  if (pathname.startsWith('/app/observer')) return 'observer'
  if (pathname.startsWith('/app/dashboard')) return 'operator'
  return 'voter'
}

function WorkspaceShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const [theme, setTheme] = useState(() => localStorage.getItem('campusvote-theme') || 'light')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('campusvote-theme', theme)
  }, [theme])

  const activeRole = useMemo(() => deriveActiveRole(location.pathname), [location.pathname])
  const topActionLabel = activeRole === 'voter' ? 'Your ballot is ready' : 'Register voter'

  return (
    <>
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__top app-header__zone-row">
            <button type="button" className="brand-lockup" onClick={() => navigate('/app')}>
              <span className="brand-mark" aria-hidden="true">CV</span>
              <span className="brand-copy">
                <span className="brand-copy__eyebrow">Campus election portal</span>
                <span className="brand-copy__name">CampusVote</span>
              </span>
            </button>

            <div className="app-header__center">
              {ROLE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`role-tab${activeRole === tab.id ? ' is-active' : ''}`}
                  onClick={() => navigate(tab.path)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="top-actions app-header__right">
              <button type="button" className="utility-link utility-link--button" onClick={() => navigate('/app/verify')}>
                Verify results
              </button>
              <button type="button" className="utility-link utility-link--button utility-link--muted" onClick={() => navigate('/app/dashboard')}>
                Admin
              </button>
              <button
                type="button"
                className="utility-toggle"
                aria-label="Toggle theme"
                onClick={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
              >
                {theme === 'light' ? 'Dark mode' : 'Light mode'}
              </button>
              <span className="user-chip">Ayush</span>
            </div>
          </div>

          <div className="app-header__roles">
            <span className="top-status">
              <span className="top-status__dot" />
              Election live
            </span>
            <button type="button" className="app-primary-action" onClick={() => navigate('/app/create')}>
              <svg className="app-primary-action__icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Welcome back, Ayush - {topActionLabel}
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/voter" element={<VoterUI />} />
          <Route path="/candidate" element={<CandidatePortal />} />
          <Route path="/observer" element={<ObserverDashBoard />} />
          <Route path="/dashboard" element={<AdminPage />} />
          <Route path="/verify" element={<VerificationPortal />} />
          <Route path="/create" element={<CreateAccount />} />
        </Routes>
      </main>
    </>
  )
}

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<PublicLanding />} />
        <Route path="/about" element={<LegalPage title="About CampusVote" body="CampusVote helps universities run secure digital elections with biometric verification, fraud-aware monitoring, and verifiable audit records." />} />
        <Route path="/privacy" element={<LegalPage title="Privacy Policy" body="CampusVote processes voter identity and election event data only for election operations. Biometric templates are protected, access is role-restricted, and audit activity is logged for compliance review." />} />
        <Route path="/terms" element={<LegalPage title="Terms of Service" body="Use of CampusVote is limited to authorized institutional workflows. Election administrators are responsible for lawful data collection and policy-compliant election configuration in their jurisdiction." />} />
        <Route path="/app/*" element={<WorkspaceShell />} />

        <Route path="/voter" element={<Navigate to="/app/voter" replace />} />
        <Route path="/candidate" element={<Navigate to="/app/candidate" replace />} />
        <Route path="/observer" element={<Navigate to="/app/observer" replace />} />
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/verify" element={<Navigate to="/app/verify" replace />} />
        <Route path="/create" element={<Navigate to="/app/create" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
