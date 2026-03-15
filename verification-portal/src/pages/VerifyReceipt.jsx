import { useState, useEffect } from 'react'
import { verifyReceipt, formatTimestamp } from '../services/blockchainService.js'

/**
 * VerifyReceipt.jsx
 * Performs blockchain verification and renders the result.
 *
 * Props:
 *   receiptId: string   — the receipt to verify
 *   onBack()            — go back to Home
 */
export default function VerifyReceipt({ receiptId, onBack }) {
  const [status, setStatus] = useState('loading') // 'loading' | 'success' | 'error'
  const [result, setResult] = useState(null)

  useEffect(() => {
    setStatus('loading')
    setResult(null)
    verifyReceipt(receiptId).then(res => {
      setResult(res)
      setStatus(res.verified ? 'success' : 'error')
    })
  }, [receiptId])

  return (
    <div style={styles.page}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div style={styles.logoRing}>☸</div>
        <h1 style={styles.title}>Vote Verification</h1>
        <p style={styles.subtitle}>Election Commission of India — General Election 2024</p>
        <div style={styles.flagBar} />
      </div>

      {/* ── Back button ── */}
      <div style={{ width: '100%', maxWidth: 480, marginBottom: 16 }}>
        <button style={styles.backBtn} onClick={onBack}>
          ← Back to Search
        </button>
      </div>

      {/* ── Loading ── */}
      {status === 'loading' && (
        <div style={styles.loadingCard}>
          <div style={styles.spinner}>⚙</div>
          <div style={styles.loadingTitle}>Verifying on Blockchain…</div>
          <div style={styles.loadingReceipt}>Receipt: {receiptId}</div>
          <div style={styles.loadingSteps}>
            {['Connecting to Hyperledger Fabric', 'Fetching block data', 'Verifying hash integrity'].map((step, i) => (
              <div key={i} style={styles.loadingStep}>
                <span style={{ ...styles.stepDot, animationDelay: `${i * 0.3}s` }}>●</span>
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Success ── */}
      {status === 'success' && result && (
        <div style={{ ...styles.resultCard, ...styles.successCard }}>
          {/* Badge */}
          <div style={styles.successBadge}>
            <span style={styles.badgeIcon}>✓</span>
          </div>
          <h2 style={{ ...styles.resultTitle, color: '#1DB954' }}>Vote Verified Successfully</h2>
          <p style={styles.resultSubtitle}>
            Your vote has been confirmed on the Hyperledger Fabric blockchain.
          </p>

          <div style={styles.divider} />

          {/* Details grid */}
          {[
            ['Receipt #',        result.receiptId],
            ['Vote ID',          result.voteId],
            ['Timestamp',        formatTimestamp(result.timestamp)],
            ['Election',         result.election],
            ['Blockchain',       '✅ Found on Hyperledger Fabric', 'ok'],
            ['Block #',          result.blockNumber?.toLocaleString()],
            ['TX Hash',          result.blockchainTxId],
            ['Hash Integrity',   result.integrityVerified ? '✅ Verified' : '❌ Failed', result.integrityVerified ? 'ok' : 'fail'],
            ['District',         result.districtId],
            ['Terminal',         result.terminalId],
          ].map(([label, value, flag]) => (
            <div key={label} style={styles.row}>
              <span style={styles.rowLabel}>{label}</span>
              <span style={{
                ...styles.rowValue,
                ...(flag === 'ok'   ? { color: '#1DB954' } : {}),
                ...(flag === 'fail' ? { color: '#E74C3C' } : {}),
              }}>{value || '—'}</span>
            </div>
          ))}

          <button style={styles.exportBtn} onClick={() => window.print()}>
            📥 Export Verification Proof (PDF)
          </button>
        </div>
      )}

      {/* ── Error / Not Found ── */}
      {status === 'error' && result && (
        <div style={{ ...styles.resultCard, ...styles.errorCard }}>
          <div style={styles.errorBadge}>✗</div>
          <h2 style={{ ...styles.resultTitle, color: '#E74C3C' }}>Receipt Not Found</h2>
          <p style={styles.resultSubtitle}>
            No vote was found for receipt <strong style={{ color: '#e6edf3' }}>{receiptId}</strong>.
          </p>
          <p style={{ ...styles.resultSubtitle, marginTop: 8 }}>
            {result.error || 'Please double-check your receipt number and try again. If the problem persists, contact your local election office.'}
          </p>
          <button style={{ ...styles.exportBtn, marginTop: 20 }} onClick={onBack}>
            ← Try Again
          </button>
        </div>
      )}

      <p style={styles.footer}>
        <a href="https://eci.gov.in" target="_blank" rel="noopener" style={styles.link}>
          Election Commission of India
        </a>
        &nbsp;·&nbsp;
        <a href="#faq" style={styles.link}>Help &amp; FAQ</a>
      </p>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg,#0d1117 0%,#1a2744 55%,#0f2a1a 100%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '48px 16px 40px', fontFamily: "'Baloo 2', sans-serif",
  },
  header: { textAlign: 'center', marginBottom: 28 },
  logoRing: { fontSize: 48, lineHeight: 1, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: 800, color: '#fff', margin: 0 },
  subtitle: { fontSize: 13, color: '#8b949e', marginTop: 4 },
  flagBar: {
    width: 100, height: 4, margin: '12px auto 0',
    background: 'linear-gradient(90deg,#FF6B00 33.3%,#fff 33.3% 66.6%,#138808 66.6%)',
    borderRadius: 2,
  },
  backBtn: {
    background: 'transparent', border: '1px solid #30363d', color: '#8b949e',
    borderRadius: 8, padding: '7px 14px', fontFamily: 'inherit', fontSize: 13,
    fontWeight: 700, cursor: 'pointer', transition: 'all .15s',
  },

  // Loading
  loadingCard: {
    width: '100%', maxWidth: 480, background: '#161b22', border: '1px solid #30363d',
    borderRadius: 20, padding: 36, textAlign: 'center',
    boxShadow: '0 24px 64px rgba(0,0,0,.5)',
  },
  spinner: {
    fontSize: 44, animation: 'spin 1s linear infinite', display: 'inline-block',
    marginBottom: 16,
  },
  loadingTitle: { fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 6 },
  loadingReceipt: { fontSize: 13, color: '#8b949e', fontFamily: 'Courier New, monospace', marginBottom: 24 },
  loadingSteps: { display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' },
  loadingStep: { display: 'flex', alignItems: 'center', gap: 10, color: '#8b949e', fontSize: 13 },
  stepDot: { color: '#2563EB', animation: 'blink 1.4s infinite', animationDelay: '0s' },

  // Result card
  resultCard: {
    width: '100%', maxWidth: 480, borderRadius: 20, padding: 32,
    boxShadow: '0 24px 64px rgba(0,0,0,.5)', marginBottom: 20,
  },
  successCard: { background: 'rgba(29,185,84,.07)', border: '1.5px solid rgba(29,185,84,.3)' },
  errorCard:   { background: 'rgba(231,76,60,.07)', border: '1.5px solid rgba(231,76,60,.3)', textAlign: 'center' },

  successBadge: {
    width: 72, height: 72, background: '#138808', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(19,136,8,.35)',
    animation: 'pop .4s cubic-bezier(.175,.885,.32,1.275)',
  },
  badgeIcon: { fontSize: 36, color: '#fff', lineHeight: 1 },
  errorBadge: {
    width: 72, height: 72, background: '#C0392B', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px', fontSize: 36, color: '#fff', lineHeight: '72px',
    boxShadow: '0 8px 24px rgba(192,57,43,.35)',
  },
  resultTitle: { fontSize: 20, fontWeight: 800, textAlign: 'center', marginBottom: 6 },
  resultSubtitle: { fontSize: 13, color: '#8b949e', textAlign: 'center', lineHeight: 1.6 },
  divider: { height: 1, background: 'rgba(255,255,255,.08)', margin: '20px 0' },

  row: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,.06)', gap: 12,
  },
  rowLabel: { color: '#8b949e', fontSize: 12, fontWeight: 600, flexShrink: 0 },
  rowValue: { color: '#e6edf3', fontSize: 12, fontFamily: 'Courier New, monospace', textAlign: 'right', wordBreak: 'break-all' },

  exportBtn: {
    width: '100%', marginTop: 20, background: 'rgba(255,255,255,.06)',
    border: '1px solid #30363d', color: '#e6edf3', borderRadius: 10,
    padding: '12px 0', fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
    cursor: 'pointer', transition: 'background .2s',
  },

  footer: { color: '#8b949e', fontSize: 12, textAlign: 'center', marginTop: 8 },
  link: { color: '#60A5FA', textDecoration: 'none' },
}
