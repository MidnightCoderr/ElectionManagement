import { useState, useEffect } from 'react'
import { verifyReceipt, formatTimestamp } from '../services/blockchainService.js'

export default function VerifyReceipt({ receiptId, onBack }) {
  const [status, setStatus] = useState('loading')
  const [result, setResult] = useState(null)
  useEffect(() => {
    setStatus('loading'); setResult(null)
    verifyReceipt(receiptId).then(res => { setResult(res); setStatus(res.verified ? 'success' : 'error') })
  }, [receiptId])

  return (
    <div style={s.page}>
      <div style={s.bgGlow} />
      <div style={s.header}>
        <div style={s.logo}></div>
        <h1 style={s.title}>Vote Verification</h1>
        <p style={s.subtitle}>Election Commission of India</p>
        <div style={s.flagBar} />
      </div>
      <div style={{ width:'100%', maxWidth:460, marginBottom:14, position:'relative', zIndex:1 }}>
        <button style={s.backBtn} onClick={onBack}> Back to Search</button>
      </div>

      {status === 'loading' && (
        <div style={s.card}>
          <div style={s.spinner}></div>
          <div style={s.loadTitle}>Verifying on Blockchain</div>
          <div style={s.loadReceipt}>Receipt: {receiptId}</div>
          {['Connecting to Hyperledger Fabric','Fetching block data','Verifying hash integrity'].map((step,i) => (
            <div key={i} style={s.loadStep}><span style={{ color:'#7c5cfc' }}></span> {step}</div>
          ))}
        </div>
      )}

      {status === 'success' && result && (
        <div style={{ ...s.card, borderColor:'rgba(124,92,252,0.2)', background:'rgba(124,92,252,0.04)' }}>
          <div style={s.successBadge}></div>
          <h2 style={{ ...s.resultTitle, color:'#22d47a' }}>Vote Verified Successfully</h2>
          <p style={s.resultSub}>Confirmed on the Hyperledger Fabric blockchain.</p>
          <div style={s.divider} />
          {[
            ['Receipt #', result.receiptId],
            ['Vote ID',   result.voteId],
            ['Timestamp', formatTimestamp(result.timestamp)],
            ['Election',  result.election],
            ['Blockchain',' Found on Hyperledger Fabric','ok'],
            ['Block #',   result.blockNumber?.toLocaleString()],
            ['TX Hash',   result.blockchainTxId],
            ['Integrity', result.integrityVerified ? ' Verified' : ' Failed', result.integrityVerified ? 'ok':'fail'],
            ['District',  result.districtId],
            ['Terminal',  result.terminalId],
          ].map(([l,v,f])=> (
            <div key={l} style={s.row}>
              <span style={s.rowLabel}>{l}</span>
              <span style={{ ...s.rowValue, ...(f==='ok'?{color:'#22d47a'}:f==='fail'?{color:'#f04f58'}:{}) }}>{v||''}</span>
            </div>
          ))}
          <button style={s.exportBtn} onClick={() => window.print()}> Export Verification Proof (PDF)</button>
        </div>
      )}

      {status === 'error' && result && (
        <div style={{ ...s.card, borderColor:'rgba(240,79,88,0.2)', background:'rgba(240,79,88,0.04)', textAlign:'center' }}>
          <div style={{ ...s.successBadge, background:'linear-gradient(135deg,#f04f58,#c0392b)' }}></div>
          <h2 style={{ ...s.resultTitle, color:'#f04f58' }}>Receipt Not Found</h2>
          <p style={s.resultSub}>No vote found for <strong style={{ color:'#f0f0ff' }}>{receiptId}</strong>.</p>
          <p style={{ ...s.resultSub, marginTop:6 }}>{result.error || 'Please double-check and try again.'}</p>
          <button style={{ ...s.exportBtn, marginTop:18 }} onClick={onBack}> Try Again</button>
        </div>
      )}

      <p style={s.footer}>
        <a href="https://eci.gov.in" target="_blank" rel="noopener" style={s.link}>Election Commission</a>
        &nbsp;&nbsp;<a href="#faq" style={s.link}>Help</a>
      </p>
    </div>
  )
}

