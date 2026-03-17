import { useEffect, useState } from 'react'
import { useVotingStore, ACTIONS } from '../store/votingStore.jsx'
import { t, AUDIO_MSGS, LOCALES } from '../i18n.js'

const SERIF = "'DM Serif Display', serif"
const FONT  = "'DM Sans', sans-serif"

export default function BiometricAuth() {
  const { state, dispatch } = useVotingStore()
  const { locale, voter } = state
  const [count, setCount] = useState(5)

  useEffect(() => {
    const id = setInterval(() => setCount(c=>{
      if(c<=1){clearInterval(id);dispatch({type:ACTIONS.NEXT_STEP});return 0}
      return c-1
    }),1000)
    return () => clearInterval(id)
  }, [dispatch])

  useEffect(() => {
    const msg = AUDIO_MSGS[3]?.[locale]||AUDIO_MSGS[3].en
    if(!('speechSynthesis' in window)) return
    const u = new SpeechSynthesisUtterance(msg)
    u.lang=LOCALES.find(l=>l.code===locale)?.lang||'en-IN'; u.rate=0.9
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(u)
    return () => window.speechSynthesis.cancel()
  }, [locale])

  return (
    <div style={s.wrap}>
      <div style={s.glow}/>
      <div style={s.badge}>
        <div style={s.badgeShine}/>
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          style={{width:36,height:36,position:'relative',zIndex:1}}>
          <path d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <div style={s.tag}>Identity Verified</div>
      <div style={s.name}>{voter?.name||'Voter'}</div>
      <div style={s.dist}>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{flexShrink:0}}>
          <path d="M7 1C4.79 1 3 2.79 3 5c0 3.25 4 8 4 8s4-4.75 4-8c0-2.21-1.79-4-4-4z"/><circle cx="7" cy="5" r="1.5"/>
        </svg>
        {t('district',locale)}: {voter?.district||''}
      </div>
      <button style={s.btn} onClick={()=>dispatch({type:ACTIONS.NEXT_STEP})}>
        <span style={{position:'relative',zIndex:1}}>{t('start_voting',locale)}</span>
        <span style={s.countBadge}>{count}s</span>
        <div style={s.btnShine}/>
      </button>
    </div>
  )
}

const s = {
  wrap:{
    flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
    gap:24,padding:'48px 32px',
    background:'#F8FAFC',
    position:'relative',overflow:'hidden',
  },
  glow:{
    position:'absolute',top:'25%',left:'50%',transform:'translate(-50%,-50%)',
    width:'60vw',height:'60vw',maxWidth:500,maxHeight:500,borderRadius:'50%',
    background:'radial-gradient(circle,rgba(79,70,229,0.04) 0%,transparent 70%)',
    pointerEvents:'none',
  },
  badge:{
    width:'clamp(80px,10vw,100px)',height:'clamp(80px,10vw,100px)',
    borderRadius:18,
    background:'linear-gradient(145deg,rgba(21,128,61,0.15),rgba(21,128,61,0.25))',
    display:'flex',alignItems:'center',justifyContent:'center',
    border:'1px solid rgba(21,128,61,0.2)',
    boxShadow:'inset 0 2px 0 rgba(255,255,255,0.5),0 12px 32px rgba(15,23,42,0.08)',
    position:'relative',overflow:'hidden',
  },
  badgeShine:{
    position:'absolute',top:0,left:0,right:0,height:'50%',
    background:'linear-gradient(180deg,rgba(255,255,255,0.4),transparent)',
    borderRadius:'18px 18px 0 0',
  },
  tag:{fontFamily:FONT,fontSize:11,fontWeight:600,color:'#15803D',letterSpacing:'.1em',textTransform:'uppercase'},
  name:{fontFamily:SERIF,fontSize:'clamp(24px,4vw,38px)',fontWeight:400,color:'#0F172A',textAlign:'center'},
  dist:{
    fontFamily:FONT,fontSize:13,color:'#94A3B8',
    background:'#FFFFFF',border:'1px solid #E2E8F0',
    borderRadius:8,padding:'6px 16px',display:'flex',alignItems:'center',gap:6,
  },
  btn:{
    width:'clamp(280px,40vw,480px)',border:'none',borderRadius:14,padding:'16px 24px',
    fontFamily:FONT,fontSize:15,fontWeight:700,color:'#fff',cursor:'pointer',
    background:'#4F46E5',
    boxShadow:'0 4px 16px rgba(79,70,229,0.2)',
    display:'flex',alignItems:'center',justifyContent:'center',gap:12,
    marginTop:8,position:'relative',overflow:'hidden',transition:'background .2s',
  },
  countBadge:{
    background:'rgba(0,0,0,0.15)',borderRadius:7,padding:'3px 10px',fontSize:12,fontWeight:600,
    position:'relative',zIndex:1,
  },
  btnShine:{
    position:'absolute',top:0,left:0,right:0,height:'50%',
    background:'linear-gradient(180deg,rgba(255,255,255,0.09),transparent)',
    borderRadius:'14px 14px 0 0',pointerEvents:'none',
  },
}
