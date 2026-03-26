import { useState, useEffect } from 'react'
import { getElections } from '../api/elections.js'
import { getMlHealth } from '../api/ml.js'

/* ─── DATA ─── */
const KPI_DATA = [
  { ico: 'p', stroke: '#4F46E5', label: 'Total Votes', val: '2,847', trend: 'up', trendLabel: '↑ Live',
    svgPath: <><path d="M7 1.5v2M12 7h-2M7 12.5v-2M2 7h2"/><circle cx="7" cy="7" r="2.5"/></> },
  { ico: 'g', stroke: '#475569', label: 'Turnout', val: '67.3%', trend: 'dn', trendLabel: 'of 4,230',
    svgPath: <><circle cx="7" cy="7" r="5"/><path d="M7 4.5V7l2 1"/></> },
  { ico: 'p', stroke: '#4F46E5', label: 'Terminals', val: '12', trend: 'dn', trendLabel: 'of 15',
    svgPath: <><rect x="2" y="3.5" width="10" height="7" rx="1.5"/></> },
  { ico: 'g', stroke: '#475569', label: 'Alerts', val: '2', trend: 'up', trendLabel: '1 Critical',
    svgPath: <><path d="M7 2v2M12 7h-2M7 12v-2M2 7h2"/><circle cx="7" cy="7" r="2"/></> },
]
const DIST_DATA = [
  { label: 'Computer Science', pct: 82 },{ label: 'Electrical Eng.', pct: 75 },{ label: 'Mechanical Eng.', pct: 68 },
  { label: 'Business School', pct: 61 },{ label: 'Civil Eng.', pct: 54 },
]
const ALERT_DATA = [
  { sev:'h', sevLabel:'Critical', msg:'Voting spike detected', det:'TERM-045 · 150 votes / 5 min', time:'14:22' },
  { sev:'m', sevLabel:'Medium',   msg:'Terminal offline',      det:'TERM-012 · 22 min ago',       time:'14:08' },
  { sev:'h', sevLabel:'Critical', msg:'Failed biometrics',     det:'TERM-089 · 12 failed scans',  time:'13:55' },
  { sev:'m', sevLabel:'Medium',   msg:'Low battery warning',   det:'TERM-301 · 8% remaining',     time:'13:41' },
  { sev:'m', sevLabel:'Medium',   msg:'Network latency high',  det:'TERM-156 · 450ms response',   time:'13:30' },
  { sev:'h', sevLabel:'Critical', msg:'Duplicate vote attempt', det:'TERM-078 · Voter ID matched', time:'13:12' },
]
const REALTIME_FEED = [
  { time:'14:23:05', type:'VOTE',  terminal:'TERM-045', msg:'Vote cast — Candidate #3' },
  { time:'14:22:58', type:'AUTH',  terminal:'TERM-089', msg:'Biometric authenticated — Voter #12,456' },
  { time:'14:22:51', type:'VOTE',  terminal:'TERM-022', msg:'Vote cast — Candidate #1' },
  { time:'14:22:44', type:'AUTH',  terminal:'TERM-156', msg:'Biometric authenticated — Voter #12,457' },
  { time:'14:22:38', type:'ALERT', terminal:'TERM-301', msg:'Low battery detected (8%)' },
  { time:'14:22:30', type:'VOTE',  terminal:'TERM-045', msg:'Vote cast — Candidate #2' },
  { time:'14:22:25', type:'AUTH',  terminal:'TERM-078', msg:'Biometric authenticated — Voter #12,458' },
  { time:'14:22:18', type:'VOTE',  terminal:'TERM-022', msg:'Vote cast — Candidate #1' },
]
const AUDIT_LOG = [
  { time:'14:23:05', event:'VOTE_CAST',     user:'System',      desc:'Vote cast by Voter #12,456 on TERM-045',  txHash:'0x7a3f…e9c2' },
  { time:'14:22:58', event:'AUTH_SUCCESS',   user:'System',      desc:'Biometric auth: Voter #12,456',          txHash:'0x8b4e…f1d3' },
  { time:'14:22:30', event:'VOTE_CAST',      user:'System',      desc:'Vote cast by Voter #12,455 on TERM-045', txHash:'0x6c2d…a8b1' },
  { time:'14:21:15', event:'TERMINAL_OFFLINE',user:'TERM-012',   desc:'Terminal went offline (connectivity)',    txHash:'—' },
  { time:'14:20:00', event:'ALERT_RAISED',   user:'System',      desc:'Voting spike alert on TERM-045',         txHash:'0x5d1c…b7a0' },
  { time:'14:18:30', event:'AUTH_FAILED',    user:'TERM-089',    desc:'Biometric auth failed: Voter #12,449',   txHash:'—' },
]
const TERMINAL_DATA = [
  { id:'TERM-001', loc:'CS Building - Lab A', status:'online', votes:342, battery:92 },
  { id:'TERM-012', loc:'EE Building - Room 201', status:'offline',votes:0,   battery:45 },
  { id:'TERM-022', loc:'Library Foyer',  status:'online', votes:289, battery:78 },
  { id:'TERM-045', loc:'Student Center',    status:'online', votes:512, battery:85 },
  { id:'TERM-078', loc:'Mech Building',   status:'online', votes:198, battery:91 },
  { id:'TERM-089', loc:'Business School',      status:'warn',   votes:267, battery:34 },
  { id:'TERM-156', loc:'Admin Block',    status:'online', votes:334, battery:88 },
  { id:'TERM-301', loc:'Sports Complex',      status:'warn',   votes:145, battery:8  },
]

