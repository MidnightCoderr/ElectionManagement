import { useState } from 'react'
import QRScanner from '../components/QRScanner.jsx'

/**
 * Home.jsx
 * Landing page for the verification portal.
 * Provides receipt number input and QR scanner access.
 *
 * Props:
 *   onVerify(receiptId: string) — navigate to VerifyReceipt with this ID
 */
export default function Home({ onVerify }) {
  const [receipt, setReceipt]       = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [inputError, setInputError]   = useState('')

  function handleSubmit(e) {
    e?.preventDefault?.()
    const trimmed = receipt.trim().toUpperCase()
    if (!trimmed) {
      setInputError('Please enter your receipt number.')
      return
    }
    setInputError('')
    onVerify(trimmed)
  }

  function handleQRScan(receiptId) {
    setShowScanner(false)
    setReceipt(receiptId)
    onVerify(receiptId)
  }

  function handleInput(e) {
    setReceipt(e.target.value)
    if (inputError) setInputError('')
  }

  return (
    <>
      {showScanner && (
        <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />
      )}

      <div style={styles.page}>
        {/* ── Header ── */}
        <div style={styles.header}>
          <div style={styles.logoRing}>☸</div>
          <h1 style={styles.title}>Vote Verification</h1>
          <p style={styles.subtitle}>Election Commission of India — General Election 2024</p>
          <div style={styles.flagBar} />
        </div>

        {/* ── Card ── */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🔍 Verify Your Vote Receipt</h2>
          <p style={styles.cardDesc}>
            Enter the receipt number from your voting slip or scan the QR code to
            confirm your vote was recorded on the blockchain.
          </p>

          {/* Input */}
          <label style={styles.label} htmlFor="receipt-input">Receipt Number</label>
          <input
            id="receipt-input"
            style={{ ...styles.input, ...(inputError ? styles.inputError : {}) }}
            type="text"
            value={receipt}
            onChange={handleInput}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="e.g. 12ABC34"
            maxLength={20}
            autoComplete="off"
            spellCheck={false}
          />
          {inputError && <p style={styles.errorHint}>⚠ {inputError}</p>}
          <p style={styles.hint}>The receipt number is printed on your paper voting slip.</p>

          {/* Divider */}
          <div style={styles.divider}><span style={styles.dividerText}>OR</span></div>

          {/* QR Scanner trigger */}
          <button style={styles.qrBox} onClick={() => setShowScanner(true)} type="button">
            <span style={{ fontSize: 28 }}>📷</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Scan QR Code</div>
              <div style={{ fontSize: 12, color: '#8b949e', marginTop: 2 }}>
                Use your device camera to scan the QR on your receipt
              </div>
            </div>
            <span style={{ marginLeft: 'auto', color: '#8b949e', fontSize: 20 }}>›</span>
          </button>

          {/* Verify button */}
          <button style={styles.verifyBtn} onClick={handleSubmit} type="button">
            🔍 &nbsp;Verify on Blockchain
          </button>
        </div>

        {/* ── Info strips ── */}
        <div style={styles.infoGrid}>
          {[
            { icon: '🔒', title: 'Anonymous',  desc: 'Your identity is never revealed during verification.' },
            { icon: '⛓',  title: 'Blockchain', desc: 'Results are verified against Hyperledger Fabric.' },
            { icon: '⚡', title: 'Instant',    desc: 'Verification completes in under 3 seconds.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={styles.infoCard}>
              <span style={{ fontSize: 24 }}>{icon}</span>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#e6edf3', marginTop: 6 }}>{title}</div>
              <div style={{ fontSize: 12, color: '#8b949e', marginTop: 4, lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>

        <p style={styles.footer}>
          <a href="https://eci.gov.in" target="_blank" rel="noopener" style={styles.link}>
            Election Commission of India
          </a>
          &nbsp;·&nbsp;
          <a href="#faq" style={styles.link}>Help &amp; FAQ</a>
        </p>
      </div>
    </>
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
  header: { textAlign: 'center', marginBottom: 36 },
  logoRing: {
    fontSize: 56, lineHeight: 1, marginBottom: 10,
    filter: 'drop-shadow(0 0 16px rgba(37,99,235,.5))',
  },
  title: { fontSize: 28, fontWeight: 800, color: '#fff', margin: 0 },
  subtitle: { fontSize: 13, color: '#8b949e', marginTop: 6 },
  flagBar: {
    width: 120, height: 4, margin: '14px auto 0',
    background: 'linear-gradient(90deg,#FF6B00 33.3%,#fff 33.3% 66.6%,#138808 66.6%)',
    borderRadius: 2,
  },
  card: {
    width: '100%', maxWidth: 480,
    background: '#161b22', border: '1px solid #30363d', borderRadius: 20,
    padding: 32, boxShadow: '0 24px 64px rgba(0,0,0,.5)',
    marginBottom: 20,
  },
  cardTitle: { fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 10 },
  cardDesc: { fontSize: 13, color: '#8b949e', lineHeight: 1.6, marginBottom: 24 },
  label: {
    display: 'block', color: '#8b949e', fontSize: 11, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6,
  },
  input: {
    width: '100%', background: '#0d1117', border: '1.5px solid #30363d',
    color: '#e6edf3', borderRadius: 10, padding: '13px 16px',
    fontFamily: "'Courier New',monospace", fontSize: 16, fontWeight: 700,
    letterSpacing: '.08em', outline: 'none', transition: 'border-color .2s',
    marginBottom: 4,
  },
  inputError: { borderColor: '#E74C3C' },
  errorHint: { color: '#E74C3C', fontSize: 12, marginBottom: 4 },
  hint: { fontSize: 11, color: '#8b949e', marginBottom: 20 },
  divider: {
    display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0 16px',
  },
  dividerText: {
    color: '#8b949e', fontSize: 13, whiteSpace: 'nowrap',
    background: '#161b22', padding: '0 8px',
    flex: 'none',
    // use pseudo via wrapper:
    position: 'relative',
  },
  qrBox: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 14,
    background: '#0d1117', border: '1.5px dashed #30363d', borderRadius: 12,
    padding: '14px 16px', cursor: 'pointer', marginBottom: 20, textAlign: 'left',
    color: '#e6edf3', fontFamily: 'inherit', transition: 'border-color .2s',
  },
  verifyBtn: {
    width: '100%', background: '#2563EB', color: '#fff', border: 'none',
    borderRadius: 12, padding: '16px 0', fontFamily: 'inherit',
    fontSize: 16, fontWeight: 800, cursor: 'pointer',
    transition: 'background .2s, transform .1s',
  },
  infoGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12,
    width: '100%', maxWidth: 480, marginBottom: 24,
  },
  infoCard: {
    background: 'rgba(22,27,34,.8)', border: '1px solid #30363d', borderRadius: 12,
    padding: '14px 12px', textAlign: 'center',
  },
  footer: { color: '#8b949e', fontSize: 12, textAlign: 'center' },
  link: { color: '#60A5FA', textDecoration: 'none' },
}
