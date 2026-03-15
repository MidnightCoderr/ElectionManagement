import { useEffect } from 'react'
import { useVotingStore, ACTIONS } from '../store/votingStore.jsx'
import { LOCALES, t, AUDIO_MSGS } from '../i18n.js'

const FONT = "'DM Sans', sans-serif"
const SERIF = "'DM Serif Display', serif"

export default function WelcomeScreen() {
  const { state, dispatch } = useVotingStore()
  const { locale } = state
  useEffect(() => { const id = setTimeout(() => dispatch({ type: ACTIONS.NEXT_STEP }), 5000); return () => clearTimeout(id) }, [dispatch])
  useEffect(() => {
    const msg = AUDIO_MSGS[1]?.[locale] || AUDIO_MSGS[1].en
    if (!('speechSynthesis' in window)) return
    const u = new SpeechSynthesisUtterance(msg)
    u.lang = LOCALES.find(l => l.code === locale)?.lang || 'en-IN'; u.rate = 0.9
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(u)
    return () => window.speechSynthesis.cancel()
  }, [locale])

  return (
    <div style={s.wrap}>
      <div style={s.glow}/>
      <div style={s.flagStripe}/>
      <div style={s.langRow}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="rgba(157,125,253,0.6)" strokeWidth="1.5" strokeLinecap="round"><path d="M8 2v2M14 8h-2M8 14v-2M2 8h2"/><circle cx="8" cy="8" r="3"/></svg>
        {LOCALES.map(loc => (
          <button key={loc.code} style={{ ...s.langBtn, ...(locale===loc.code ? s.langBtnOn : {}) }}
            onClick={() => dispatch({ type: ACTIONS.SET_LOCALE, payload: loc.code })}>
            {loc.label}
          </button>
        ))}
      </div>
      <div style={s.fpIcon}>
        <svg width="52" height="52" viewBox="0 0 80 96" fill="none">
          <path d="M40 6C24 6 11 18.5 11 34c0 7.5 2.8 14.4 7.4 19.8" stroke="rgba(157,125,253,0.5)" strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M40 6C56 6 69 18.5 69 34c0 7.5-2.8 14.4-7.4 19.8" stroke="rgba(157,125,253,0.5)" strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M19 56c-3.8-5.8-6-12.8-6-20C13 21.2 25.3 10 40 10s27 11.2 27 26" stroke="rgba(157,125,253,0.4)" strokeWidth="1.9" strokeLinecap="round"/>
          <path d="M27.5 70c-2.2-4.5-3.5-9.6-3.5-15C24 42.5 31.3 34 40 34s16 8.5 16 21c0 5.4-1.3 10.5-3.5 15" stroke="rgba(157,125,253,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <h1 style={s.title}>{t('welcome', locale)}</h1>
      <p style={s.sub}>{t('place_finger', locale)}</p>
      <div style={s.hint}>Auto-advancing in 5s…</div>
    </div>
  )
}

const s = {
  wrap: { flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,padding:'32px 24px',background:'linear-gradient(160deg,#04040a,#0a0a16)',position:'relative',overflow:'hidden',animation:'fadeSlideUp .4s ease' },
  glow: { position:'absolute',top:-60,left:'50%',transform:'translateX(-50%)',width:280,height:280,borderRadius:'50%',background:'radial-gradient(circle,rgba(124,92,252,0.1) 0%,transparent 70%)',pointerEvents:'none' },
  flagStripe: { width:'100%',height:3,background:'linear-gradient(90deg,#ff6b2b 33.3%,rgba(255,255,255,0.1) 33.3% 66.6%,#22d47a 66.6%)',borderRadius:2 },
  langRow: { display:'flex',alignItems:'center',gap:5,flexWrap:'wrap',justifyContent:'center',background:'rgba(255,255,255,0.04)',borderRadius:99,padding:'7px 12px',border:'1px solid rgba(255,255,255,0.07)' },
  langBtn: { padding:'3px 8px',borderRadius:5,fontFamily:FONT,fontSize:9,fontWeight:500,cursor:'pointer',color:'#3e3e58',background:'transparent',border:'1px solid transparent',transition:'all .15s' },
  langBtnOn: { background:'linear-gradient(135deg,rgba(124,92,252,0.38),rgba(91,63,212,0.3))',borderColor:'rgba(124,92,252,0.32)',color:'#c4b0fa' },
  fpIcon: { opacity:.6 },
  title: { fontFamily:SERIF,fontSize:26,fontWeight:400,color:'#f2f2ff',textAlign:'center',lineHeight:1.2 },
  sub:   { fontFamily:FONT,fontSize:13,fontWeight:300,color:'#8a8aaa',textAlign:'center' },
  hint:  { fontFamily:FONT,fontSize:10,color:'#3e3e58' },
}
