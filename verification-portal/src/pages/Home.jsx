import { useState } from 'react'
import QRScanner from '../components/QRScanner.jsx'

export default function Home({ onVerify }) {
  const [receipt, setReceipt]         = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [inputError, setInputError]   = useState('')

  function handleSubmit(e) {
    e?.preventDefault?.()
    const trimmed = receipt.trim().toUpperCase()
    if (!trimmed) { setInputError('Please enter your receipt number.'); return }
    setInputError(''); onVerify(trimmed)
  }

  function handleQRScan(id) { setShowScanner(false); setReceipt(id); onVerify(id) }

  return (
    <>
      {showScanner && <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />}
      <div style={s.page}>
        <div style={s.bgGlow1} />
        <div style={s.bgGlow2} />

        <div style={s.header}>
          <div style={s.logoRing}></div>
          <h1 style={s.title}>Vote Verification</h1>
          <p style={s.subtitle}>Election Commission of India  General Election 2024</p>
          <div style={s.flagBar} />
        </div>

        <div style={s.card}>
          <h2 style={s.cardTitle}> Verify Your Vote Receipt</h2>
          <p style={s.cardDesc}>Enter your receipt number or scan the QR code to confirm your vote was recorded on the blockchain.</p>

          <label style={s.label} htmlFor="receipt-input">Receipt Number</label>
          <input
            id="receipt-input"
            style={{ ...s.input, ...(inputError ? s.inputErr : {}) }}
            type="text" value={receipt} placeholder="e.g. 12ABC34" maxLength={20}
            autoComplete="off" spellCheck={false}
            onChange={e => { setReceipt(e.target.value); setInputError('') }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          {inputError && <p style={s.errHint}> {inputError}</p>}
          <p style={s.hint}>Printed on your paper voting slip.</p>

          <div style={s.divider}><span style={s.dividerLine}/><span style={s.dividerText}>OR</span><span style={s.dividerLine}/></div>

          <button style={s.qrBox} onClick={() => setShowScanner(true)} type="button">
            <span style={{ fontSize:28 }}></span>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:'#f0f0ff' }}>Scan QR Code</div>
              <div style={{ fontSize:11, color:'rgba(160,160,192,0.7)', marginTop:2 }}>Use camera to scan receipt QR</div>
            </div>
            <span style={{ marginLeft:'auto', color:'rgba(124,92,252,0.8)', fontSize:18 }}></span>
          </button>

          <button style={s.verifyBtn} onClick={handleSubmit} type="button">
             &nbsp;Verify on Blockchain
          </button>
        </div>

        <div style={s.infoGrid}>
          {[
            { icon:'', title:'Anonymous',  desc:'Your identity is never revealed.' },
            { icon:'',  title:'Blockchain', desc:'Verified on Hyperledger Fabric.' },
            { icon:'', title:'Instant',    desc:'Results in under 3 seconds.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={s.infoCard}>
              <span style={{ fontSize:22 }}>{icon}</span>
              <div style={{ fontWeight:700, fontSize:12, color:'#f0f0ff', marginTop:6 }}>{title}</div>
              <div style={{ fontSize:11, color:'rgba(160,160,192,0.7)', marginTop:3, lineHeight:1.5 }}>{desc}</div>
            </div>
          ))}
        </div>

        <p style={s.footer}>
          <a href="https://eci.gov.in" target="_blank" rel="noopener" style={s.link}>Election Commission of India</a>
          &nbsp;&nbsp;<a href="#faq" style={s.link}>Help &amp; FAQ</a>
        </p>
      </div>
    </>
  )
}

