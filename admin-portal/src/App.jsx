import { useState } from 'react'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'

export default function App() {
  const [admin, setAdmin] = useState(null)

  if (!admin) {
    return <Login onLogin={setAdmin} />
  }

  return <Dashboard admin={admin} onLogout={() => setAdmin(null)} />
}
