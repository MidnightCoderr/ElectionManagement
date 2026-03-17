import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import Landing        from './components/Landing.jsx'
import VoterUI        from './components/VoterUI.jsx'
import ObserverDashBoard     from './components/ObserverDashBoard.jsx'
import AdminPage          from './components/AdminPage.jsx'
import VerificationPortal from './components/VerificationPortal.jsx'
import CreateAccount  from './components/CreateAccount.jsx'
import './index.css'

const TABS = [
  { id: 'land',    path: '/',          label: 'Home',          exact: true,
    icon: <><path d="M2 6l5-4 5 4"/><rect x="3.5" y="6" width="7" height="5" rx=".8"/></> },
  { id: 'voter',   path: '/voter',     label: 'Voter Portal',  exact: false,
    icon: <><circle cx="7" cy="5" r="2.5"/><path d="M2.5 12.5c0-2.49 2.01-4.5 4.5-4.5s4.5 2.01 4.5 4.5"/></> },
  { id: 'obs',     path: '/observer',  label: 'Observer',      exact: false,
    icon: <><path d="M1 7s2.5-4.5 6-4.5S13 7 13 7s-2.5 4.5-6 4.5S1 7 1 7z"/><circle cx="7" cy="7" r="2"/></> },
  { id: 'admin',   path: '/dashboard', label: 'Admin Portal',  exact: false,
    icon: <><rect x="1" y="1" width="5" height="5" rx="1"/><rect x="8" y="1" width="5" height="5" rx="1"/><rect x="1" y="8" width="5" height="5" rx="1"/><rect x="8" y="8" width="5" height="5" rx="1"/></> },
  { id: 'verify',  path: '/verify',    label: 'Verify',        exact: false,
    icon: <><path d="M7 2v2M12 7h-2M7 12v-2M2 7h2"/><circle cx="7" cy="7" r="2.5"/></> },
]

// Portal URLs for "Open in Full App" links
const PORTAL_URLS = {
  voter:    import.meta.env.VITE_VOTER_URL    || 'http://localhost:3001',
  observer: import.meta.env.VITE_OBSERVER_URL || 'http://localhost:3002',
  verify:   import.meta.env.VITE_VERIFY_URL   || 'http://localhost:3003',
  admin:    import.meta.env.VITE_ADMIN_URL    || 'http://localhost:3004',
}

function Nav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isActive = (path, exact) => exact ? pathname === path : pathname.startsWith(path)

  return (
    <div className="nav">
      <div className="nav-brand" onClick={() => navigate('/')}>
        <div className="nav-orb" />
        <span className="nav-brand-name">ElectionOS</span>
      </div>

      {TABS.map(({ id, path, label, exact, icon }) => (
        <Link
          key={id}
          to={path}
          className={`ntab${isActive(path, exact) ? ' on' : ''}`}
        >
          <svg className="ntab-ico" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            {icon}
          </svg>
          {label}
        </Link>
      ))}

      <div className="nav-right">
        <div className="nav-pill">
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M10 6a4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4"/>
            <path d="M10 2L6 6"/>
          </svg>
          Protection
        </div>
        <button className="nav-create" onClick={() => navigate('/create')}>
          <svg className="ntab-ico" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <circle cx="7" cy="5" r="3"/><path d="M3 13c0-2.21 1.79-4 4-4s4 1.79 4 4"/><path d="M11 2v4M9 4h4"/>
          </svg>
          Create Account
        </button>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div className="app">
      <Nav />
      <div className="views" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Routes>
          <Route path="/"          element={<Landing />} />
          <Route path="/voter"     element={<VoterUI />} />
          <Route path="/observer"  element={<ObserverDashBoard />} />
          <Route path="/dashboard" element={<AdminPage />} />
          <Route path="/verify"    element={<VerificationPortal />} />
          <Route path="/create"    element={<CreateAccount />} />
        </Routes>
      </div>
    </div>
  )
}
