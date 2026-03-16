import { useEffect, useRef } from 'react'

const KPI_DATA = [
  { ico: 'p', stroke: '#9d7dfd', label: 'Total Votes', val: '1,234,567', trend: 'up', trendLabel: '\u2191 Live',
    svgPath: <><path d="M7 1.5v2M12 7h-2M7 12.5v-2M2 7h2"/><circle cx="7" cy="7" r="2.5"/></> },
  { ico: 'g', stroke: '#8e8ea8', label: 'Turnout', val: '58.3%', trend: 'dn', trendLabel: 'of 2.12Cr',
    svgPath: <><circle cx="7" cy="7" r="5"/><path d="M7 4.5V7l2 1"/></> },
  { ico: 'p', stroke: '#9d7dfd', label: 'Terminals', val: '45,234', trend: 'dn', trendLabel: 'of 48,000',
    svgPath: <><rect x="2" y="3.5" width="10" height="7" rx="1.5"/></> },
  { ico: 'g', stroke: '#8e8ea8', label: 'Alerts', val: '5', trend: 'up', trendLabel: '3 Critical',
    svgPath: <><path d="M7 2v2M12 7h-2M7 12v-2M2 7h2"/><circle cx="7" cy="7" r="2"/></> },
]

const DIST_DATA = [
  { label: 'Mumbai',    pct: 72 },
  { label: 'Delhi',     pct: 65 },
  { label: 'Chennai',   pct: 58 },
  { label: 'Kolkata',   pct: 51 },
  { label: 'Bangalore', pct: 38 },
]

const ALERT_DATA = [
  { sev: 'h', sevLabel: 'Critical', msg: 'Voting spike detected',  det: 'TERM-045 \u00b7 150 votes / 5 min' },
  { sev: 'm', sevLabel: 'Medium',   msg: 'Terminal offline',       det: 'TERM-012 \u00b7 22 min ago'       },
  { sev: 'h', sevLabel: 'Critical', msg: 'Failed biometrics',      det: 'TERM-089 \u00b7 12 failed scans'  },
  { sev: 'm', sevLabel: 'Medium',   msg: 'Low battery warning',    det: 'TERM-301 \u00b7 8% remaining'     },
]

function TerminalGrid() {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    ref.current.innerHTML = ''
    for (let i = 0; i < 120; i++) {
      const d = document.createElement('div')
      const r = Math.random()
      d.className = 'tdot ' + (r < .06 ? 'of' : r < .14 ? 'wa' : 'on')
      ref.current.appendChild(d)
    }
  }, [])
  return <div className="tgrid" id="tgrid" ref={ref}></div>
}

