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
    <div style={s.hdr}>
      <div style={s.brand}>
        <div style={s.ico}>
          <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2"
            strokeLinecap="round" style={{width:16,height:16,position:'relative',zIndex:1}}>
            <circle cx="8" cy="8" r="2.5"/>
            <circle cx="8" cy="8" r="5.5" strokeWidth="1.2" opacity=".5"/>
          </svg>
          <div style={s.icoShine}/>
        </div>
        <div>
          <div style={s.brandSub}>Election Commission of India</div>
          <div style={s.brandName}>e-Vote Terminal</div>
        </div>
      </div>
      <div style={s.langs}>
        {LOCALES.slice(0,3).map(loc => (
          <button key={loc.code}
            style={{...s.lpill,...(state.locale===loc.code?s.lpillOn:{})}}
            onClick={() => dispatch({type:ACTIONS.SET_LOCALE,payload:loc.code})}>
            {loc.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function ProgressBar() {
  const { state } = useVotingStore()
  return (
    <div style={s.prog}>
      {Array.from({length:TOTAL_STEPS},(_,i)=>{
        const n=i+1
        return <div key={n} style={{...s.dot,...(n<state.step?s.dotDone:n===state.step?s.dotCur:{})}}/>
      })}
    </div>
  )
}

function ErrorBanner() {
  const { state, dispatch } = useVotingStore()
  if (!state.error) return null
  return (
    <div style={s.err}>
      {state.error}
      <button style={s.errClose} onClick={()=>dispatch({type:ACTIONS.SET_ERROR,payload:null})}>x</button>
    </div>
  )
}

function Shell() {
  return (
    <div style={s.shell}>
      <Header/>
      <ProgressBar/>
      <ErrorBanner/>
      <div style={s.body}><StepRouter/></div>
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

const s = {
  shell:{
    width:'100%',minHeight:'100vh',display:'flex',flexDirection:'column',
    background:'linear-gradient(160deg,#040408 0%,#08081a 100%)',
    fontFamily:"'DM Sans',sans-serif",
  },
  hdr:{
    width:'100%',
    background:'rgba(8,8,20,0.96)',
    backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',
    borderBottom:'1px solid rgba(255,255,255,0.07)',
    padding:'14px 32px',
    display:'flex',alignItems:'center',justifyContent:'space-between',
    flexShrink:0,position:'relative',zIndex:10,
  },
  brand:{display:'flex',alignItems:'center',gap:12},
  ico:{
    width:38,height:38,borderRadius:11,
    background:'linear-gradient(135deg,#7c5cfc,#5b3fd4)',
    display:'flex',alignItems:'center',justifyContent:'center',
    boxShadow:'inset 0 1px 0 rgba(255,255,255,0.22),0 4px 14px rgba(91,63,212,0.5)',
    position:'relative',overflow:'hidden',flexShrink:0,
  },
  icoShine:{
    position:'absolute',top:0,left:0,right:0,height:'50%',
    background:'linear-gradient(180deg,rgba(255,255,255,0.18),transparent)',
    borderRadius:'11px 11px 0 0',
  },
  brandName:{fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:700,color:'#f2f2ff',letterSpacing:'-.01em'},
  brandSub: {fontFamily:"'DM Sans',sans-serif",fontSize:10,color:'#3e3e58',marginBottom:1},
  langs:{display:'flex',gap:6},
  lpill:{
    padding:'5px 12px',borderRadius:7,
    fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:500,
    cursor:'pointer',color:'#3e3e58',
    background:'rgba(255,255,255,0.03)',
    border:'1px solid rgba(255,255,255,0.07)',
    transition:'all .15s',
  },
  lpillOn:{
    background:'linear-gradient(135deg,rgba(124,92,252,0.35),rgba(91,63,212,0.28))',
    borderColor:'rgba(124,92,252,0.35)',color:'#c4b0fa',
    boxShadow:'0 2px 8px rgba(91,63,212,0.2)',
  },
  prog:{
    display:'flex',justifyContent:'center',gap:6,padding:'10px 0',
    background:'rgba(0,0,0,0.25)',borderBottom:'1px solid rgba(255,255,255,0.04)',
    flexShrink:0,
  },
  dot:{width:6,height:6,borderRadius:3,background:'rgba(255,255,255,0.05)',transition:'all .3s'},
  dotDone:{background:'#2e2e42'},
  dotCur:{width:20,borderRadius:4,background:'linear-gradient(90deg,#5b3fd4,#7c5cfc)',boxShadow:'0 0 8px rgba(124,92,252,0.5)'},
  err:{
    background:'rgba(124,92,252,0.1)',borderBottom:'1px solid rgba(124,92,252,0.2)',
    color:'#9d7dfd',padding:'10px 32px',fontSize:13,
    display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,
  },
  errClose:{background:'none',border:'none',color:'#9d7dfd',cursor:'pointer',fontSize:16},
  body:{flex:1,display:'flex',flexDirection:'column',overflow:'auto'},
}
