/**
 * VerificationPortal.jsx
 * Renders the verification-portal sub-app.
 */
export default function VerificationPortal() {
  return (
    <iframe
      src={import.meta.env.VITE_VERIFY_URL || 'http://localhost:3003'}
      title="Vote Verification Portal"
      style={{ flex: 1, width: '100%', height: 'calc(100vh - 51px)',
               border: 'none', display: 'block' }}
    />
  )
}
