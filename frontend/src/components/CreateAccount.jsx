export default function CreateAccount() {
  return (
    <iframe
      src={import.meta.env.VITE_CREATE_ACCOUNT_URL || 'http://localhost:3003'}
      title="Create Account"
      style={{ flex: 1, width: '100%', height: 'calc(100vh - 46px)', border: 'none', display: 'block' }}
    />
  )
}
