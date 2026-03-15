import { useEffect, useState } from 'react'
import { useVotingStore, ACTIONS } from '../store/votingStore.jsx'
import { t } from '../i18n.js'
import { castVote } from '../services/vote.js'

const SERIF = "'DM Serif Display', serif"
const FONT  = "'DM Sans', sans-serif"
const MONO  = "'Courier New', monospace"

export default function VoteReceipt() {
  const { state, dispatch } = useVotingStore()
  const { locale, selectedCandidate, voter, receipt } = state
  const [casting, setCasting] = useState(!receipt)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (receipt) { setCasting(false); return }
    castVote({ candidateId: selectedCandidate?.id, voterId: voter?.voterId })
      .then(r => { dispatch({ type: ACTIONS.SET_RECEIPT, payload: r }); setCasting(false) })
      .catch(e => setError(e.message))
  }, [])

  if (casting && !error) return (
    <div style={s.cast}>
      <div style={s.castGlow}/>
      <div style={s.castCircle}>
        <div style={s.castCircleShine}/>
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" style={{width:28,height:28,position:'relative',zIndex:1}}><path d="M5 13l4 4L19 7"/></svg>
      </div>
      <div style={s.castTitle}>{t('vote_recorded', locale)}</div>
      <div style={s.castSub}><span style={s.spinner}>⚙</span>&nbsp; {t('processing', locale)}</div>
    </div>
  )

  if (error) return (
    <div style={s.cast}>
      <div style={{...s.castCircle,background:'linear-gradient(135deg,rgba(240,79,88,0.6),rgba(192,57,43,0.7))'}}>✗</div>
      <div style={{...s.castTitle,color:'#9d7dfd'}}>Submission Failed</div>
      <div style={s.castSub}>{error}</div>
    </div>
  )

  const r = receipt
  const qrCells = Array.from({length:64},()=>`<div style="background:${Math.random()>.5?'rgba(255,255,255,0.85)':'rgba(91,63,212,0.7)'};aspect-ratio:1;border-radius:1px"></div>`).join('')

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',animation:'fadeSlideUp .4s ease'}}>
      <div style={s.recHdr}><h2 style={s.recHdrTitle}>🎉 {t('thank_you', locale)}</h2></div>
      <div style={s.recBody}>
        <div style={s.recCard}>
          <div style={s.qrBox} dangerouslySetInnerHTML={{__html:`<div style="display:grid;grid-template-columns:repeat(8,1fr);gap:2px;padding:8px;width:100%;height:100%">${qrCells}</div>`}}/>
          {[['Receipt #',r?.receiptId||'—'],['Time',r?.timestamp?new Date(r.timestamp).toLocaleTimeString():'—'],['TX Hash',r?.blockchainTxId||'—'],['Terminal',r?.terminalId||'—']].map(([l,v])=>(
            <div key={l} style={s.row}><span style={s.rowLbl}>{l}</span><span style={s.rowVal}>{v}</span></div>
          ))}
          <p style={s.hint}>📱 {t('scan_to_verify', locale)}</p>
          <button style={s.printBtn} onClick={() => window.print()}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{flexShrink:0}}><rect x="3" y="5" width="10" height="7" rx="1.5"/><path d="M5 5V3.5A1.5 1.5 0 016.5 2h3A1.5 1.5 0 0111 3.5V5"/></svg>
            {t('print_receipt', locale)}
          </button>
        </div>
        <p style={s.autoClose}>
          {t('auto_close', locale)} &nbsp;·&nbsp;
          <button style={s.newVoter} onClick={() => dispatch({ type: ACTIONS.RESET })}>
            {t('new_voter', locale)} →
          </button>
        </p>
      </div>
    </div>
  )
}

const s = {
  cast:       { flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,padding:'32px 22px',background:'linear-gradient(160deg,#04040a,#0a0a16)',animation:'fadeSlideUp .4s ease',position:'relative',overflow:'hidden' },
  castGlow:   { position:'absolute',top:'30%',left:'50%',transform:'translate(-50%,-50%)',width:260,height:260,borderRadius:'50%',background:'radial-gradient(circle,rgba(91,63,212,0.1) 0%,transparent 70%)',pointerEvents:'none' },
  castCircle: { width:80,height:80,borderRadius:14,background:'linear-gradient(145deg,rgba(124,92,252,0.3),rgba(91,63,212,0.4))',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid rgba(180,160,255,0.13)',boxShadow:'inset 0 2px 0 rgba(255,255,255,0.13),0 8px 24px rgba(91,63,212,0.28)',position:'relative',overflow:'hidden' },
  castCircleShine:{ position:'absolute',top:0,left:0,right:0,height:'50%',background:'linear-gradient(180deg,rgba(255,255,255,0.13),transparent)',borderRadius:'14px 14px 0 0' },
  castTitle:  { fontFamily:"'DM Serif Display',serif",fontSize:20,fontWeight:400,color:'#9d7dfd' },
  castSub:    { fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:300,color:'#3e3e58' },
  spinner:    { fontSize:18,display:'inline-block',animation:'spin 1s linear infinite' },
  recHdr:     { background:'linear-gradient(135deg,rgba(91,63,212,0.6),rgba(74,54,160,0.7))',padding:16,textAlign:'center' },
  recHdrTitle:{ fontFamily:"'DM Serif Display',serif",fontSize:16,fontWeight:400,color:'#fff' },
  recBody:    { flex:1,padding:14,background:'rgba(0,0,0,0.35)' },
  recCard:    { background:'rgba(255,255,255,0.04)',borderRadius:14,padding:16,border:'1px solid rgba(255,255,255,0.08)',boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04)' },
  qrBox:      { width:100,height:100,margin:'0 auto 14px',background:'#04040a',borderRadius:8,overflow:'hidden',border:'1px solid rgba(124,92,252,0.25)' },
  row:        { display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid rgba(255,255,255,0.05)',fontSize:11 },
  rowLbl:     { fontFamily:"'DM Sans',sans-serif",fontWeight:500,color:'#3e3e58',fontSize:10 },
  rowVal:     { fontFamily:"'Courier New',monospace",fontWeight:400,color:'#f2f2ff',fontSize:10 },
  hint:       { fontFamily:"'DM Sans',sans-serif",textAlign:'center',margin:'10px 0',color:'#3e3e58',fontSize:10 },
  printBtn:   { width:'100%',marginTop:4,background:'linear-gradient(135deg,rgba(124,92,252,0.7),rgba(91,63,212,0.8))',color:'#fff',border:'none',borderRadius:8,padding:11,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6 },
  autoClose:  { fontFamily:"'DM Sans',sans-serif",textAlign:'center',color:'#3e3e58',fontSize:10,marginTop:10,display:'flex',alignItems:'center',justifyContent:'center',gap:4 },
  newVoter:   { background:'none',border:'none',color:'#7c5cfc',fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:500,cursor:'pointer',padding:0 },
}