const NAV_ITEMS = [
  { id:'overview',  section:'Monitor', label:'Overview',  icon:<><rect x="1" y="8" width="3" height="4" rx=".8"/><rect x="5.5" y="5" width="3" height="7" rx=".8"/><rect x="10" y="2" width="3" height="10" rx=".8"/></> },
  { id:'realtime',  section:'Monitor', label:'Real-Time', icon:<><circle cx="7" cy="7" r="5"/><path d="M7 4.5V7l1.5 1.5"/></> },
  { id:'alerts',    section:'Monitor', label:'Alerts',    icon:<><path d="M7 2v2M12 7h-2M7 12v-2M2 7h2"/><circle cx="7" cy="7" r="2"/></>, badge:'5' },
]



/* ─── VIEW: Overview ─── */
function OverviewView() {
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)

  const [mlHealth, setMlHealth] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const r = await getElections({ limit: 10 })
        setElections(r.elections || [])
      } catch {}
      setLoading(false)
    }
    async function loadMl() {
      try { const r = await getMlHealth(); setMlHealth(r) } catch { setMlHealth({ status: 'offline' }) }
    }
    load(); loadMl()
    const interval = setInterval(load, 30000)
    const mlInterval = setInterval(loadMl, 60000)
    return () => { clearInterval(interval); clearInterval(mlInterval) }
  }, [])

  const active    = elections.filter(e => e.status === 'active')
  const totalVotes= elections.reduce((s, e) => s + (e.total_votes_cast || 0), 0)
  const totalVoters = elections.reduce((s, e) => s + (e.total_voters || 0), 0)
  const turnout   = totalVoters > 0 ? ((totalVotes / totalVoters) * 100).toFixed(1) + '%' : '—'

  const kpis = [
    { ico:'p', stroke:'#4F46E5', label:'Total Votes',  val: loading ? '…' : totalVotes.toLocaleString(), trendLabel:'Live', trend:'up', svgPath:<><path d="M7 1.5v2M12 7h-2M7 12.5v-2M2 7h2"/><circle cx="7" cy="7" r="2.5"/></> },
    { ico:'g', stroke:'#475569', label:'Turnout',      val: loading ? '…' : turnout, trendLabel:`of ${totalVoters.toLocaleString()}`, trend:'dn', svgPath:<><circle cx="7" cy="7" r="5"/><path d="M7 4.5V7l2 1"/></> },
    { ico:'p', stroke:'#4F46E5', label:'Active Elections', val: loading ? '…' : String(active.length), trendLabel:'running', trend:'up', svgPath:<><rect x="2" y="3.5" width="10" height="7" rx="1.5"/></> },
    { ico:'g', stroke:'#475569', label:'Total Elections', val: loading ? '…' : String(elections.length), trendLabel:'configured', trend:'up', svgPath:<><path d="M7 2v2M12 7h-2M7 12v-2M2 7h2"/><circle cx="7" cy="7" r="2"/></> },
  ]

  return <>
    <div className="obs-toprow">
      <div>
        <div className="obs-title">Overview</div>
        <div className="obs-sub">{active[0]?.election_name || 'Election Dashboard'} · Live feed</div>
      </div>
      <div className="obs-tbrow">
        <button className="tbtn"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 2v8M2 6h8"/></svg> Export</button>
        <button className="tbtn p" onClick={()=>{setLoading(true);getElections({limit:10}).then(r=>setElections(r.elections||[])).finally(()=>setLoading(false))}}>Refresh</button>
      </div>
    </div>
    <div className="kpi-row">
      {kpis.map((k, i) => (
        <div key={i} className="kpi">
          <div className={`kpi-ico ${k.ico}`}><svg viewBox="0 0 14 14" fill="none" stroke={k.stroke} strokeWidth="1.6" strokeLinecap="round">{k.svgPath}</svg></div>
          <div className="kpi-lbl">{k.label}</div>
          <div className="kpi-val">{k.val}</div>
          <div className={`kpi-tr ${k.trend}`}>{k.trendLabel}</div>
        </div>
      ))}
    </div>
    <div className="two-col">
      <div className="panel">
        <div className="ph"><div className="pt"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="7" width="2.5" height="4" rx=".5"/><rect x="4.75" y="4.5" width="2.5" height="6.5" rx=".5"/><rect x="8.5" y="2" width="2.5" height="9" rx=".5"/></svg> Turnout by Dept</div><button className="pa">All</button></div>
        {DIST_DATA.map(d => (<div key={d.label} className="dr"><span className="dl">{d.label}</span><div className="dt"><div className="df" style={{width:`${d.pct}%`}}></div></div><span className="dv">{d.pct}%</span></div>))}
      </div>
      <div className="panel">
        <div className="ph"><div className="pt"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width="13" height="13"><path d="M6 1.5v2M10.5 6h-2M6 10.5v-2M1.5 6h2"/><circle cx="6" cy="6" r="2.2"/></svg> Recent Alerts</div><button className="pa">All</button></div>
        {ALERT_DATA.slice(0,4).map((a, i) => (<div key={i} className="ar"><span className={`asev ${a.sev}`}>{a.sevLabel}</span><div><div className="amsg">{a.msg}</div><div className="adet">{a.det}</div></div></div>))}
      </div>
    </div>
    {/* ML Fraud Detection Widget */}
    <div className="panel" style={{marginTop:12,padding:13,display:'flex',alignItems:'center',gap:12}}>
      <div style={{width:34,height:34,borderRadius:9,flexShrink:0,background:mlHealth?.status==='healthy'?'rgba(21,128,61,0.1)':'rgba(185,28,28,0.08)',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <svg viewBox="0 0 16 16" fill="none" stroke={mlHealth?.status==='healthy'?'#166534':'#991b1b'} strokeWidth="1.5" strokeLinecap="round" width="17" height="17"><circle cx="8" cy="8" r="6"/><path d="M5 8h2l1.5-3 2 6 1.5-3H14"/></svg>
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:11,fontWeight:700,color:'var(--text)'}}>ML Fraud Detection Engine</div>
        <div style={{fontSize:10,color:'var(--text3)',marginTop:2}}>{
          mlHealth===null?'Checking status…':mlHealth.status==='healthy'?`Online · v${mlHealth.version||'1.0.0'} · Anomaly threshold: 85%`:'ML service offline — start with: python ml-service/api.py'
        }</div>
      </div>
      <span style={{padding:'3px 10px',borderRadius:99,fontSize:9,fontWeight:700,background:mlHealth?.status==='healthy'?'rgba(21,128,61,0.08)':'rgba(185,28,28,0.08)',color:mlHealth?.status==='healthy'?'var(--success)':'var(--error)'}}>
        {mlHealth?.status==='healthy'?'ONLINE':'OFFLINE'}
      </span>
    </div>
  </>
}

