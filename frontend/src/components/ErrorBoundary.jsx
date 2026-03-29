import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '20px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0' }}>Something went wrong</h1>
          <p style={{ marginTop: '16px', color: 'var(--ink-muted)' }}>An unexpected error occurred. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '24px' }} 
            className="button button--primary"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
