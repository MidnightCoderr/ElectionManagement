import { VotingProvider, useVotingStore, ACTIONS } from './store/votingStore.jsx'
import { LOCALES, t } from './i18n.js'
import WelcomeScreen     from './components/WelcomeScreen.jsx'
import BiometricScan     from './components/BiometricScan.jsx'
import BiometricAuth     from './components/BiometricAuth.jsx'
import CandidateSelector from './components/CandidateSelector.jsx'
import VoteConfirmation  from './components/VoteConfirmation.jsx'
import VoteReceipt       from './components/VoteReceipt.jsx'

const TOTAL_STEPS = 7

function StepRouter() {
  const { state } = useVotingStore()
  switch (state.step) {
    case 1: return <WelcomeScreen />
    case 2: return <BiometricScan />
    case 3: return <BiometricAuth />
    case 4: return <CandidateSelector />
    case 5: return <VoteConfirmation />
    case 6: case 7: return <VoteReceipt />
    default: return <WelcomeScreen />
  }
}

function ProgressDots() {
  const { state } = useVotingStore()
  return (
    <div style={s.prog}>
      {Array.from({ length: TOTAL_STEPS }, (_, i) => {
        const n = i + 1
        return <div key={n} style={{ ...s.dot, ...(n < state.step ? s.dotD : n === state.step ? s.dotC : {}) }} />
      })}
    </div>
  )
}

function DeviceHeader() {
  const { state, dispatch } = useVotingStore()
  return (
    <div style={s.hdr}>
      <div style={s.brand}>
        <div style={s.ico}>
          <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" style={{width:14,height:14,position:'relative',zIndex:1}}>
            <circle cx="8" cy="8" r="2.5"/><circle cx="8" cy="8" r="5.5" strokeWidth="1.2" opacity=".5"/>
          </svg>
          <div style={s.icoShine}/>
        </div>
        <div>
          <div style={s.sub}>Election Commission of India</div>
          <div style={s.name}>e-Vote Terminal</div>
        </div>
      </div>
      <div style={s.langs}>
        {LOCALES.slice(0,3).map(loc => (
          <button key={loc.code} style={{ ...s.lpill, ...(state.locale===loc.code ? s.lpillOn : {}) }}
            onClick={() => dispatch({ type: ACTIONS.SET_LOCALE, payload: loc.code })}>
            {loc.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function ErrorBanner() {
  const { state, dispatch } = useVotingStore()
  if (!state.error) return null
  return (
    <div style={s.err}>
      ⚠ {state.error}
      <button style={s.errClose} onClick={() => dispatch({ type: ACTIONS.SET_ERROR, payload: null })}>✕</button>
    </div>
  )
}

function Shell() {
  return (
    <>
      <DeviceHeader />
      <ProgressDots />
      <ErrorBanner />
      <div style={{ minHeight: 330, display: 'flex', flexDirection: 'column' }}>
        <StepRouter />
      </div>
    </>
  )
}

export default function App() {
  return (
    <VotingProvider>
      <div style={s.device}>
        <Shell />
      </div>
    </VotingProvider>
  )
}

const s = {
  device: {
    width: 320, maxWidth: '100%',
    borderRadius: 24, overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(10,10,20,0.97)',
    boxShadow: '0 0 0 1px rgba(124,92,252,0.05), 0 48px 96px rgba(0,0,0,.95), inset 0 1px 0 rgba(255,255,255,0.07)',
    fontFamily: "'DM Sans', sans-serif",
    margin: '0 auto',
  },
  hdr: {
    background: 'linear-gradient(175deg,#0d0d1c,#090914)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
  },
  brand: { display: 'flex', alignItems: 'center', gap: 9 },
  ico: {
    width: 30, height: 30, borderRadius: 9,
    background: 'linear-gradient(135deg,#7c5cfc,#5b3fd4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 3px 10px rgba(91,63,212,0.5)',
    position: 'relative', overflow: 'hidden',
  },
  icoShine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
    background: 'linear-gradient(180deg,rgba(255,255,255,0.16),transparent)',
    borderRadius: '9px 9px 0 0',
  },
  name:  { fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 600, color: '#f2f2ff' },
  sub:   { fontFamily: "'DM Sans',sans-serif", fontSize: 8, color: '#3e3e58' },
  langs: { display: 'flex', gap: 4 },
  lpill: {
    padding: '3px 8px', borderRadius: 5, fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 500,
    cursor: 'pointer', color: '#3e3e58', background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)', transition: 'all .15s',
  },
  lpillOn: {
    background: 'linear-gradient(135deg,rgba(124,92,252,0.38),rgba(91,63,212,0.3))',
    borderColor: 'rgba(124,92,252,0.32)', color: '#c4b0fa',
  },
  prog: {
    display: 'flex', justifyContent: 'center', gap: 5, padding: 8,
    background: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  dot:  { width: 5, height: 5, borderRadius: 2, background: 'rgba(255,255,255,0.05)', transition: 'all .3s' },
  dotD: { background: '#2e2e42' },
  dotC: { width: 16, background: 'linear-gradient(90deg,#5b3fd4,#7c5cfc)', boxShadow: '0 0 6px rgba(124,92,252,0.4)' },
  err:  { background: 'rgba(124,92,252,0.1)', borderBottom: '1px solid rgba(124,92,252,0.2)', color: '#9d7dfd', padding: '10px 16px', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  errClose: { background: 'none', border: 'none', color: '#9d7dfd', cursor: 'pointer', fontSize: 15 },
}
