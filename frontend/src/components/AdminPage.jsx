import { useState } from 'react'

const Chev = () => (<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3.5 2l3 3-3 3"/></svg>)

/* ─── DATA ─── */
const ASSETS = [
  { name:'Computer Science', rate:'82.4', trend:'up', trendLabel:'5.2% above avg', gradId:'g1', gradStart:'#0B1F3A', gradEnd:'#4F46E5', path:'M0 36 C20 31,40 24,60 20 S100 15,120 13 S160 9,200 6', upPath:'M5 8V2M2 5l3-3 3 3' },
  { name:'Electrical Eng.',   rate:'75.1', trend:'dn', trendLabel:'1.3% below avg', gradId:'g2', gradStart:'#CBD5E1', gradEnd:'#475569', path:'M0 18 C20 21,40 28,60 30 S100 32,120 28 S160 24,200 30', upPath:'M5 2v6M2 5l3 3 3-3' },
  { name:'Mechanical Eng.',   rate:'68.3', trend:'up', trendLabel:'2.1% above avg', gradId:'g3', gradStart:'#4F46E5', gradEnd:'#1B3B6F', path:'M0 40 C30 35,50 28,80 22 S120 17,150 12 S180 9,200 6', upPath:'M5 8V2M2 5l3-3 3 3' },
]
const STATS = [
  { label:'Momentum', val:'0.82%' },{ label:'Blockchain Blocks', val:'892' },
  { label:'Active Terminals', val:'80.0%' },{ label:'Fraud Alerts', val:'0.07%' },
]
const ELECTIONS = [
  { name:'Student Council President 2026', status:'Active', phase:'Polling', states:6, voters:'4,230', startDate:'Apr 01, 2026' },
  { name:'CS Department CR Election', status:'Completed', phase:'Results', states:1, voters:'320', startDate:'Mar 10, 2026' },
  { name:'Sports Secretary Election', status:'Scheduled', phase:'—', states:6, voters:'4,230', startDate:'Apr 15, 2026' },
]
const CANDIDATES = [
  { name:'Arjun Mehta', party:'Progress Alliance', constituency:'President', status:'Approved', votes:1234 },
  { name:'Priya Sharma', party:'Student United Front', constituency:'President', status:'Approved', votes:987 },
  { name:'Rahul Verma', party:'Campus Forward', constituency:'Vice President', status:'Approved', votes:626 },
  { name:'Neha Kumar', party:'Progress Alliance', constituency:'Secretary', status:'Pending', votes:0 },
  { name:'Vikram Singh', party:'Student United Front', constituency:'CS-301 CR', status:'Approved', votes:289 },
]
const VOTERS = [
  { id:'STU-001', name:'Aditi Kumar', district:'Computer Science', status:'Verified', voted:true },
  { id:'STU-002', name:'Rohan Mehta', district:'Electrical Eng.', status:'Verified', voted:true },
  { id:'STU-003', name:'Sneha Singh', district:'Mechanical Eng.', status:'Verified', voted:false },
  { id:'STU-004', name:'Karan Sharma', district:'Business School', status:'Pending', voted:false },
  { id:'STU-005', name:'Deepak Gupta', district:'Civil Eng.', status:'Verified', voted:true },
  { id:'STU-006', name:'Sunita Rao', district:'Biotechnology', status:'Flagged', voted:false },
]
const TERMINAL_DATA = [
  { id:'TERM-001', loc:'CS Building - Lab A', status:'online', votes:342, battery:92, uptime:'99.8%' },
  { id:'TERM-012', loc:'EE Building - Room 201', status:'offline', votes:0, battery:45, uptime:'87.2%' },
  { id:'TERM-022', loc:'Library Foyer', status:'online', votes:289, battery:78, uptime:'99.5%' },
  { id:'TERM-045', loc:'Student Center', status:'online', votes:512, battery:85, uptime:'99.9%' },
  { id:'TERM-089', loc:'Mech Building', status:'warn', votes:267, battery:34, uptime:'95.1%' },
  { id:'TERM-301', loc:'Admin Block', status:'warn', votes:145, battery:8, uptime:'92.3%' },
]
const RESULTS = [
  { constituency:'President', winner:'Arjun Mehta', party:'Progress Alliance', votes:1234, margin:247, status:'Declared' },
  { constituency:'Vice President', winner:'Rahul Verma', party:'Campus Forward', votes:626, margin:112, status:'Declared' },
  { constituency:'Secretary', winner:'—', party:'—', votes:0, margin:0, status:'Counting' },
  { constituency:'CS-301 CR', winner:'—', party:'—', votes:0, margin:0, status:'Awaiting' },
]
const AUDIT_LOG = [
  { time:'14:23:05', event:'ELECTION_CREATED', user:'Admin', desc:'Student Council Election 2026 created', ip:'192.168.1.10' },
  { time:'14:22:30', event:'CANDIDATE_ADDED', user:'Admin', desc:'Arjun Mehta added to President', ip:'192.168.1.10' },
  { time:'14:21:00', event:'TERMINAL_DEPLOY', user:'System', desc:'12 terminals deployed across campus', ip:'—' },
  { time:'14:18:00', event:'VOTER_REGISTERED', user:'Admin', desc:'Batch import: 500 students', ip:'192.168.1.12' },
  { time:'14:15:00', event:'CONFIG_CHANGE', user:'SuperAdmin', desc:'Biometric threshold updated (95→97%)', ip:'192.168.1.10' },
]

const ALL_NAV = [
  { id:'dashboard',  section:'Navigation', label:'Dashboard',  badge:null, icon:<><rect x="1" y="1" width="5" height="5" rx="1"/><rect x="8" y="1" width="5" height="5" rx="1"/><rect x="1" y="8" width="5" height="5" rx="1"/><rect x="8" y="8" width="5" height="5" rx="1"/></> },
  { id:'elections',  section:'Navigation', label:'Elections',   badge:null, icon:<><rect x="2" y="2" width="10" height="10" rx="1.5"/><path d="M4.5 7l2 2 3-3"/></> },
  { id:'candidates', section:'Navigation', label:'Candidates',  badge:null, icon:<><circle cx="7" cy="5" r="2.5"/><path d="M2.5 13c0-2.49 2.02-4.5 4.5-4.5s4.5 2.01 4.5 4.5"/></> },
  { id:'voters',     section:'Navigation', label:'Voters',      badge:'12K', icon:<><path d="M2 4.5h10M2 7h7M2 9.5h5"/></> },
  { id:'terminals',  section:'Operations', label:'Terminals',   badge:null, icon:<><rect x="2" y="3.5" width="10" height="7" rx="1.5"/></> },
  { id:'results',    section:'Operations', label:'Results',     badge:null, icon:<><path d="M1.5 10.5l4-4 3 3 2.5-2.5 3 3"/></> },
  { id:'audit',      section:'Operations', label:'Audit Log',   badge:null, icon:<><circle cx="7" cy="7" r="5"/><path d="M7 4.5V7l1.5 1"/></> },
]

/* ─── VIEW: Dashboard (original) ─── */
function DashboardView() {
  return <>
    <div className="admin-topbar">
      <div className="at-user"><div className="at-av">AS</div><div><div className="at-name">Arjun Sharma</div><div className="at-role">Super Admin · PRO</div></div></div>
      <div className="at-right">
        <button className="dep-btn"><svg viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M6 2v7M3 6l3 3 3-3"/></svg> Export Data</button>
        <input className="srch" placeholder="Search..."/>
        <div className="ico-btn"><svg viewBox="0 0 14 14" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="1" width="4.5" height="4.5" rx="1"/><rect x="8.5" y="1" width="4.5" height="4.5" rx="1"/><rect x="1" y="8.5" width="4.5" height="4.5" rx="1"/><rect x="8.5" y="8.5" width="4.5" height="4.5" rx="1"/></svg></div>
      </div>
    </div>
    <div className="admin-content">
      <div className="admin-section-title">Top Elections · Student Council 2026 · 3 Active</div>
      <div className="asset-row">
        {ASSETS.map(a=>(
          <div key={a.name} className="ac">
            <div className="ac-top"><div><div className="ac-type">Proof of Participation</div><div className="ac-name">{a.name}</div></div><div className="ac-ico"><svg viewBox="0 0 16 16" fill="none" stroke="#4F46E5" strokeWidth="1.8" strokeLinecap="round"><path d="M8 2L2 6v8h3.5v-4h5v4H14V6L8 2z"/></svg></div></div>
            <div className="ac-lbl">Voter Turnout</div>
            <div className="ac-rate">{a.rate}<span>%</span></div>
            <div className={`ac-sub ${a.trend}`}><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d={a.upPath}/></svg>{a.trendLabel}</div>
            <div className="ac-spark"><svg width="100%" height="44" viewBox="0 0 200 44" preserveAspectRatio="none"><defs><linearGradient id={a.gradId} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={a.gradStart}/><stop offset="100%" stopColor={a.gradEnd}/></linearGradient></defs><path d={a.path} stroke={`url(#${a.gradId})`} strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg></div>
          </div>
        ))}
      </div>
      <div className="sp">
        <div className="sp-hdr"><div className="sp-upd"><svg viewBox="0 0 12 12" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"><circle cx="6" cy="6" r="4.5"/><path d="M6 3.5V6l1.5 1"/></svg> Last update · 2 min ago</div><button className="vbtn">Full Report →</button></div>
        <div className="sp-title">Student Council Election 2026<div className="sp-tag"><svg viewBox="0 0 14 14" fill="none" stroke="#4F46E5" strokeWidth="1.6" strokeLinecap="round"><rect x="2" y="2" width="10" height="10" rx="1.5"/><path d="M4.5 7l2 2 3-3"/></svg></div></div>
        <div className="sp-body"><div><div className="sp-rl">Total Votes Cast</div><div className="sp-rv">2,847</div><div className="sp-acts"><button className="rb p"><span>View Results</span></button><button className="rb o">Export</button></div></div><div className="pb-box"><div className="pb-title">Election Period</div><div className="pb-sub">Contribution (Hours)</div><div className="pb-track"><div className="pb-fill"></div><div className="pb-thumb"></div></div><div className="pb-lbls"><span>0h</span><span>8h</span></div><div className="pb-tabs"><div className="pb-tab">1H</div><div className="pb-tab">4H</div><div className="pb-tab on">8H</div><div className="pb-tab">12H</div></div></div></div>
      </div>
      <div className="stats-row">{STATS.map(s=>(<div key={s.label} className="stat"><div><div className="stat-lbl">{s.label}</div><div className="stat-val">{s.val}</div></div><div className="stat-chev"><Chev /></div></div>))}</div>
    </div>
  </>
}

/* ─── VIEW: Elections ─── */
function ElectionsView() {
  return <div className="admin-content">
    <div className="admin-section-title">Elections Management</div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
      <span style={{fontSize:11,color:'var(--text3)'}}>3 elections configured</span>
      <button className="dep-btn" style={{padding:'6px 14px',fontSize:10}}>+ New Election</button>
    </div>
    {ELECTIONS.map(e=>(
      <div key={e.name} className="panel" style={{marginBottom:10,padding:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <div style={{fontFamily:'var(--serif)',fontSize:14,color:'var(--text)',marginBottom:4}}>{e.name}</div>
            <div style={{fontSize:11,color:'var(--text3)'}}>Start: {e.startDate} · {e.states} dept(s) · {e.voters} eligible students</div>
          </div>
          <span style={{padding:'3px 10px',borderRadius:99,fontSize:9,fontWeight:700, background:e.status==='Active'?'rgba(21,128,61,0.08)':e.status==='Completed'?'rgba(79,70,229,0.08)':'rgba(217,119,6,0.08)', color:e.status==='Active'?'var(--success)':e.status==='Completed'?'var(--p2)':'var(--warning)'}}>{e.status}</span>
        </div>
        <div style={{display:'flex',gap:6,marginTop:10}}>
          <button className="tbtn" style={{padding:'4px 12px',fontSize:10}}>View Details</button>
          <button className="tbtn" style={{padding:'4px 12px',fontSize:10}}>Configure</button>
          {e.status==='Active' && <button className="tbtn p" style={{padding:'4px 12px',fontSize:10}}>Live Dashboard</button>}
        </div>
      </div>
    ))}
  </div>
}

/* ─── VIEW: Candidates ─── */
function CandidatesView() {
  return <div className="admin-content">
    <div className="admin-section-title">Candidates</div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
      <span style={{fontSize:11,color:'var(--text3)'}}>{CANDIDATES.length} candidates registered</span>
      <button className="dep-btn" style={{padding:'6px 14px',fontSize:10}}>+ Add Candidate</button>
    </div>
    <div className="panel">
      <table className="audit-table">
        <thead><tr><th>Candidate</th><th>Party</th><th>Position</th><th>Status</th><th>Votes</th></tr></thead>
        <tbody>
          {CANDIDATES.map(c=>(
            <tr key={c.name}>
              <td style={{fontWeight:600}}>{c.name}</td>
              <td><span style={{padding:'2px 8px',borderRadius:99,fontSize:9,background:'rgba(79,70,229,0.06)',color:'var(--p2)'}}>{c.party}</span></td>
              <td>{c.constituency}</td>
              <td><span style={{padding:'2px 8px',borderRadius:99,fontSize:9,fontWeight:700, background:c.status==='Approved'?'rgba(21,128,61,0.08)':'rgba(217,119,6,0.08)', color:c.status==='Approved'?'var(--success)':'var(--warning)'}}>{c.status}</span></td>
              <td>{c.votes.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
}

/* ─── VIEW: Voters ─── */
function VotersView() {
  return <div className="admin-content">
    <div className="admin-section-title">Voter Registry</div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
      <span style={{fontSize:11,color:'var(--text3)'}}>4,230 students registered</span>
      <div style={{display:'flex',gap:6}}>
        <button className="tbtn" style={{padding:'6px 14px',fontSize:10}}>Import CSV</button>
        <button className="dep-btn" style={{padding:'6px 14px',fontSize:10}}>+ Register Student</button>
      </div>
    </div>
    <div className="panel">
      <table className="audit-table">
        <thead><tr><th>Student ID</th><th>Name</th><th>Department</th><th>Status</th><th>Voted</th></tr></thead>
        <tbody>
          {VOTERS.map(v=>(
            <tr key={v.id}>
              <td style={{fontFamily:'monospace',fontWeight:600}}>{v.id}</td>
              <td>{v.name}</td>
              <td>{v.district}</td>
              <td><span style={{padding:'2px 8px',borderRadius:99,fontSize:9,fontWeight:700, background:v.status==='Verified'?'rgba(21,128,61,0.08)':v.status==='Pending'?'rgba(217,119,6,0.08)':'rgba(185,28,28,0.08)', color:v.status==='Verified'?'var(--success)':v.status==='Pending'?'var(--warning)':'var(--error)'}}>{v.status}</span></td>
              <td>{v.voted ? <span style={{color:'var(--success)',fontWeight:600}}>✓ Yes</span> : <span style={{color:'var(--text3)'}}>—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
}

/* ─── VIEW: Terminals ─── */
function TerminalsView() {
  return <div className="admin-content">
    <div className="admin-section-title">Terminal Management</div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
      <span style={{fontSize:11,color:'var(--text3)'}}>{TERMINAL_DATA.length} terminals deployed</span>
      <button className="dep-btn" style={{padding:'6px 14px',fontSize:10}}>+ Deploy Terminal</button>
    </div>
    <div className="panel">
      <table className="audit-table">
        <thead><tr><th>Terminal</th><th>Location</th><th>Status</th><th>Votes</th><th>Battery</th><th>Uptime</th></tr></thead>
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
              <td style={{fontSize:11}}>{t.uptime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
}

/* ─── VIEW: Results ─── */
function ResultsView() {
  return <div className="admin-content">
    <div className="admin-section-title">Election Results</div>
    <div className="kpi-row" style={{gridTemplateColumns:'repeat(4,1fr)',marginBottom:8}}>
      <div className="kpi"><div className="kpi-lbl">Online</div><div className="kpi-val" style={{color:'var(--success)'}}>10</div></div>
      <div className="kpi"><div className="kpi-lbl">Warning</div><div className="kpi-val" style={{color:'var(--warning)'}}>2</div></div>
      <div className="kpi"><div className="kpi-lbl">Offline</div><div className="kpi-val" style={{color:'var(--error)'}}>0</div></div>
      <div className="kpi"><div className="kpi-lbl">Total Votes</div><div className="kpi-val">2,847</div></div>
    </div>
    <div className="panel">
      <table className="audit-table">
        <thead><tr><th>Position</th><th>Winner</th><th>Party</th><th>Votes</th><th>Margin</th><th>Status</th></tr></thead>
        <tbody>
          {RESULTS.map(r=>(
            <tr key={r.constituency}>
              <td style={{fontWeight:600}}>{r.constituency}</td>
              <td>{r.winner}</td>
              <td>{r.party!=='—'?<span style={{padding:'2px 8px',borderRadius:99,fontSize:9,background:'rgba(79,70,229,0.06)',color:'var(--p2)'}}>{r.party}</span>:'—'}</td>
              <td>{r.votes?r.votes.toLocaleString():'—'}</td>
              <td>{r.margin?`+${r.margin.toLocaleString()}`:'—'}</td>
              <td><span style={{padding:'2px 8px',borderRadius:99,fontSize:9,fontWeight:700, background:r.status==='Declared'?'rgba(21,128,61,0.08)':r.status==='Counting'?'rgba(217,119,6,0.08)':'rgba(226,232,240,0.5)', color:r.status==='Declared'?'var(--success)':r.status==='Counting'?'var(--warning)':'var(--text3)'}}>{r.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
}

/* ─── VIEW: Audit Log ─── */
function AuditView() {
  return <div className="admin-content">
    <div className="admin-section-title">Admin Audit Log</div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
      <span style={{fontSize:11,color:'var(--text3)'}}>Showing 5 recent actions</span>
      <button className="tbtn p" style={{fontSize:10}}>Export Full Log</button>
    </div>
    <div className="panel">
      <table className="audit-table">
        <thead><tr><th>Time</th><th>Event</th><th>User</th><th>Description</th><th>IP Address</th></tr></thead>
        <tbody>
          {AUDIT_LOG.map((r,i)=>(
            <tr key={i}>
              <td style={{fontFamily:'monospace',fontSize:10,color:'var(--text3)'}}>{r.time}</td>
              <td><span className={`ev-badge ${r.event.includes('CREATED')||r.event.includes('ADDED')?'ev-vote':r.event.includes('REGISTERED')||r.event.includes('DEPLOY')?'ev-auth':'ev-alert'}`}>{r.event}</span></td>
              <td style={{fontSize:11,fontWeight:500}}>{r.user}</td>
              <td>{r.desc}</td>
              <td style={{fontFamily:'monospace',fontSize:10,color:'var(--text3)'}}>{r.ip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
}

/* ─── MAIN ─── */
export default function AdminPage() {
  const [tab, setTab] = useState('dashboard')
  const sections = [...new Set(ALL_NAV.map(n=>n.section))]

  return (
    <div className="view on" id="v-admin" style={{flex:1,overflow:'hidden'}}>
      <div className="admin-shell">
        <div className="obs-sb">
          <div className="obs-sb-hdr">
            <div className="obs-sb-ico"><svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><circle cx="8" cy="8" r="2.5"/><circle cx="8" cy="8" r="5.5" strokeWidth="1.2" opacity=".5"/></svg></div>
            <div><div className="obs-sb-sub">Student Election Board</div><div className="obs-sb-name">Admin Portal</div></div>
          </div>
          {sections.map(sec=>(
            <div key={sec}>
              <div className="obs-sec">{sec}</div>
              {ALL_NAV.filter(n=>n.section===sec).map(n=>(
                <div key={n.id} className={`obs-nav${tab===n.id?' on':''}`} onClick={()=>setTab(n.id)} style={{cursor:'pointer'}}>
                  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">{n.icon}</svg>
                  {n.label}
                  {n.badge && <span className="obs-nb">{n.badge}</span>}
                </div>
              ))}
            </div>
          ))}
          <div className="obs-user"><div className="obs-av">AS</div><div><div className="obs-uname">Arjun Sharma</div><div className="obs-urole">Super Admin</div></div></div>
        </div>
        <div className="admin-body">
          {tab==='dashboard'  && <DashboardView />}
          {tab==='elections'  && <ElectionsView />}
          {tab==='candidates' && <CandidatesView />}
          {tab==='voters'     && <VotersView />}
          {tab==='terminals'  && <TerminalsView />}
          {tab==='results'    && <ResultsView />}
          {tab==='audit'      && <AuditView />}
        </div>
      </div>
    </div>
  )
}
