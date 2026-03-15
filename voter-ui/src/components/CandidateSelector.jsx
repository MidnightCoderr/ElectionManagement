import { useEffect, useState } from 'react'
import { useVotingStore, ACTIONS } from '../store/votingStore.jsx'
import { t } from '../i18n.js'
import { getCandidates } from '../services/election.js'

const SERIF = "'DM Serif Display', serif"
const FONT  = "'DM Sans', sans-serif"

export default function CandidateSelector() {
  const { state, dispatch } = useVotingStore()
  const { locale, voter } = state
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { getCandidates(voter?.district).then(l => { setCandidates(l); setLoading(false) }) }, [voter])

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',animation:'fadeSlideUp .4s ease'}}>
      <div style={s.hdr}>
        <span style={s.hdrTitle}>{t('select', locale)}</span>
        <span style={s.pill}>{t('progress',locale)} 1 {t('of',locale)} 1</span>
      </div>
      <div style={s.list}>
        {loading ? <div style={s.loading}>Loading candidates…</div>
          : candidates.map(c => <CandCard key={c.id} c={c} locale={locale} dispatch={dispatch}/>)}
      </div>
      <button style={s.back} onClick={() => dispatch({ type: ACTIONS.GO_TO_STEP, payload: 3 })}>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 2L4 6l4 4"/></svg>
        {t('back', locale)}
      </button>
    </div>
  )
}

function CandCard({ c, locale, dispatch }) {
  const [hov, setHov] = useState(false)
  return (
    <button style={{ ...s.card, ...(hov ? s.cardHov : {}) }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => dispatch({ type: ACTIONS.SELECT_CANDIDATE, payload: c })}>
      <div style={s.av}>
        <svg viewBox="0 0 20 20" fill="none" stroke="#9d7dfd" strokeWidth="1.6" strokeLinecap="round" style={{width:18,height:18}}>
          <circle cx="10" cy="7" r="3.5"/><path d="M3 18c0-3.87 3.13-7 7-7s7 3.13 7 7"/>
        </svg>
      </div>
      <div>
        <div style={s.cname}>{c.name}</div>
        <div style={s.cparty}>{c.party}</div>
      </div>
      <div style={s.csel}>{t('tap_to_select', locale)}</div>
    </button>
  )
}

const s = {
  hdr:     { background:'rgba(6,6,16,.92)',borderBottom:'1px solid rgba(255,255,255,0.05)',padding:'11px 15px',display:'flex',alignItems:'center',justifyContent:'space-between' },
  hdrTitle:{ fontFamily:FONT,fontSize:11,fontWeight:600,color:'#f2f2ff' },
  pill:    { fontFamily:FONT,fontSize:8,color:'#3e3e58',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:4,padding:'2px 8px' },
  list:    { flex:1,padding:10,display:'flex',flexDirection:'column',gap:7,background:'rgba(0,0,0,0.28)' },
  loading: { fontFamily:FONT,color:'#3e3e58',textAlign:'center',padding:40,fontSize:12 },
  card:    { borderRadius:9,padding:'10px 12px',display:'flex',alignItems:'center',gap:10,cursor:'pointer',background:'rgba(255,255,255,0.038)',border:'1px solid rgba(255,255,255,0.07)',boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04)',transition:'all .2s',width:'100%',fontFamily:FONT,textAlign:'left' },
  cardHov: { borderColor:'rgba(124,92,252,0.25)',background:'rgba(124,92,252,0.07)' },
  av:      { width:38,height:38,borderRadius:9,background:'rgba(91,63,212,0.14)',border:'1px solid rgba(124,92,252,0.12)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 },
  cname:   { fontFamily:FONT,fontSize:11,fontWeight:600,color:'#f2f2ff' },
  cparty:  { fontFamily:FONT,fontSize:8,color:'#3e3e58',marginTop:1 },
  csel:    { marginLeft:'auto',fontFamily:FONT,fontSize:8,fontWeight:600,padding:'2px 8px',borderRadius:4,color:'#c4b0fa',background:'rgba(124,92,252,0.1)',border:'1px solid rgba(124,92,252,0.14)' },
  back:    { padding:'10px 14px',background:'rgba(0,0,0,0.32)',borderTop:'1px solid rgba(255,255,255,0.04)',fontFamily:FONT,fontSize:10,fontWeight:500,color:'#3e3e58',display:'flex',alignItems:'center',gap:5,cursor:'pointer',border:'none' },
}
