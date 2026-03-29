import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import Landing from './components/Landing.jsx'
import VoterUI from './components/VoterUI.jsx'
import ObserverDashBoard from './components/ObserverDashBoard.jsx'
import AdminPage from './components/AdminPage.jsx'
import VerificationPortal from './components/VerificationPortal.jsx'
import CandidatePortal from './components/CandidatePortal.jsx'
import CreateAccount from './components/CreateAccount.jsx'
import './index.css'

const ROLE_TABS = [
  { id: 'voter', label: 'Voter', path: '/voter' },
  { id: 'candidate', label: 'Candidate', path: '/candidate' },
  { id: 'observer', label: 'Observer', path: '/observer' },
]

function deriveActiveRole(pathname) {
  if (pathname.startsWith('/candidate')) return 'candidate'
  if (pathname.startsWith('/observer')) return 'observer'
  if (pathname.startsWith('/dashboard')) return 'operator'
  return 'voter'
}

function AppShell() {
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
            <button type="button" className="brand-lockup" onClick={() => navigate('/')}>
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
              <button type="button" className="utility-link utility-link--button" onClick={() => navigate('/verify')}>
                Verify results
              </button>
              <button type="button" className="utility-link utility-link--button utility-link--muted" onClick={() => navigate('/dashboard')}>
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
            <button type="button" className="app-primary-action" onClick={() => navigate('/create')}>
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
      <AppShell />
    </div>
  )
}