export default function ObserverPage() {
  const portalUrl = import.meta.env.VITE_OBSERVER_URL || 'http://localhost:3002'
  return (
    <div className="view on" id="v-obs" style={{flex:1,overflow:'hidden'}}>
      <a href={portalUrl} target="_blank" rel="noopener noreferrer"
        style={{display:'block',textAlign:'center',padding:'6px 0',background:'rgba(91,63,212,0.15)',color:'#c4b0fa',fontSize:12,fontWeight:600,fontFamily:"'DM Sans',sans-serif",textDecoration:'none',letterSpacing:'.02em'}}>
        Open Full Observer Dashboard &rarr;
      </a>
      <div className="obs-shell">

        {/* Sidebar */}
        <div className="obs-sb">
          <div className="obs-sb-hdr">
            <div className="obs-sb-ico">
              <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                <circle cx="8" cy="8" r="2.5"/>
                <circle cx="8" cy="8" r="5.5" strokeWidth="1.2" opacity=".5"/>
              </svg>
            </div>
            <div>
              <div className="obs-sb-sub">Election Commission</div>
              <div className="obs-sb-name">Observer</div>
            </div>
          </div>

          <div className="obs-sec">Monitor</div>
          <div className="obs-nav on">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <rect x="1" y="8" width="3" height="4" rx=".8"/><rect x="5.5" y="5" width="3" height="7" rx=".8"/><rect x="10" y="2" width="3" height="10" rx=".8"/>
            </svg>
            Overview
          </div>
          <div className="obs-nav">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <circle cx="7" cy="7" r="5"/><path d="M7 4.5V7l1.5 1.5"/>
            </svg>
            Real-Time
          </div>
          <div className="obs-nav">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M7 2v2M12 7h-2M7 12v-2M2 7h2"/><circle cx="7" cy="7" r="2"/>
            </svg>
            Alerts<span className="obs-nb">5</span>
          </div>

          <div className="obs-sec">Tools</div>
          <div className="obs-nav">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M2 4h10M2 7h7M2 10h5"/>
            </svg>
            Audit Log
          </div>
          <div className="obs-nav">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <circle cx="6" cy="6" r="4"/><path d="M11 11l-2-2"/>
            </svg>
            Verify
          </div>
          <div className="obs-nav">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <rect x="2" y="4" width="10" height="7" rx="1.5"/><path d="M5 7h4"/>
            </svg>
            Terminals
          </div>

          <div className="obs-user">
            <div className="obs-av">PM</div>
            <div>
              <div className="obs-uname">Priya Mehta</div>
              <div className="obs-urole">Observer</div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="obs-main">
          <div className="obs-toprow">
            <div>
              <div className="obs-title">Overview</div>
              <div className="obs-sub">General Election 2024 &middot; Live feed</div>
            </div>
            <div className="obs-tbrow">
              <button className="tbtn">
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M6 2v8M2 6h8"/>
                </svg>
                Export
              </button>
              <button className="tbtn p">Refresh</button>
            </div>
          </div>

          {/* KPI Row */}
          <div className="kpi-row">
            {KPI_DATA.map((k, i) => (
              <div key={i} className="kpi">
                <div className={`kpi-ico ${k.ico}`}>
                  <svg viewBox="0 0 14 14" fill="none" stroke={k.stroke} strokeWidth="1.6" strokeLinecap="round">
                    {k.svgPath}
                  </svg>
                </div>
                <div className="kpi-lbl">{k.label}</div>
                <div className="kpi-val">{k.val}</div>
                <div className={`kpi-tr ${k.trend}`}>{k.trendLabel}</div>
              </div>
            ))}
          </div>

          {/* Two column panels */}
          <div className="two-col">
            {/* Turnout by district + terminal status */}
            <div className="panel">
              <div className="ph">
                <div className="pt">
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <rect x="1" y="7" width="2.5" height="4" rx=".5"/>
                    <rect x="4.75" y="4.5" width="2.5" height="6.5" rx=".5"/>
                    <rect x="8.5" y="2" width="2.5" height="9" rx=".5"/>
                  </svg>
                  Turnout by District
                </div>
                <button className="pa">View All</button>
              </div>
              {DIST_DATA.map(d => (
                <div key={d.label} className="dr">
                  <span className="dl">{d.label}</span>
                  <div className="dt"><div className="df" style={{width:`${d.pct}%`}}></div></div>
                  <span className="dv">{d.pct}%</span>
                </div>
              ))}
              <div style={{marginTop:16}}>
                <div className="pt" style={{marginBottom:9,fontSize:12}}>
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width="13" height="13">
                    <rect x="1.5" y="4" width="9" height="7" rx="1.2"/>
                    <path d="M4 4V2.5A1.5 1.5 0 015.5 1h1A1.5 1.5 0 018 2.5V4"/>
                  </svg>
                  Terminal Status
                </div>
                <TerminalGrid />
              </div>
            </div>

            {/* Alerts */}
            <div className="panel">
              <div className="ph">
                <div className="pt">
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width="13" height="13">
                    <path d="M6 1.5v2M10.5 6h-2M6 10.5v-2M1.5 6h2"/>
                    <circle cx="6" cy="6" r="2.2"/>
                  </svg>
                  Recent Alerts
                </div>
                <button className="pa">All</button>
              </div>
              {ALERT_DATA.map((a, i) => (
                <div key={i} className="ar">
                  <span className={`asev ${a.sev}`}>{a.sevLabel}</span>
                  <div>
                    <div className="amsg">{a.msg}</div>
                    <div className="adet">{a.det}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
