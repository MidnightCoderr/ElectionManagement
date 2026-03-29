import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '20px' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 800, margin: '0' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--ink-muted)' }}>Page Not Found</h2>
      <p style={{ color: "var(--ink-soft)", marginBottom: 32 }}>
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <button 
        onClick={() => navigate('/')} 
        style={{ marginTop: '24px' }} 
        className="button button--primary"
      >
        Return Home
      </button>
    </div>
  );
}
