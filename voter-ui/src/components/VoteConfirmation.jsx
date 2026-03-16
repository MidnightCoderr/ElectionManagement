import { useVotingStore, ACTIONS } from '../store/votingStore.jsx'
import { t } from '../i18n.js'

const SERIF = "'DM Serif Display', serif"
const FONT  = "'DM Sans', sans-serif"

export default function VoteConfirmation() {
  const { state, dispatch } = useVotingStore()
  const { locale, selectedCandidate:c } = state
  if (!c) return null

  return (
    <div style={s.wrap}>
      <div style={s.glow}/>
      <div style={s.card}>
        <div style={s.cardShine}/>
        <div style={s.av}>
          <svg viewBox="0 0 28 28" fill="none" stroke="#9d7dfd" strokeWidth="1.5" strokeLinecap="round" style={{width:38,height:38}}>
            <circle cx="14" cy="9" r="5"/>
            <path d="M4 26c0-5.52 4.48-10 10-10s10 4.48 10 10"/>
          </svg>
        </div>
        <div style={s.confirmLabel}>{t('confirm',locale)}</div>
        <div style={s.name}>{c.name}</div>
        <div style={s.party}>{c.party}</div>
      </div>

      <div style={s.actions}>
        <button style={s.confirmBtn} onClick={()=>dispatch({type:ACTIONS.NEXT_STEP})}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
            <path d="M3 8l4 4 6-6"/>
          </svg>
          <span style={{position:'relative',zIndex:1}}>{t('confirm_btn',locale)}</span>
          <div style={s.btnShine}/>
        </button>
        <button style={s.changeBtn} onClick={()=>dispatch({type:ACTIONS.GO_TO_STEP,payload:4})}>
          {t('change',locale)}
        </button>
      </div>
    </div>
  )
}

const s = {
  wrap:{
    flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
    gap:32,padding:'48px 32px',
    background:'linear-gradient(160deg,#040408,#08081a)',
    position:'relative',overflow:'hidden',
  },
  glow:{
    position:'absolute',top:'30%',left:'50%',transform:'translate(-50%,-50%)',
    width:'60vw',height:'60vw',maxWidth:500,maxHeight:500,borderRadius:'50%',
    background:'radial-gradient(circle,rgba(124,92,252,0.06) 0%,transparent 70%)',
    pointerEvents:'none',
  },
  card:{
    background:'rgba(255,255,255,0.04)',backdropFilter:'blur(16px)',
    border:'1px solid rgba(124,92,252,0.2)',
    borderRadius:18,padding:'36px 48px',
    textAlign:'center',
    boxShadow:'inset 0 1px 0 rgba(255,255,255,0.06),0 16px 40px rgba(0,0,0,.5)',
    width:'clamp(280px,45vw,480px)',
    position:'relative',overflow:'hidden',
  },
  cardShine:{
    position:'absolute',top:0,left:0,right:0,height:'40%',
    background:'linear-gradient(180deg,rgba(255,255,255,0.04),transparent)',
    borderRadius:'18px 18px 0 0',pointerEvents:'none',
  },
  av:{
    width:72,height:72,borderRadius:16,
    background:'rgba(91,63,212,0.14)',border:'1px solid rgba(124,92,252,0.13)',
    display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',
  },
  confirmLabel:{fontFamily:FONT,fontSize:11,fontWeight:600,color:'rgba(157,125,253,0.65)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:8},
  name:{fontFamily:SERIF,fontSize:'clamp(22px,3.5vw,32px)',fontWeight:400,color:'#f2f2ff'},
  party:{fontFamily:FONT,fontSize:14,fontWeight:300,color:'#8a8aaa',marginTop:6},
  actions:{display:'flex',gap:14,width:'clamp(280px,45vw,480px)'},
  confirmBtn:{
    flex:1,background:'linear-gradient(135deg,rgba(124,92,252,0.88),rgba(91,63,212,.93))',
    color:'#fff',border:'1px solid rgba(180,160,255,0.17)',
    borderRadius:14,padding:'18px 0',
    fontFamily:FONT,fontSize:15,fontWeight:700,cursor:'pointer',
    boxShadow:'inset 0 1px 0 rgba(255,255,255,0.17),0 8px 24px rgba(91,63,212,0.38)',
    minHeight:64,position:'relative',overflow:'hidden',
    display:'flex',alignItems:'center',justifyContent:'center',gap:10,
  },
  btnShine:{
    position:'absolute',top:0,left:0,right:0,height:'50%',
    background:'linear-gradient(180deg,rgba(255,255,255,0.09),transparent)',
    borderRadius:'14px 14px 0 0',pointerEvents:'none',
  },
  changeBtn:{
    flex:1,background:'rgba(255,255,255,0.04)',color:'#5a5a78',
    border:'1px solid rgba(255,255,255,0.08)',
    borderRadius:14,padding:'18px 0',
    fontFamily:FONT,fontSize:15,fontWeight:500,cursor:'pointer',minHeight:64,
  },
}
