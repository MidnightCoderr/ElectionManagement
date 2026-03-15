import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom'
import VoterUI from './components/VoterUI.jsx'
import ObserverDashboard from './components/ObserverDashboard.jsx'
import VerificationPortal from './components/VerificationPortal.jsx'
import CreateAccount from './components/CreateAccount.jsx'
import './index.css'

const NAV_ITEMS = [
  { path: '/voter',    label: 'Voter UI' },
  { path: '/observer', label: 'Observer' },
  { path: '/dashboard', label: 'Dashboard' },
]

function NavBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  return (
    <nav className="nav-tabs">
      <Link to="/" className="nav-brand">
        <div className="nav-brand-orb" />
        <span className="nav-brand-name">ElectionOS</span>
      </Link>
      {NAV_ITEMS.map(({ path, label }) => (
        <Link
          key={path}
          to={path}
          className={`nav-tab ${pathname.startsWith(path) ? 'active' : ''}`}
        >
          {label}
        </Link>
      ))}
      <div className="nav-right">
        <button className="nav-create-btn" onClick={() => navigate('/create')}>
          Create Account
        </button>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <div id="app">
      <NavBar />
      <Routes>
        <Route path="/"          element={<Navigate to="/voter" replace />} />
        <Route path="/voter"     element={<VoterUI />} />
        <Route path="/observer"  element={<ObserverDashboard />} />
        <Route path="/dashboard" element={<VerificationPortal />} />
        <Route path="/create"    element={<CreateAccount />} />
      </Routes>
    </div>
  )
}