const s = {
  page: {
    minHeight:'100vh', background:'#09090f',
    display:'flex', flexDirection:'column', alignItems:'center',
    padding:'48px 16px 40px', fontFamily:"'DM Sans',sans-serif",
    color:'#f0f0ff', position:'relative', overflow:'hidden',
  },
  bgGlow: {
    position:'fixed', top:-80, left:'40%', width:500, height:500, borderRadius:'50%',
    background:'radial-gradient(circle,rgba(124,92,252,0.07) 0%,transparent 70%)',
    pointerEvents:'none', zIndex:0,
  },
  header: { textAlign:'center', marginBottom:26, position:'relative', zIndex:1 },
  logo:     { fontSize:48, lineHeight:1, marginBottom:8, filter:'drop-shadow(0 0 16px rgba(124,92,252,0.5))' },
  title:    { fontSize:22, fontWeight:800, color:'#f0f0ff', margin:0 },
  subtitle: { fontSize:12, color:'rgba(160,160,192,0.7)', marginTop:4 },
  flagBar:  { width:90, height:3, margin:'10px auto 0', background:'linear-gradient(90deg,var(--p1),var(--p2),var(--p3))', borderRadius:2 },
  backBtn: {
    background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
    color:'rgba(160,160,192,0.8)', borderRadius:9999, padding:'6px 14px',
    fontFamily:'inherit', fontSize:12, fontWeight:700, cursor:'pointer',
  },
  card: {
    width:'100%', maxWidth:460, position:'relative', zIndex:1,
    background:'rgba(22,22,37,0.8)', backdropFilter:'blur(16px)',
    border:'1px solid rgba(255,255,255,0.08)', borderRadius:20,
    padding:28, boxShadow:'0 24px 64px rgba(0,0,0,.6)', marginBottom:16,
  },
  spinner: { fontSize:44, animation:'spin 1s linear infinite', display:'block', textAlign:'center', marginBottom:14 },
  loadTitle:  { fontSize:17, fontWeight:800, color:'#f0f0ff', textAlign:'center', marginBottom:5 },
  loadReceipt:{ fontSize:12, color:'rgba(160,160,192,0.7)', textAlign:'center', fontFamily:'Courier New,monospace', marginBottom:20 },
  loadStep:   { display:'flex', alignItems:'center', gap:8, color:'rgba(160,160,192,0.7)', fontSize:12, padding:'4px 0' },
  successBadge: {
    width:68, height:68, borderRadius:'50%',
    background:'linear-gradient(135deg,#7c5cfc,#5b3fd4)',
    display:'flex', alignItems:'center', justifyContent:'center',
    margin:'0 auto 14px', fontSize:34, color:'#fff', lineHeight:1,
    boxShadow:'0 8px 24px rgba(124,92,252,0.35)',
  },
  resultTitle:  { fontSize:18, fontWeight:800, textAlign:'center', marginBottom:5 },
  resultSub:    { fontSize:12, color:'rgba(160,160,192,0.7)', textAlign:'center', lineHeight:1.6 },
  divider:      { height:1, background:'rgba(255,255,255,0.06)', margin:'16px 0' },
  row:          { display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.04)', gap:10 },
  rowLabel:     { color:'rgba(160,160,192,0.6)', fontSize:11, fontWeight:600, flexShrink:0 },
  rowValue:     { color:'#f0f0ff', fontSize:11, fontFamily:'Courier New,monospace', textAlign:'right', wordBreak:'break-all' },
  exportBtn: {
    width:'100%', marginTop:16, background:'rgba(124,92,252,0.12)',
    border:'1px solid rgba(124,92,252,0.3)', color:'#9d7dfd',
    borderRadius:10, padding:'11px 0', fontFamily:'inherit',
    fontSize:13, fontWeight:700, cursor:'pointer', transition:'background .2s',
  },
  footer: { color:'rgba(96,96,128,0.7)', fontSize:11, textAlign:'center', position:'relative', zIndex:1 },
  link:   { color:'#7c5cfc', textDecoration:'none' },
}