/* ─── VIEW: Real-Time ─── */
function RealTimeView() {
  return <>
    <div className="obs-toprow"><div><div className="obs-title">Real-Time Feed</div><div className="obs-sub">Live election event stream</div></div>
      <div className="obs-tbrow"><button className="tbtn p"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{width:11,height:11}}><circle cx="6" cy="6" r="4"/><path d="M6 4v2l1.5 1"/></svg> Live</button></div>
    </div>
    <div className="panel">
      <table className="audit-table" style={{width:'100%'}}>
        <thead><tr><th>Time</th><th>Type</th><th>Terminal</th><th>Event</th></tr></thead>
        <tbody>
          {REALTIME_FEED.map((r,i)=>(
            <tr key={i}>
              <td style={{fontFamily:'monospace',fontSize:11,color:'var(--text3)'}}>{r.time}</td>
              <td><span className={`ev-badge ${r.type==='VOTE'?'ev-vote':r.type==='AUTH'?'ev-auth':'ev-alert'}`}>{r.type}</span></td>
              <td style={{fontFamily:'monospace',fontSize:11}}>{r.terminal}</td>
              <td>{r.msg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="kpi-row" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
      <div className="kpi"><div className="kpi-lbl">Events / min</div><div className="kpi-val">24</div><div className="kpi-tr up">↑ 12%</div></div>
      <div className="kpi"><div className="kpi-lbl">Avg Response</div><div className="kpi-val">120ms</div><div className="kpi-tr up">Healthy</div></div>
      <div className="kpi"><div className="kpi-lbl">Queue Depth</div><div className="kpi-val">3</div><div className="kpi-tr dn">↑ from 0</div></div>
    </div>
  </>
}

/* ─── VIEW: Alerts ─── */
function AlertsView() {
  return <>
    <div className="obs-toprow"><div><div className="obs-title">Alerts</div><div className="obs-sub">Active alerts & anomaly detection</div></div>
      <div className="obs-tbrow"><button className="tbtn">Filter</button><button className="tbtn p">Acknowledge All</button></div>
    </div>
    <div className="kpi-row" style={{gridTemplateColumns:'repeat(3,1fr)',marginBottom:8}}>
      <div className="kpi"><div className="kpi-lbl">Critical</div><div className="kpi-val" style={{color:'var(--error)'}}>3</div></div>
      <div className="kpi"><div className="kpi-lbl">Medium</div><div className="kpi-val" style={{color:'var(--warning)'}}>3</div></div>
      <div className="kpi"><div className="kpi-lbl">Resolved (24h)</div><div className="kpi-val" style={{color:'var(--success)'}}>12</div></div>
    </div>
    {ALERT_DATA.map((a,i)=>(
      <div key={i} className="panel" style={{marginBottom:10,padding:16}}>
        <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
          <span className={`asev ${a.sev}`}>{a.sevLabel}</span>
          <div style={{flex:1}}>
            <div className="amsg">{a.msg}</div>
            <div className="adet">{a.det}</div>
            <div style={{display:'flex',gap:6,marginTop:8}}>
              <button className="tbtn" style={{padding:'4px 12px',fontSize:10}}>Acknowledge</button>
              <button className="tbtn" style={{padding:'4px 12px',fontSize:10}}>Investigate</button>
            </div>
          </div>
          <span style={{fontFamily:'monospace',fontSize:10,color:'var(--text3)'}}>{a.time}</span>
        </div>
      </div>
    ))}
  </>
}

/* ─── VIEW: Audit Log ─── */
function AuditLogView() {
  return <>
    <div className="obs-toprow"><div><div className="obs-title">Audit Log</div><div className="obs-sub">Immutable blockchain-verified event log</div></div>
      <div className="obs-tbrow"><button className="tbtn">Filter</button><button className="tbtn p">Export CSV</button></div>
    </div>
    <div className="panel">
      <table className="audit-table">
        <thead><tr><th>Time</th><th>Event</th><th>Source</th><th>Description</th><th>TX Hash</th></tr></thead>
        <tbody>
          {AUDIT_LOG.map((r,i)=>(
            <tr key={i}>
              <td style={{fontFamily:'monospace',fontSize:10,color:'var(--text3)'}}>{r.time}</td>
              <td><span className={`ev-badge ${r.event.includes('VOTE')?'ev-vote':r.event.includes('AUTH')?'ev-auth':'ev-alert'}`}>{r.event}</span></td>
              <td style={{fontSize:11}}>{r.user}</td>
              <td>{r.desc}</td>
              <td style={{fontFamily:'monospace',fontSize:10,color:'var(--text3)'}}>{r.txHash}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12,paddingTop:10,borderTop:'1px solid var(--border)'}}>
        <span style={{fontSize:11,color:'var(--text3)'}}>Showing 6 of 1,204 events</span>
        <div style={{display:'flex',gap:4}}>
          <button className="tbtn" style={{padding:'4px 10px',fontSize:10}}>← Previous</button>
          <button className="tbtn" style={{padding:'4px 10px',fontSize:10}}>Next →</button>
        </div>
      </div>
    </div>
  </>
}

/* ─── VIEW: Verify ─── */
function VerifyView() {
  const [hash, setHash] = useState('')
  return <>
    <div className="obs-toprow"><div><div className="obs-title">Verify Vote</div><div className="obs-sub">Verify a vote receipt against the blockchain</div></div></div>
    <div className="panel" style={{maxWidth:520}}>
      <div style={{fontSize:10,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>Receipt Hash</div>
      <input className="fi" style={{marginBottom:12,fontSize:13}} placeholder="Enter receipt hash or scan QR code..." value={hash} onChange={e=>setHash(e.target.value)} />
      <div style={{height:64,border:'1px dashed rgba(79,70,229,0.3)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',gap:8,color:'var(--text3)',fontSize:13,marginBottom:12,background:'var(--bg3)'}}>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{width:16,height:16}}><rect x="2" y="2" width="4" height="4" rx="1"/><rect x="10" y="2" width="4" height="4" rx="1"/><rect x="2" y="10" width="4" height="4" rx="1"/><rect x="10" y="10" width="4" height="4" rx="1"/></svg>
        Scan QR Code
      </div>
      <button className="tbtn p" style={{width:'100%',justifyContent:'center',padding:'12px 0'}}>Verify on Blockchain</button>
      {hash && <div className="panel" style={{marginTop:16,background:'rgba(79,70,229,0.04)',border:'1px solid rgba(79,70,229,0.15)'}}>
        <div style={{fontFamily:'var(--serif)',fontSize:14,fontWeight:400,color:'var(--p2)',marginBottom:10}}>✓ Vote Verified</div>
        {[['Status','Confirmed on blockchain'],['Block','#14,892'],['Timestamp','Mar 17, 2026 14:23:05 IST'],['Terminal','TERM-045']].map(([l,v])=>(
          <div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:11,padding:'4px 0',borderBottom:'1px solid var(--border)'}}>
            <span style={{color:'var(--text3)'}}>{l}</span><span style={{fontFamily:'monospace',color:'var(--text)',fontSize:10}}>{v}</span>
          </div>
        ))}
      </div>}
    </div>
  </>
}

/* ─── VIEW: Terminals ─── */
function TerminalsView() {
  return <>
    <div className="obs-toprow"><div><div className="obs-title">Terminals</div><div className="obs-sub">Voting terminal status & management</div></div>
      <div className="obs-tbrow"><button className="tbtn">Filter</button><button className="tbtn p">Refresh All</button></div>
    </div>
    <div className="kpi-row" style={{gridTemplateColumns:'repeat(4,1fr)',marginBottom:8}}>
      <div className="kpi"><div className="kpi-lbl">Online</div><div className="kpi-val" style={{color:'var(--success)'}}>10</div></div>
      <div className="kpi"><div className="kpi-lbl">Warning</div><div className="kpi-val" style={{color:'var(--warning)'}}>2</div></div>
      <div className="kpi"><div className="kpi-lbl">Offline</div><div className="kpi-val" style={{color:'var(--error)'}}>1</div></div>
      <div className="kpi"><div className="kpi-lbl">Uptime</div><div className="kpi-val">99.7%</div></div>
    </div>
    <div className="panel">
      <table className="audit-table">
        <thead><tr><th>Terminal ID</th><th>Location</th><th>Status</th><th>Votes Cast</th><th>Battery</th></tr></thead>
        <tbody>
          {TERMINAL_DATA.map(t=>(
            <tr key={t.id}>
              <td style={{fontFamily:'monospace',fontWeight:600}}>{t.id}</td>
              <td>{t.loc}</td>
              <td><span style={{padding:'2px 8px',borderRadius:99,fontSize:9,fontWeight:700, background:t.status==='online'?'rgba(21,128,61,0.08)':t.status==='warn'?'rgba(217,119,6,0.08)':'rgba(185,28,28,0.08)', color:t.status==='online'?'var(--success)':t.status==='warn'?'var(--warning)':'var(--error)'}}>{t.status.toUpperCase()}</span></td>
              <td>{t.votes.toLocaleString()}</td>
              <td>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <div style={{flex:1,height:3,borderRadius:99,background:'var(--g1)',overflow:'hidden'}}><div style={{height:'100%',borderRadius:99,width:`${t.battery}%`,background:t.battery>50?'var(--success)':t.battery>20?'var(--warning)':'var(--error)'}}></div></div>
                  <span style={{fontSize:10,color:'var(--text3)',width:28}}>{t.battery}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
}

/* ─── MAIN ─── */
export default function ObserverPage() {
  const [tab, setTab] = useState('overview')
  const sections = [...new Set(NAV_ITEMS.map(n=>n.section))]

  return (
    <div className="view on" id="v-obs" style={{flex:1,overflow:'hidden'}}>
      <div className="obs-shell">
        <div className="obs-sb">
          <div className="obs-sb-hdr">
            <div className="obs-sb-ico"><svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><circle cx="8" cy="8" r="2.5"/><circle cx="8" cy="8" r="5.5" strokeWidth="1.2" opacity=".5"/></svg></div>
            <div><div className="obs-sb-sub">Student Election Board</div><div className="obs-sb-name">Observer</div></div>
          </div>
          {sections.map(sec => (
            <div key={sec}>
              <div className="obs-sec">{sec}</div>
              {NAV_ITEMS.filter(n=>n.section===sec).map(n => (
                <div key={n.id} className={`obs-nav${tab===n.id?' on':''}`} onClick={()=>setTab(n.id)} style={{cursor:'pointer'}}>
                  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">{n.icon}</svg>
                  {n.label}
                  {n.badge && <span className="obs-nb">{n.badge}</span>}
                </div>
              ))}
            </div>
          ))}
          <div className="obs-user">
            <div className="obs-av">PM</div>
            <div><div className="obs-uname">Priya Mehta</div><div className="obs-urole">Observer</div></div>
          </div>
        </div>
        <div className="obs-main">
          {tab==='overview'  && <OverviewView />}
          {tab==='realtime'  && <RealTimeView />}
          {tab==='alerts'    && <AlertsView />}
        </div>
      </div>
    </div>
  )
}
