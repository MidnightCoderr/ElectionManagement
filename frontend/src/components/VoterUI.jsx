/**
 * VoterUI.jsx
 * Renders the voter-ui sub-app.
 * In production each sub-app runs on its own port/domain.
 * In development, this component embeds it via an iframe OR
 * you can run voter-ui standalone on port 3001.
 */
export default function VoterUI() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg,#0d1117 0%,#1a2744 40%,#0f2a1a 100%)',
                  minHeight: 'calc(100vh - 51px)', padding: '32px 16px' }}>
      <iframe
        src={import.meta.env.VITE_VOTER_UI_URL || 'http://localhost:3001'}
        title="Voter Terminal UI"
        style={{ width: 420, maxWidth: '100%', height: 640, border: 'none',
                 borderRadius: 28, boxShadow: '0 32px 80px rgba(0,0,0,.6), 0 0 0 6px #2a2a2a' }}
      />
    </div>
  )
}
