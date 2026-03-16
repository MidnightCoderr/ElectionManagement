const Chev = () => (
  <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M3.5 2l3 3-3 3"/>
  </svg>
)

const ASSETS = [
  {
    name: 'Maharashtra', rate: '72.4', trend: 'up', trendLabel: '5.2% above avg',
    gradId: 'g1', gradStart: '#5b3fd4', gradEnd: '#9d7dfd',
    path: 'M0 36 C20 31,40 24,60 20 S100 15,120 13 S160 9,200 6',
    upPath: 'M5 8V2M2 5l3-3 3 3'
  },
  {
    name: 'Karnataka', rate: '65.1', trend: 'dn', trendLabel: '1.3% below avg',
    gradId: 'g2', gradStart: '#2e2e42', gradEnd: '#6b6b8a',
    path: 'M0 18 C20 21,40 28,60 30 S100 32,120 28 S160 24,200 30',
    upPath: 'M5 2v6M2 5l3 3 3-3'
  },
  {
    name: 'Delhi NCR', rate: '58.3', trend: 'up', trendLabel: '2.1% above avg',
    gradId: 'g3', gradStart: '#5b3fd4', gradEnd: '#c4b0fa',
    path: 'M0 40 C30 35,50 28,80 22 S120 17,150 12 S180 9,200 6',
    upPath: 'M5 8V2M2 5l3-3 3 3'
  },
]

const STATS = [
  { label: 'Momentum',         val: '0.82%'  },
  { label: 'Blockchain Blocks', val: '14,892' },
  { label: 'Active Terminals',  val: '69.6%'  },
  { label: 'Fraud Alerts',      val: '3.22%'  },
]

const ADMIN_NAV = [
  { label: 'Dashboard', active: true, badge: null,
    icon: <><rect x="1" y="1" width="5" height="5" rx="1"/><rect x="8" y="1" width="5" height="5" rx="1"/><rect x="1" y="8" width="5" height="5" rx="1"/><rect x="8" y="8" width="5" height="5" rx="1"/></> },
  { label: 'Elections', active: false, badge: null,
    icon: <><rect x="2" y="2" width="10" height="10" rx="1.5"/><path d="M4.5 7l2 2 3-3"/></> },
  { label: 'Candidates', active: false, badge: null,
    icon: <><circle cx="7" cy="5" r="2.5"/><path d="M2.5 13c0-2.49 2.02-4.5 4.5-4.5s4.5 2.01 4.5 4.5"/></> },
  { label: 'Voters', active: false, badge: '12K',
    icon: <><path d="M2 4.5h10M2 7h7M2 9.5h5"/></> },
]

const OPS_NAV = [
  { label: 'Terminals', icon: <><rect x="2" y="3.5" width="10" height="7" rx="1.5"/></> },
  { label: 'Results',   icon: <><path d="M1.5 10.5l4-4 3 3 2.5-2.5 3 3"/></> },
  { label: 'Audit Log', icon: <><circle cx="7" cy="7" r="5"/><path d="M7 4.5V7l1.5 1"/></> },
]

