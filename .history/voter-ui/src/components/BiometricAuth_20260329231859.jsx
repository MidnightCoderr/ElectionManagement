import { useEffect, useState } from 'react'
import { useVotingStore, ACTIONS } from '../store/votingStore.jsx'
import { t, AUDIO_MSGS, LOCALES } from '../i18n.js'

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
    <div className="auth-wrap">
      <div className="auth-glow"/>
      <div className="auth-badge">
        <div className="auth-badge-shine"/>
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          className="auth-badge-icon">
          <path d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <div className="auth-tag">Identity Verified</div>
      <div className="auth-name">{voter?.name||'Voter'}</div>
      <div className="auth-district">
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{flexShrink:0}}>
          <path d="M7 1C4.79 1 3 2.79 3 5c0 3.25 4 8 4 8s4-4.75 4-8c0-2.21-1.79-4-4-4z"/><circle cx="7" cy="5" r="1.5"/>
        </svg>
        {t('district',locale)}: {voter?.district||''}
      </div>
      <button className="auth-cta" onClick={()=>dispatch({type:ACTIONS.NEXT_STEP})}>
        <span className="auth-cta-text">{t('start_voting',locale)}</span>
        <span className="auth-count-badge">{count}s</span>
        <div className="auth-cta-shine"/>
      </button>
    </div>
  )
}
