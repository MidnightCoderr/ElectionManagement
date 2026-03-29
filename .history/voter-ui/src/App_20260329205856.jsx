import { VotingProvider, useVotingStore, ACTIONS } from './store/votingStore.jsx'
import { LOCALES, t } from './i18n.js'
import WelcomeScreen     from './components/WelcomeScreen.jsx'
import BiometricScan     from './components/BiometricScan.jsx'
import BiometricAuth     from './components/BiometricAuth.jsx'
import CandidateSelector from './components/CandidateSelector.jsx'
import VoteConfirmation  from './components/VoteConfirmation.jsx'
import VoteReceipt       from './components/VoteReceipt.jsx'
import './index.css'

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

function Header() {
  const { state, dispatch } = useVotingStore()
  return (
    <header className="terminal-header">
      <div className="terminal-brand">
        <div className="terminal-icon-wrap">
          <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2"
            strokeLinecap="round" className="terminal-icon">
            <circle cx="8" cy="8" r="2.5"/>
            <circle cx="8" cy="8" r="5.5" strokeWidth="1.2" opacity=".5"/>
          </svg>
          <div className="terminal-icon-shine"/>
        </div>
        <div>
          <div className="terminal-brand-sub">Student Election Commission</div>
          <div className="terminal-brand-name">CampusVote Terminal</div>
        </div>
      </div>
      <div className="terminal-langs">
        {LOCALES.slice(0,3).map(loc => (
          <button key={loc.code}
            className={`terminal-lang-pill ${state.locale === loc.code ? 'is-active' : ''}`}
            onClick={() => dispatch({type:ACTIONS.SET_LOCALE,payload:loc.code})}>
            {loc.label}
          </button>
        ))}
      </div>
    </header>
  )
}

function ProgressBar() {
  const { state } = useVotingStore()
  return (
    <div className="terminal-progress">
      {Array.from({length:TOTAL_STEPS},(_,i)=>{
        const n=i+1
        const cls = n < state.step ? 'is-done' : n === state.step ? 'is-current' : ''
        return <div key={n} className={`terminal-progress-dot ${cls}`}/>
      })}
    </div>
  )
}

function ErrorBanner() {
  const { state, dispatch } = useVotingStore()
  if (!state.error) return null
  return (
    <div className="terminal-error">
      {state.error}
      <button className="terminal-error-close" onClick={()=>dispatch({type:ACTIONS.SET_ERROR,payload:null})}>x</button>
    </div>
  )
}

function Shell() {
  return (
    <div className="terminal-shell">
      <Header/>
      <ProgressBar/>
      <ErrorBanner/>
      <div className="terminal-body"><StepRouter/></div>
    </div>
  )
}

export default function App() {
  return (
    <VotingProvider>
      <Shell/>
    </VotingProvider>
  )
}
