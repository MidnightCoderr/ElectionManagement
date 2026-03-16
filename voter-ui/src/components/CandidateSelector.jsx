import { useEffect, useState } from 'react'
import { useVotingStore, ACTIONS } from '../store/votingStore.jsx'
import { t } from '../i18n.js'
import { getCandidates } from '../services/election.js'

const FONT  = "'DM Sans', sans-serif"
const SERIF = "'DM Serif Display', serif"

export default function CandidateSelector() {
  const { state, dispatch } = useVotingStore()
  const { locale, voter } = state
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCandidates(voter?.district).then(l=>{ setCandidates(l); setLoading(false) })
  }, [voter])

  return (
    <div style={s.wrap}>
      <div style={s.topBar}>
        <span style={s.topTitle}>{t('select',locale)}</span>
        <span style={s.pill}>{t('progress',locale)} 1 {t('of',locale)} 1</span>
      </div>

      <div style={s.listArea}>
        {loading
          ? <div style={s.loading}>Loading candidates...</div>
          : (
            <div style={s.grid}>
              {candidates.map(c => <CandCard key={c.id} c={c} locale={locale} dispatch={dispatch}/>)}
            </div>
          )
        }
      </div>

      <div style={s.footer}>
        <button style={s.backBtn} onClick={()=>dispatch({type:ACTIONS.GO_TO_STEP,payload:3})}>
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M8 2L4 6l4 4"/>
          </svg>
          {t('back',locale)}
        </button>
      </div>
    </div>
  )
}

function CandCard({ c, locale, dispatch }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      style={{...s.card,...(hov?s.cardHov:{})}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={()=>dispatch({type:ACTIONS.SELECT_CANDIDATE,payload:c})}
    >
      <div style={s.av}>
        <svg viewBox="0 0 20 20" fill="none" stroke="#9d7dfd" strokeWidth="1.6" strokeLinecap="round" style={{width:24,height:24}}>
          <circle cx="10" cy="7" r="3.5"/>
          <path d="M3 18c0-3.87 3.13-7 7-7s7 3.13 7 7"/>
        </svg>
      </div>
      <div style={{flex:1}}>
        <div style={s.cname}>{c.name}</div>
        <div style={s.cparty}>{c.party}</div>
      </div>
      <div style={s.csel}>{t('tap_to_select',locale)}</div>
    </button>
  )
}

const s = {
  wrap:{flex:1,display:'flex',flexDirection:'column',background:'linear-gradient(160deg,#040408,#08081a)'},
  topBar:{
    background:'rgba(6,6,18,0.95)',backdropFilter:'blur(12px)',
    borderBottom:'1px solid rgba(255,255,255,0.06)',
    padding:'16px 32px',display:'flex',alignItems:'center',justifyContent:'space-between',
    flexShrink:0,
  },
  topTitle:{fontFamily:FONT,fontSize:15,fontWeight:600,color:'#f2f2ff'},
  pill:{fontFamily:FONT,fontSize:11,color:'#3e3e58',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:6,padding:'4px 12px'},
  listArea:{flex:1,overflowY:'auto',padding:'24px 32px'},
  grid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,380px),1fr))',gap:12},
  loading:{fontFamily:FONT,color:'#3e3e58',textAlign:'center',padding:60,fontSize:15},
  card:{
    borderRadius:12,padding:'16px 20px',
    display:'flex',alignItems:'center',gap:16,cursor:'pointer',
    background:'rgba(255,255,255,0.04)',
    backdropFilter:'blur(12px)',
    border:'1px solid rgba(255,255,255,0.08)',
    boxShadow:'inset 0 1px 0 rgba(255,255,255,0.05)',
    transition:'all .2s',width:'100%',fontFamily:FONT,textAlign:'left',
  },
  cardHov:{border:'1px solid rgba(124,92,252,0.3)',background:'rgba(124,92,252,0.07)',transform:'translateY(-1px)',boxShadow:'0 4px 20px rgba(91,63,212,0.15)'},
  av:{
    width:52,height:52,borderRadius:12,flexShrink:0,
    background:'rgba(91,63,212,0.14)',border:'1px solid rgba(124,92,252,0.12)',
    display:'flex',alignItems:'center',justifyContent:'center',
  },
  cname:{fontFamily:FONT,fontSize:15,fontWeight:600,color:'#f2f2ff'},
  cparty:{fontFamily:FONT,fontSize:12,color:'#3e3e58',marginTop:2},
  csel:{fontFamily:FONT,fontSize:11,fontWeight:600,padding:'4px 12px',borderRadius:6,color:'#c4b0fa',background:'rgba(124,92,252,0.1)',border:'1px solid rgba(124,92,252,0.14)',flexShrink:0},
  footer:{
    borderTop:'1px solid rgba(255,255,255,0.05)',
    padding:'14px 32px',background:'rgba(0,0,0,0.2)',flexShrink:0,
  },
  backBtn:{
    display:'flex',alignItems:'center',gap:8,
    background:'none',border:'none',fontFamily:FONT,fontSize:13,fontWeight:500,
    color:'#3e3e58',cursor:'pointer',
  },
}