export default function AdminPage() {
  const portalUrl = import.meta.env.VITE_ADMIN_URL || 'http://localhost:3004'
  return (
    <div className="view on" id="v-admin" style={{flex:1,overflow:'hidden'}}>
      <a href={portalUrl} target="_blank" rel="noopener noreferrer"
        style={{display:'block',textAlign:'center',padding:'6px 0',background:'rgba(91,63,212,0.15)',color:'#c4b0fa',fontSize:12,fontWeight:600,fontFamily:"'DM Sans',sans-serif",textDecoration:'none',letterSpacing:'.02em'}}>
        Open Full Admin Portal &rarr;
      </a>
      <div className="admin-shell">

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
              <div className="obs-sb-name">Admin Portal</div>
            </div>
          </div>

          <div className="obs-sec">Navigation</div>
          {ADMIN_NAV.map(n => (
            <div key={n.label} className={`obs-nav${n.active ? ' on' : ''}`}>
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                {n.icon}
              </svg>
              {n.label}
              {n.badge && <span className="obs-nb">{n.badge}</span>}
            </div>
          ))}

          <div className="obs-sec">Operations</div>
          {OPS_NAV.map(n => (
            <div key={n.label} className="obs-nav">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                {n.icon}
              </svg>
              {n.label}
            </div>
          ))}

          <div className="obs-user">
            <div className="obs-av">AS</div>
            <div>
              <div className="obs-uname">Arjun Sharma</div>
              <div className="obs-urole">Super Admin</div>
            </div>
          </div>
        </div>

        {/* Admin body */}
        <div className="admin-body">
          <div className="admin-topbar">
            <div className="at-user">
              <div className="at-av">AS</div>
              <div>
                <div className="at-name">Arjun Sharma</div>
                <div className="at-role">Super Admin &middot; PRO</div>
              </div>
            </div>
            <div className="at-right">
              <button className="dep-btn">
                <svg viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M6 2v7M3 6l3 3 3-3"/>
                </svg>
                Export Data
              </button>
              <input className="srch" placeholder="Search..."/>
              <div className="ico-btn">
                <svg viewBox="0 0 14 14" fill="none" stroke="#5a5a78" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="1" y="1" width="4.5" height="4.5" rx="1"/>
                  <rect x="8.5" y="1" width="4.5" height="4.5" rx="1"/>
                  <rect x="1" y="8.5" width="4.5" height="4.5" rx="1"/>
                  <rect x="8.5" y="8.5" width="4.5" height="4.5" rx="1"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="admin-content">
            <div className="admin-section-title">Top Elections &middot; General 2024 &middot; 3 Active</div>

            {/* Asset cards */}
            <div className="asset-row">
              {ASSETS.map(a => (
                <div key={a.name} className="ac">
                  <div className="ac-top">
                    <div>
                      <div className="ac-type">Proof of Participation</div>
                      <div className="ac-name">{a.name}</div>
                    </div>
                    <div className="ac-ico">
                      <svg viewBox="0 0 16 16" fill="none" stroke="#9d7dfd" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M8 2L2 6v8h3.5v-4h5v4H14V6L8 2z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="ac-lbl">Voter Turnout</div>
                  <div className="ac-rate">{a.rate}<span>%</span></div>
                  <div className={`ac-sub ${a.trend}`}>
                    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d={a.upPath}/>
                    </svg>
                    {a.trendLabel}
                  </div>
                  <div className="ac-spark">
                    <svg width="100%" height="44" viewBox="0 0 200 44" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id={a.gradId} x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={a.gradStart}/>
                          <stop offset="100%" stopColor={a.gradEnd}/>
                        </linearGradient>
                      </defs>
                      <path d={a.path} stroke={`url(#${a.gradId})`} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* Staking panel */}
            <div className="sp">
              <div className="sp-hdr">
                <div className="sp-upd">
                  <svg viewBox="0 0 12 12" fill="none" stroke="#3e3e58" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="6" cy="6" r="4.5"/>
                    <path d="M6 3.5V6l1.5 1"/>
                  </svg>
                  Last update &middot; 2 min ago
                </div>
                <button className="vbtn">Full Report &rarr;</button>
              </div>
              <div className="sp-title">
                General Election 2024
                <div className="sp-tag">
                  <svg viewBox="0 0 14 14" fill="none" stroke="#9d7dfd" strokeWidth="1.6" strokeLinecap="round">
                    <rect x="2" y="2" width="10" height="10" rx="1.5"/>
                    <path d="M4.5 7l2 2 3-3"/>
                  </svg>
                </div>
              </div>
              <div className="sp-body">
                <div>
                  <div className="sp-rl">Total Votes Cast</div>
                  <div className="sp-rv">1,234,567</div>
                  <div className="sp-acts">
                    <button className="rb p"><span>View Results</span></button>
                    <button className="rb o">Export</button>
                  </div>
                </div>
                <div className="pb-box">
                  <div className="pb-title">Election Period</div>
                  <div className="pb-sub">Contribution (Hours)</div>
                  <div className="pb-track">
                    <div className="pb-fill"></div>
                    <div className="pb-thumb"></div>
                  </div>
                  <div className="pb-lbls"><span>0h</span><span>8h</span></div>
                  <div className="pb-tabs">
                    <div className="pb-tab">1H</div>
                    <div className="pb-tab">4H</div>
                    <div className="pb-tab on">8H</div>
                    <div className="pb-tab">12H</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats bar */}
            <div className="stats-row">
              {STATS.map(s => (
                <div key={s.label} className="stat">
                  <div>
                    <div className="stat-lbl">{s.label}</div>
                    <div className="stat-val">{s.val}</div>
                  </div>
                  <div className="stat-chev"><Chev /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