const s = {
  page: {
    minHeight:'100vh', background:'#09090f',
    display:'flex', flexDirection:'column', alignItems:'center',
    padding:'48px 16px 40px', fontFamily:"'DM Sans',sans-serif",
    color:'#f0f0ff', position:'relative', overflow:'hidden',
  },
  bgGlow1: {
    position:'fixed', top:-100, left:'30%', width:500, height:500, borderRadius:'50%',
    background:'radial-gradient(circle,rgba(124,92,252,0.08) 0%,transparent 70%)',
    pointerEvents:'none', zIndex:0,
  },
  bgGlow2: {
    position:'fixed', bottom:-100, right:'20%', width:400, height:400, borderRadius:'50%',
    background:'radial-gradient(circle,rgba(91,63,212,0.06) 0%,transparent 70%)',
    pointerEvents:'none', zIndex:0,
  },
  header: { textAlign:'center', marginBottom:32, position:'relative', zIndex:1 },
  logoRing: {
    fontSize:52, lineHeight:1, marginBottom:10,
    filter:'drop-shadow(0 0 20px rgba(124,92,252,0.5))',
  },
  title:    { fontSize:26, fontWeight:800, color:'#f0f0ff', margin:0 },
  subtitle: { fontSize:13, color:'rgba(160,160,192,0.7)', marginTop:5 },
  flagBar: {
    width:100, height:3, margin:'12px auto 0',
    background:'linear-gradient(90deg,var(--p1),var(--p2),var(--p3))',
    borderRadius:2,
  },
  card: {
    width:'100%', maxWidth:460, position:'relative', zIndex:1,
    background:'rgba(22,22,37,0.8)', backdropFilter:'blur(16px)',
    border:'1px solid rgba(255,255,255,0.08)', borderRadius:20,
    padding:28, boxShadow:'0 24px 64px rgba(0,0,0,.6),0 0 0 1px rgba(124,92,252,0.1)',
    marginBottom:16,
  },
  cardTitle: { fontSize:16, fontWeight:800, color:'#f0f0ff', marginBottom:8 },
  cardDesc:  { fontSize:12, color:'rgba(160,160,192,0.7)', lineHeight:1.6, marginBottom:20 },
  label: {
    display:'block', color:'rgba(160,160,192,0.7)', fontSize:10, fontWeight:700,
    textTransform:'uppercase', letterSpacing:'.06em', marginBottom:5,
  },
  input: {
    width:'100%', background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.1)',
    color:'#f0f0ff', borderRadius:10, padding:'12px 14px',
    fontFamily:"'Courier New',monospace", fontSize:15, fontWeight:700,
    letterSpacing:'.06em', outline:'none', transition:'all .2s', marginBottom:4,
  },
  inputErr: { borderColor:'rgba(240,79,88,0.6)' },
  errHint:  { color:'#f04f58', fontSize:11, marginBottom:4 },
  hint:     { fontSize:11, color:'rgba(96,96,128,0.8)', marginBottom:18 },
  divider:  { display:'flex', alignItems:'center', gap:10, margin:'4px 0 14px' },
  dividerLine: { flex:1, height:1, background:'rgba(255,255,255,0.08)' },
  dividerText: { color:'rgba(160,160,192,0.5)', fontSize:12 },
  qrBox: {
    width:'100%', display:'flex', alignItems:'center', gap:12,
    background:'rgba(0,0,0,0.3)', border:'1px dashed rgba(124,92,252,0.3)',
    borderRadius:12, padding:'12px 14px', cursor:'pointer', marginBottom:16,
    textAlign:'left', color:'#f0f0ff', fontFamily:'inherit', transition:'border-color .2s',
  },
  verifyBtn: {
    width:'100%', background:'linear-gradient(135deg,#7c5cfc,#9d7dfd)', color:'#fff',
    border:'none', borderRadius:12, padding:'15px 0', fontFamily:'inherit',
    fontSize:15, fontWeight:800, cursor:'pointer',
    boxShadow:'0 8px 24px rgba(124,92,252,0.4)', transition:'opacity .2s',
  },
  infoGrid: {
    display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10,
    width:'100%', maxWidth:460, marginBottom:20, position:'relative', zIndex:1,
  },
  infoCard: {
    background:'rgba(22,22,37,0.6)', border:'1px solid rgba(255,255,255,0.06)',
    borderRadius:12, padding:'12px 10px', textAlign:'center',
    backdropFilter:'blur(8px)',
  },
  footer: { color:'rgba(96,96,128,0.8)', fontSize:11, textAlign:'center', position:'relative', zIndex:1 },
  link:   { color:'#7c5cfc', textDecoration:'none' },
}
