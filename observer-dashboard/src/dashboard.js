export class Dashboard {
  constructor(rootEl) {
    this.root = rootEl;
    this.currentTab = 'overview';
    this.clockInterval = null;
    this.liveInterval = null;
  }

  init() {
    this.root.innerHTML = `
      <div class="topbar">
        <div class="topbar-title">
          Observer Dashboard
          <span class="live-badge">LIVE</span>
        </div>
        <div class="topbar-meta">Election: General 2024 &nbsp;&middot;&nbsp; <span id="clock"></span></div>
      </div>
      <div class="layout">
        <nav class="sidebar" id="sidebar"></nav>
        <main class="main" id="main-content"></main>
      </div>
    `;
    this._renderSidebar();
    this._renderTab();
    this._startClock();
    this._startLiveUpdates();
  }

  _renderSidebar() {
    const tabs = [
      { id: 'overview',  label: 'Overview',   badge: null,
        svg: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" width="14" height="14"><rect x="1" y="8" width="3" height="4" rx=".8"/><rect x="5.5" y="5" width="3" height="7" rx=".8"/><rect x="10" y="2" width="3" height="10" rx=".8"/></svg>' },
      { id: 'alerts',    label: 'Alerts',     badge: '3',
        svg: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" width="14" height="14"><path d="M7 2v2M12 7h-2M7 12v-2M2 7h2"/><circle cx="7" cy="7" r="2"/></svg>' },
      { id: 'audit',     label: 'Audit Log',  badge: null,
        svg: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" width="14" height="14"><path d="M2 4h10M2 7h7M2 10h5"/></svg>' },
      { id: 'verify',    label: 'Verify',     badge: null,
        svg: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" width="14" height="14"><circle cx="6" cy="6" r="4"/><path d="M11 11l-2-2"/></svg>' },
      { id: 'terminals', label: 'Terminals',  badge: null,
        svg: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" width="14" height="14"><rect x="2" y="4" width="10" height="7" rx="1.5"/><path d="M5 7h4"/></svg>' },
    ];

    document.getElementById('sidebar').innerHTML = `
      <div class="sidebar-brand">
        <div class="sidebar-brand-ico">
          <svg viewBox="0 0 16 16" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round">
            <circle cx="8" cy="8" r="2.5"/><circle cx="8" cy="8" r="5.5" stroke-width="1.2" opacity=".5"/>
          </svg>
        </div>
        <div class="sidebar-brand-text">
          <div class="top">Election Commission</div>
          <div class="bottom">Observer</div>
        </div>
      </div>
      <div class="sidebar-section">Monitor</div>
      ${tabs.slice(0,3).map(tab => `
        <button class="sidebar-item ${tab.id === this.currentTab ? 'active' : ''}" data-tab="${tab.id}">
          <span class="item-icon">${tab.svg}</span>
          <span class="item-label">${tab.label}</span>
          ${tab.badge ? `<span class="item-badge">${tab.badge}</span>` : ''}
        </button>
      `).join('')}
      <div class="sidebar-section">Tools</div>
      ${tabs.slice(3).map(tab => `
        <button class="sidebar-item ${tab.id === this.currentTab ? 'active' : ''}" data-tab="${tab.id}">
          <span class="item-icon">${tab.svg}</span>
          <span class="item-label">${tab.label}</span>
        </button>
      `).join('')}
      <div class="sidebar-user">
        <div class="sidebar-user-av">PM</div>
        <div>
          <div class="sidebar-user-name">Priya Mehta</div>
          <div class="sidebar-user-role">Observer</div>
        </div>
      </div>
    `;

    document.getElementById('sidebar').addEventListener('click', (e) => {
      const item = e.target.closest('.sidebar-item');
      if (!item) return;
      this.currentTab = item.dataset.tab;
      document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
      this._renderTab();
    });
  }

  _renderTab() {
    const el = document.getElementById('main-content');
    switch (this.currentTab) {
      case 'overview':  el.innerHTML = this._tabOverview();  this._drawChart(); break;
      case 'alerts':    el.innerHTML = this._tabAlerts();    break;
      case 'audit':     el.innerHTML = this._tabAudit();     this._bindAuditTabs(); break;
      case 'verify':    el.innerHTML = this._tabVerify();    this._bindVerify(); break;
      case 'terminals': el.innerHTML = this._tabTerminals(); break;
    }
  }

  _startClock() {
    const tick = () => {
      const el = document.getElementById('clock');
      if (el) el.textContent = new Date().toLocaleTimeString('en-IN');
    };
    tick();
    this.clockInterval = setInterval(tick, 1000);
  }

  _startLiveUpdates() {
    this.liveInterval = setInterval(() => {
      if (this.currentTab === 'overview') {
        const kv = document.getElementById('kpi-votes');
        if (kv) kv.textContent = (1234567 + Math.floor(Math.random() * 200)).toLocaleString('en-IN');
      }
    }, 3000);
  }

  destroy() {
    clearInterval(this.clockInterval);
    clearInterval(this.liveInterval);
  }

  //  Tab: Overview 
  _tabOverview() {
    return `
      <div class="kpi-grid">
        <div class="kpi-card green">
          <div class="kpi-label">Total Votes</div>
          <div class="kpi-value" id="kpi-votes">12,34,644</div>
          <div class="kpi-sub">&#8593; 2,341 last minute</div>
        </div>
        <div class="kpi-card blue">
          <div class="kpi-label">Voter Turnout</div>
          <div class="kpi-value">58.3%</div>
          <div class="kpi-sub">of registered voters</div>
        </div>
        <div class="kpi-card orange">
          <div class="kpi-label">Active Terminals</div>
          <div class="kpi-value">45,234</div>
          <div class="kpi-sub">of 48,000 total</div>
        </div>
        <div class="kpi-card red">
          <div class="kpi-label">Active Alerts</div>
          <div class="kpi-value">3</div>
          <div class="kpi-sub">2 High &middot; 1 Medium</div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-title">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="14" height="14">
            <path d="M2 10l3-5 3 3 2-4 2 2"/>
          </svg>
          Voting Rate &mdash; Last Hour (votes/min)
        </div>
        <div class="chart-area">
          <canvas id="voteChart"></canvas>
        </div>
      </div>

      <div class="bottom-grid">
        <div class="panel">
          <div class="panel-title">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="14" height="14">
              <rect x="1" y="1" width="12" height="12" rx="2"/><path d="M4 7h6M7 4v6"/>
            </svg>
            District Heatmap
          </div>
          <div class="heatmap" id="heatmap"></div>
        </div>
        <div class="panel">
          <div class="panel-title">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="14" height="14">
              <rect x="2" y="4" width="10" height="7" rx="1.5"/><path d="M5 7h4"/>
            </svg>
            Terminal Status
          </div>
          <div class="terminal-grid" id="term-mini" style="grid-template-columns:repeat(8,1fr)"></div>
          <div class="terminal-legend">
            <span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--p1);opacity:.7;margin-right:4px;vertical-align:middle"></span>Online</span>
            <span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--g3);opacity:.7;margin-right:4px;vertical-align:middle"></span>Warning</span>
            <span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:rgba(255,255,255,0.08);margin-right:4px;vertical-align:middle"></span>Offline</span>
          </div>
        </div>
      </div>
    `;
  }

  _drawChart() {
    requestAnimationFrame(() => {
      const canvas = document.getElementById('voteChart');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.width = canvas.offsetWidth || 800;
      canvas.height = 140;
      const w = canvas.width, h = canvas.height;

      const pts = Array.from({ length: 60 }, (_, i) =>
        3000 + Math.sin(i * 0.3) * 2000 + Math.random() * 3000
      );

      ctx.clearRect(0, 0, w, h);

      // Subtle grid
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        const y = (h / 4) * i;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Area fill  purple gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(124,92,252,0.35)');
      grad.addColorStop(1, 'rgba(124,92,252,0)');
      ctx.beginPath();
      ctx.moveTo(0, h);
      pts.forEach((v, i) => {
        const x = (w / (pts.length - 1)) * i;
        const y = h - (v / 8000) * (h - 10);
        ctx.lineTo(x, y);
      });
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Line  purple/white
      ctx.beginPath();
      pts.forEach((v, i) => {
        const x = (w / (pts.length - 1)) * i;
        const y = h - (v / 8000) * (h - 10);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.strokeStyle = 'rgba(157,125,253,0.9)';
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Heatmap
      const hm = document.getElementById('heatmap');
      if (hm) {
        hm.innerHTML = Array.from({ length: 32 }, () => {
          const v = Math.random();
          const alpha = 0.3 + v * 0.7;
          const col = v > .75 ? `rgba(124,92,252,${alpha})` :
                      v > .5  ? `rgba(91,63,212,${alpha})` :
                      v > .25 ? `rgba(62,62,88,${alpha})` :
                                `rgba(30,30,46,${alpha})`;
          return `<div class="heatmap-cell" style="background:${col}"
                    title="${Math.floor(v * 100000).toLocaleString()} votes"></div>`;
        }).join('');
      }

      // Mini terminal grid
      const tg = document.getElementById('term-mini');
      if (tg) {
        tg.innerHTML = Array.from({ length: 32 }, () => {
          const r = Math.random();
          const s = r < .05 ? 'offline' : r < .12 ? 'warn' : 'online';
          return `<div class="terminal-dot ${s}"></div>`;
        }).join('');
      }
    });
  }

  //  Tab: Alerts 
  _tabAlerts() {
    const alerts = [
      { time: '10:45:12', terminal: 'TERM-045', badge: 'HIGH',   msg: 'Anomalous voting spike detected',    sub: '150 votes in 5 minutes  threshold: 80' },
      { time: '10:32:07', terminal: 'TERM-089', badge: 'HIGH',   msg: 'Repeated biometric failures',        sub: '12 consecutive failed scans' },
      { time: '10:18:43', terminal: 'TERM-012', badge: 'MEDIUM', msg: 'Terminal connectivity lost',         sub: 'Offline for 22 minutes' },
    ];
    return `
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="14" height="14">
              <path d="M7 2v2M12 7h-2M7 12v-2M2 7h2"/><circle cx="7" cy="7" r="2"/>
            </svg>
            Active Alerts (3)
          </div>
          <button class="panel-action">Export</button>
        </div>
        ${alerts.map(a => `
          <div class="alert-item">
            <div>
              <div class="alert-time">${a.time}</div>
              <div class="alert-terminal">${a.terminal}</div>
            </div>
            <div>
              <span class="alert-badge ${a.badge === 'HIGH' ? 'badge-high' : 'badge-med'}">${a.badge}</span>
              <div class="alert-msg">${a.msg}</div>
              <div class="alert-sub">${a.sub}</div>
              <div class="alert-actions">
                <button class="a-btn a-btn-danger">Investigate</button>
                <button class="a-btn a-btn-muted">Dismiss</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  //  Tab: Audit Log 
  _tabAudit() {
    const rows = [
      { time: '10:45:23', terminal: 'TERM-001', type: 'vote',  ev: 'VOTE_CAST',   voter: 'V-****-8821', tx: '0xAB12' },
      { time: '10:45:21', terminal: 'TERM-045', type: 'auth',  ev: 'AUTH_OK',     voter: 'V-****-3302', tx: '0xCD34' },
      { time: '10:45:19', terminal: 'TERM-012', type: 'alert', ev: 'CONN_LOST',   voter: '',           tx: ''       },
      { time: '10:45:17', terminal: 'TERM-002', type: 'vote',  ev: 'VOTE_CAST',   voter: 'V-****-7741', tx: '0xEF56' },
      { time: '10:45:15', terminal: 'TERM-089', type: 'alert', ev: 'AUTH_FAIL',   voter: 'V-****-5512', tx: ''       },
      { time: '10:45:12', terminal: 'TERM-003', type: 'vote',  ev: 'VOTE_CAST',   voter: 'V-****-9923', tx: '0xGH78' },
    ];
    return `
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="14" height="14">
              <path d="M2 4h10M2 7h7M2 10h5"/>
            </svg>
            Audit Log
          </div>
          <button class="export-btn">Export CSV</button>
        </div>
        <div class="inner-tabs" id="audit-inner-tabs">
          <div class="inner-tab active" data-filter="all">All Events</div>
          <div class="inner-tab" data-filter="vote">Votes</div>
          <div class="inner-tab" data-filter="auth">Auth</div>
          <div class="inner-tab" data-filter="alert">Alerts</div>
        </div>
        <table class="audit-table" id="audit-table">
          <thead><tr>
            <th>Time</th><th>Terminal</th><th>Event</th><th>Voter ID</th><th>TX Hash</th>
          </tr></thead>
          <tbody>
            ${rows.map(r => `
              <tr data-type="${r.type}">
                <td>${r.time}</td>
                <td>${r.terminal}</td>
                <td><span class="ev-badge ev-${r.type}">${r.ev}</span></td>
                <td>${r.voter}</td>
                <td class="tx-hash">${r.tx}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="pagination">
          <button class="pag-btn">&larr; Prev</button>
          <span class="pag-info">Page 1 of 24 &nbsp;&middot;&nbsp; 143 events</span>
          <button class="export-btn">Next &rarr;</button>
        </div>
      </div>
    `;
  }

  _bindAuditTabs() {
    document.getElementById('audit-inner-tabs')?.addEventListener('click', (e) => {
      const tab = e.target.closest('.inner-tab');
      if (!tab) return;
      document.querySelectorAll('.inner-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      document.querySelectorAll('#audit-table tbody tr').forEach(row => {
        row.style.display = (filter === 'all' || row.dataset.type === filter) ? '' : 'none';
      });
    });
  }

  //  Tab: Verify 
  _tabVerify() {
    return `
      <div class="panel" style="max-width:560px">
        <div class="panel-header">
          <div class="panel-title">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="14" height="14">
              <circle cx="6" cy="6" r="4"/><path d="M11 11l-2-2"/>
            </svg>
            Verify Vote on Blockchain
          </div>
        </div>
        <div class="verify-label">Receipt Number</div>
        <input class="verify-input" id="receipt-input" type="text"
               value="12ABC34" placeholder="e.g. 12ABC34" maxlength="20" />
        <p style="font-family:var(--sans);font-size:11px;color:var(--text3);margin-bottom:12px;">
          The receipt number is printed on your paper voting slip.
        </p>
        <div class="verify-or"> OR </div>
        <div class="qr-scanner-box">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="18" height="18">
            <rect x="2" y="2" width="5" height="5" rx="1"/><rect x="13" y="2" width="5" height="5" rx="1"/>
            <rect x="2" y="13" width="5" height="5" rx="1"/>
            <path d="M13 13h2v2h2v-4h-4v2z"/>
          </svg>
          Scan QR Code &nbsp;&mdash;&nbsp; Use device camera to scan receipt QR
        </div>
        <button class="verify-btn" id="verify-btn">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="13" height="13" style="display:inline-block;vertical-align:middle;margin-right:6px">
            <circle cx="6" cy="6" r="4"/><path d="M11 11l-2-2"/>
          </svg>
          Verify on Blockchain
        </button>
        <div id="verify-result-area"></div>
      </div>
    `;
  }

  _bindVerify() {
    document.getElementById('verify-btn')?.addEventListener('click', () => {
      const receipt = document.getElementById('receipt-input')?.value?.trim() || '12ABC34';
      document.getElementById('verify-result-area').innerHTML = `
        <div class="verify-result">
          <h4>
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="display:inline-block;vertical-align:middle;margin-right:5px;color:var(--p3)" width="14" height="14">
              <path d="M2.5 7l3 3 6-6"/>
            </svg>
            Vote Verified Successfully
          </h4>
          <div class="verify-row"><span class="vrl">Receipt</span><span class="vrv">${receipt}</span></div>
          <div class="verify-row"><span class="vrl">Vote ID</span><span class="vrv">a1b2c3d4-e5f6-7890</span></div>
          <div class="verify-row"><span class="vrl">Timestamp</span><span class="vrv">2024-03-15 10:45:23 IST</span></div>
          <div class="verify-row"><span class="vrl">Election</span><span class="vrv">General Election 2024</span></div>
          <div class="verify-row"><span class="vrl">Blockchain</span><span class="vrv" style="color:var(--p3)">Found on Hyperledger Fabric</span></div>
          <div class="verify-row"><span class="vrl">Block #</span><span class="vrv">12,345</span></div>
          <div class="verify-row"><span class="vrl">TX Hash</span><span class="vrv">0xAB12CD34EF56GH78</span></div>
          <div class="verify-row"><span class="vrl">Integrity</span><span class="vrv" style="color:var(--p3)">Verified</span></div>
          <div class="verify-row"><span class="vrl">District</span><span class="vrv">Mumbai Central</span></div>
          <div class="verify-row"><span class="vrl">Terminal</span><span class="vrv">TERM-001</span></div>
          <button class="verify-export-btn">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="12" height="12" style="display:inline-block;vertical-align:middle;margin-right:5px">
              <path d="M7 2v7M4 6l3 3 3-3"/><path d="M2 11h10"/>
            </svg>
            Export Verification Proof (PDF)
          </button>
        </div>
      `;
    });
  }

  //  Tab: Terminals 
  _tabTerminals() {
    const statuses = Array.from({ length: 160 }, (_, i) => {
      if (i === 11 || i === 44 || i === 99) return 'offline';
      const r = Math.random();
      if (r < .04) return 'offline';
      if (r < .10) return 'warn';
      return 'online';
    });

    const online  = statuses.filter(s => s === 'online').length;
    const warn    = statuses.filter(s => s === 'warn').length;
    const offline = statuses.filter(s => s === 'offline').length;

    return `
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="14" height="14">
              <rect x="2" y="4" width="10" height="7" rx="1.5"/><path d="M5 7h4"/>
            </svg>
            Terminal Status Grid
          </div>
        </div>
        <div class="terminal-grid">
          ${statuses.map((s, i) => `
            <div class="terminal-dot ${s}"
                 title="TERM-${String(i + 1).padStart(3, '0')}: ${s}"></div>
          `).join('')}
        </div>
        <div class="terminal-legend" style="margin-top:14px">
          <span><span style="display:inline-block;width:9px;height:9px;border-radius:2px;background:var(--p1);opacity:.7;margin-right:5px;vertical-align:middle"></span>Online: ${online.toLocaleString()}</span>
          <span><span style="display:inline-block;width:9px;height:9px;border-radius:2px;background:var(--g3);opacity:.7;margin-right:5px;vertical-align:middle"></span>Warning: ${warn.toLocaleString()}</span>
          <span><span style="display:inline-block;width:9px;height:9px;border-radius:2px;background:rgba(255,255,255,0.08);margin-right:5px;vertical-align:middle"></span>Offline: ${offline.toLocaleString()}</span>
        </div>
      </div>
    `;
  }
}
