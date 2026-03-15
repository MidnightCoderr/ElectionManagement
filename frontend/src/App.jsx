import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import Landing        from './components/Landing.jsx'
import VoterUI        from './components/VoterUI.jsx'
import ObserverDashBoard     from './components/ObserverDashBoard.jsx'
import AdminPage          from './components/AdminPage.jsx'
import CreateAccount  from './components/CreateAccount.jsx'
import './index.css'

const TABS = [
  { id: 'land',    path: '/',          label: 'Home',       exact: true  },
  { id: 'voter',   path: '/voter',     label: 'Voter UI',   exact: false },
  { id: 'obs',     path: '/observer',  label: 'Observer',   exact: false },
  { id: 'admin',   path: '/dashboard', label: 'Dashboard',  exact: false },
]

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

      {TABS.map(({ id, path, label, exact }) => (
        <Link
          key={id}
          to={path}
          className={`ntab${isActive(path, exact) ? ' on' : ''}`}
        >
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
          <Route path="/create"    element={<CreateAccount />} />
        </Routes>
      </div>
    </div>
  )
}
