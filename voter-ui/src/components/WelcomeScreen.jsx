import { useEffect } from 'react'
import { useVotingStore, ACTIONS } from '../store/votingStore.jsx'
import { t, AUDIO_MSGS, LOCALES } from '../i18n.js'
import { authenticateVoter } from '../services/auth.js'

const FONT = "'DM Sans', sans-serif"

export default function BiometricScan() {
  const { state, dispatch } = useVotingStore()
  const { locale } = state

  useEffect(() => {
    const msg = AUDIO_MSGS[2]?.[locale] || AUDIO_MSGS[2].en
    if (!('speechSynthesis' in window)) return
    const u = new SpeechSynthesisUtterance(msg)
    u.lang = LOCALES.find(l=>l.code===locale)?.lang||'en-IN'; u.rate=0.9
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(u)
    return () => window.speechSynthesis.cancel()
  }, [locale])

  useEffect(() => {
    const id = setTimeout(async () => {
      try {
        const voter = await authenticateVoter('mock_fp')
        dispatch({ type:ACTIONS.SET_VOTER, payload:voter })
        dispatch({ type:ACTIONS.NEXT_STEP })
      } catch(err) { dispatch({ type:ACTIONS.SET_ERROR, payload:err.message }) }
    }, 3000)
    return () => clearTimeout(id)
  }, [dispatch])

  return (
    <div style={s.wrap}>
      <div style={s.glow}/>
      <div style={s.tag}>Biometric Authentication</div>

      {/* Scanner shell  larger for full screen */}
      <div style={s.shell}>
        <div style={s.shellShine}/>
        <svg style={s.fpSvg} viewBox="0 0 80 96" fill="none">
          <path d="M40 6C24 6 11 18.5 11 34c0 7.5 2.8 14.4 7.4 19.8" stroke="rgba(79,70,229,0.7)" strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M40 6C56 6 69 18.5 69 34c0 7.5-2.8 14.4-7.4 19.8" stroke="rgba(79,70,229,0.7)" strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M19 56c-3.8-5.8-6-12.8-6-20C13 21.2 25.3 10 40 10s27 11.2 27 26c0 7.2-2.2 14.2-6 20" stroke="rgba(79,70,229,0.55)" strokeWidth="1.9" strokeLinecap="round"/>
          <path d="M23 63c-3-5.2-4.8-11.2-4.8-17.5C18.2 31 28 21 40 21s21.8 10 21.8 24.5c0 6.3-1.8 12.3-4.8 17.5" stroke="rgba(79,70,229,0.45)" strokeWidth="1.7" strokeLinecap="round"/>
          <path d="M27.5 70c-2.2-4.5-3.5-9.6-3.5-15C24 42.5 31.3 34 40 34s16 8.5 16 21c0 5.4-1.3 10.5-3.5 15" stroke="rgba(79,70,229,0.38)" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M32 76c-1.5-3.8-2.4-8-2.4-12.5C29.6 54.5 34.3 47 40 47s10.4 7.5 10.4 16.5c0 4.5-.9 8.7-2.4 12.5" stroke="rgba(79,70,229,0.3)" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M36 82c-.8-3-1.2-6.2-1.2-9.8C34.8 65.8 37 60 40 60s5.2 5.8 5.2 12.2c0 3.6-.4 6.8-1.2 9.8" stroke="rgba(79,70,229,0.22)" strokeWidth="1.1" strokeLinecap="round"/>
          <path d="M38.5 88c-.2-1.8-.4-3.8-.4-6C38.1 77 39 73 40 73s1.9 4 1.9 9c0 2.2-.2 4.2-.4 6" stroke="rgba(79,70,229,0.16)" strokeWidth="1" strokeLinecap="round"/>
          <path d="M21 44 Q26 72 40 84 Q54 72 59 44" stroke="rgba(79,70,229,0.1)" strokeWidth="0.9" strokeLinecap="round"/>
          <path d="M14.5 40 Q18 80 40 92 Q62 80 65.5 40" stroke="rgba(79,70,229,0.07)" strokeWidth="0.8" strokeLinecap="round"/>
        </svg>
        <div style={s.scanBar}/>
        <div style={s.scanGlow}/>
      </div>

      <div style={s.status}>
        <div style={s.sdot}/>
        <span style={{fontFamily:FONT,fontSize:14,fontWeight:500,color:'#4F46E5'}}>
          {t('scanning',locale)}
          <span>
            <span style={s.ell}>.</span>
            <span style={{...s.ell,animationDelay:'.15s'}}>.</span>
            <span style={{...s.ell,animationDelay:'.3s'}}>.</span>
          </span>
        </span>
      </div>
      <div style={s.hint}>Place your finger firmly on the sensor</div>
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
    position:'absolute',top:'30%',left:'50%',transform:'translate(-50%,-50%)',
    width:'60vw',height:'60vw',maxWidth:500,maxHeight:500,borderRadius:'50%',
    background:'radial-gradient(circle,rgba(79,70,229,0.04) 0%,transparent 70%)',
    pointerEvents:'none',
  },
  tag:{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color:'#4F46E5',letterSpacing:'.1em',textTransform:'uppercase'},
  shell:{
    width:'clamp(160px,20vw,220px)',height:'clamp(160px,20vw,220px)',
    borderRadius:20,display:'flex',alignItems:'center',justifyContent:'center',
    position:'relative',overflow:'hidden',
    background:'linear-gradient(145deg,rgba(79,70,229,0.06),rgba(11,31,58,0.04))',
    border:'1px solid rgba(79,70,229,0.15)',
    boxShadow:'inset 0 2px 0 rgba(255,255,255,0.6),inset 0 -2px 0 rgba(15,23,42,0.04),0 16px 40px rgba(15,23,42,0.08)',
  },
  shellShine:{
    position:'absolute',top:0,left:0,right:0,height:'42%',
    background:'linear-gradient(180deg,rgba(255,255,255,0.5),transparent)',
    borderRadius:'20px 20px 0 0',pointerEvents:'none',
  },
  fpSvg:{width:'65%',height:'65%',position:'relative',zIndex:1},
  scanBar:{
    position:'absolute',left:'-5%',right:'-5%',height:2,
    background:'linear-gradient(90deg,transparent,rgba(79,70,229,0.2),rgba(79,70,229,1),rgba(79,70,229,0.2),transparent)',
    animation:'fpscan 2.5s ease-in-out infinite',
    boxShadow:'0 0 12px rgba(79,70,229,0.6),0 0 4px rgba(79,70,229,0.3)',
  },
  scanGlow:{
    position:'absolute',left:'-5%',right:'-5%',height:40,
    background:'linear-gradient(180deg,transparent,rgba(79,70,229,0.05),transparent)',
    animation:'fpscan 2.5s ease-in-out infinite',marginTop:-19,
  },
  status:{display:'flex',alignItems:'center',gap:8},
  sdot:{width:6,height:6,borderRadius:'50%',background:'#4F46E5',animation:'blink 1s infinite'},
  hint:{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:'#94A3B8',textAlign:'center'},
  ell:{display:'inline-block',animation:'ell 1.2s infinite',opacity:0},
}
