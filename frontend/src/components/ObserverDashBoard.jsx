/**
 * ObserverDashboard.jsx
 * Renders the observer-dashboard sub-app.
 */
export default function ObserverDashboard() {
  return (
    <iframe
      src={import.meta.env.VITE_OBSERVER_URL || 'http://localhost:3002'}
      title="Observer Dashboard"
      style={{ flex: 1, width: '100%', height: 'calc(100vh - 51px)',
               border: 'none', display: 'block' }}
    />
  )
}
