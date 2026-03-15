import { useVotingStore, ACTIONS } from '../store/votingStore.jsx'
import { t } from '../i18n.js'

const SERIF = "'DM Serif Display', serif"
const FONT  = "'DM Sans', sans-serif"

export default function VoteConfirmation() {
  const { state, dispatch } = useVotingStore()
  const { locale, selectedCandidate: c } = state
  if (!c) return null
  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',animation:'fadeSlideUp .4s ease'}}>
      <div style={s.hdr}>{t('confirm', locale)}</div>
      <div style={s.body}>
        <div style={s.card}>
          <div style={s.av}>
            <svg viewBox="0 0 28 28" fill="none" stroke="#9d7dfd" strokeWidth="1.5" strokeLinecap="round" style={{width:30,height:30}}>
              <circle cx="14" cy="9" r="4.5"/><path d="M5 24c0-4.97 4.03-9 9-9s9 4.03 9 9"/>
            </svg>
          </div>
          <div style={s.name}>{c.name}</div>
          <div style={s.party}>{c.party}</div>
        </div>
        <div style={s.actions}>
          <button style={s.confirm} onClick={() => dispatch({ type: ACTIONS.NEXT_STEP })}>
            <div style={s.btnShine}/>
            <span style={{position:'relative',zIndex:1}}>✓ &nbsp;{t('confirm_btn', locale)}</span>
          </button>
          <button style={s.change} onClick={() => dispatch({ type: ACTIONS.GO_TO_STEP, payload: 4 })}>
            {t('change', locale)}
          </button>
        </div>
      </div>
    </div>
  )
}

const s = {
  hdr:     { background:'rgba(6,6,16,.92)',borderBottom:'1px solid rgba(255,255,255,0.05)',padding:'12px 15px',fontFamily:FONT,fontSize:11,fontWeight:600,textAlign:'center',color:'#f2f2ff' },
  body:    { flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,padding:24,background:'linear-gradient(160deg,#04040a,#0a0a16)' },
  card:    { background:'rgba(255,255,255,0.038)',borderRadius:14,padding:22,textAlign:'center',border:'1px solid rgba(124,92,252,0.18)',width:'100%',boxShadow:'inset 0 1px 0 rgba(255,255,255,0.05)' },
  av:      { width:56,height:56,borderRadius:12,background:'rgba(91,63,212,0.14)',border:'1px solid rgba(124,92,252,0.13)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px' },
  name:    { fontFamily:SERIF,fontSize:18,fontWeight:400,color:'#f2f2ff' },
  party:   { fontFamily:FONT,fontSize:11,fontWeight:300,color:'#8a8aaa',marginTop:4 },
  actions: { display:'flex',gap:10,width:'100%' },
  confirm: { flex:1,background:'linear-gradient(135deg,rgba(124,92,252,0.88),rgba(91,63,212,.93))',color:'#fff',border:'1px solid rgba(180,160,255,0.17)',borderRadius:10,padding:'13px 0',fontFamily:FONT,fontSize:11,fontWeight:600,cursor:'pointer',boxShadow:'inset 0 1px 0 rgba(255,255,255,0.17),0 5px 18px rgba(91,63,212,0.38)',minHeight:68,position:'relative',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center' },
  btnShine:{ position:'absolute',top:0,left:0,right:0,height:'50%',background:'linear-gradient(180deg,rgba(255,255,255,0.09),transparent)',borderRadius:'10px 10px 0 0',pointerEvents:'none' },
  change:  { flex:1,background:'rgba(255,255,255,0.04)',color:'#5a5a78',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,padding:'13px 0',fontFamily:FONT,fontSize:11,fontWeight:500,cursor:'pointer',minHeight:68 },
}
