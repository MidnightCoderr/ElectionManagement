// ── Dashboard Class ────────────────────────────────────────────────────────
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
          <span class="live-badge">🔴 LIVE</span>
        </div>
        <div class="topbar-meta">Election: General 2024 &nbsp;·&nbsp; <span id="clock"></span></div>
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
      { id: 'overview',  icon: '📊', label: 'Overview' },
      { id: 'alerts',    icon: '🚨', label: 'Alerts',   badge: '3' },
      { id: 'audit',     icon: '📜', label: 'Audit Log' },
      { id: 'verify',    icon: '🔍', label: 'Verify' },
      { id: 'terminals', icon: '🖥',  label: 'Terminals' },
    ];

    document.getElementById('sidebar').innerHTML = tabs.map(tab => `
      <div class="nav-item ${tab.id === this.currentTab ? 'active' : ''}" data-tab="${tab.id}">
        <span class="icon">${tab.icon}</span>
        ${tab.label}
        ${tab.badge ? `<span class="nav-badge">${tab.badge}</span>` : ''}
      </div>
    `).join('');

    document.getElementById('sidebar').addEventListener('click', (e) => {
      const item = e.target.closest('.nav-item');
      if (!item) return;
      this.currentTab = item.dataset.tab;
      document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
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
        if (kv) {
          const base = 1234567 + Math.floor(Math.random() * 100);
          kv.textContent = base.toLocaleString('en-IN');
        }
      }
    }, 3000);
  }

  destroy() {
    clearInterval(this.clockInterval);
    clearInterval(this.liveInterval);
  }

  // ── Tab: Overview ─────────────────────────────────────────────────────────
  _tabOverview() {
    return `
      <div class="kpi-grid">
        <div class="kpi-card green">
          <div class="kpi-label">Total Votes</div>
          <div class="kpi-value" id="kpi-votes">1,234,567</div>
          <div class="kpi-sub">↑ 2,341 last minute</div>
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
          <div class="kpi-sub">2 High · 1 Medium</div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-title">📈 Voting Rate — Last Hour (votes/min)</div>
        <div class="chart-area">
          <canvas id="voteChart" style="width:100%;height:120px"></canvas>
        </div>
      </div>

      <div class="bottom-grid">
        <div class="panel">
          <div class="panel-title">🗺 District Heatmap</div>
          <div class="heatmap" id="heatmap"></div>
        </div>
        <div class="panel">
          <div class="panel-title">🖥 Terminal Status</div>
          <div class="terminal-grid" id="term-mini"></div>
          <div class="terminal-legend">
            <span><span style="color:#1DB954">■</span> Online</span>
            <span><span style="color:#E67E22">■</span> Warning</span>
            <span><span style="color:#E74C3C">■</span> Offline</span>
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
      canvas.width = canvas.offsetWidth || 700;
      canvas.height = 120;
      const w = canvas.width, h = canvas.height;
      const pts = Array.from({ length: 60 }, () =>
        2000 + Math.random() * 6000 + Math.sin(Math.random() * 10) * 1000
      );

      ctx.clearRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = '#21262d'; ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const y = (h / 4) * i;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Area fill
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(37,99,235,.4)');
      grad.addColorStop(1, 'rgba(37,99,235,0)');
      ctx.beginPath();
      ctx.moveTo(0, h);
      pts.forEach((v, i) => {
        const x = (w / pts.length) * i, y = h - (v / 8000) * h;
        ctx.lineTo(x, y);
      });
      ctx.lineTo(w, h); ctx.closePath();
      ctx.fillStyle = grad; ctx.fill();

      // Line
      ctx.beginPath();
      pts.forEach((v, i) => {
        const x = (w / pts.length) * i, y = h - (v / 8000) * h;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#2563EB'; ctx.lineWidth = 2; ctx.stroke();

      // Heatmap
      const hm = document.getElementById('heatmap');
      if (hm) {
        hm.innerHTML = Array.from({ length: 32 }, () => {
          const v = Math.random();
          const col = v > .8 ? '#1DB954' : v > .5 ? '#2563EB' : v > .3 ? '#E67E22' : '#21262d';
          return `<div class="heatmap-cell" style="background:${col};opacity:${.4 + v * .6}"
                    title="${Math.floor(v * 100000).toLocaleString()} votes"></div>`;
        }).join('');
      }

      // Mini terminal grid
      const tg = document.getElementById('term-mini');
      if (tg) {
        tg.style.gridTemplateColumns = 'repeat(8,1fr)';
        tg.innerHTML = Array.from({ length: 32 }, () => {
          const r = Math.random();
          const s = r < .05 ? 'offline' : r < .12 ? 'warn' : 'online';
          return `<div class="terminal-dot ${s}"></div>`;
        }).join('');
      }
    });
  }

  // ── Tab: Alerts ───────────────────────────────────────────────────────────
  _tabAlerts() {
    const alerts = [
      {
        time: '2:45 PM', terminal: 'TERM-045', level: 'HIGH',
        msg: 'Unusual voting spike detected',
        sub: '150 votes in 5 minutes — 3× normal rate',
        actions: [['🔍 INVESTIGATE', 'danger'], ['DISMISS', 'muted']],
      },
      {
        time: '1:30 PM', terminal: 'TERM-012', level: 'MEDIUM',
        msg: 'Terminal offline',
        sub: 'No heartbeat for 15 minutes',
        actions: [['CHECK', 'muted'], ['IGNORE', 'muted']],
      },
      {
        time: '12:15 PM', terminal: 'TERM-089', level: 'HIGH',
        msg: 'Multiple failed authentications',
        sub: '10 failed biometric scans in 3 minutes',
        actions: [['REVIEW', 'danger'], ['DISMISS', 'muted']],
      },
    ];

    return `
      <div class="panel">
        <div class="panel-title">🚨 Fraud Alerts (Live)</div>
        ${alerts.map(a => `
          <div class="alert-item">
            <div>
              <div class="alert-time">${a.time}</div>
              <div class="alert-terminal">${a.terminal}</div>
            </div>
            <div>
              <span class="alert-badge badge-${a.level === 'HIGH' ? 'high' : 'med'}">${a.level}</span>
              <div class="alert-msg">${a.msg}</div>
              <div class="alert-sub">${a.sub}</div>
              <div class="alert-actions">
                ${a.actions.map(([label, type]) =>
                  `<button class="a-btn a-btn-${type}">${label}</button>`
                ).join('')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ── Tab: Audit Log ────────────────────────────────────────────────────────
  _tabAudit() {
    const rows = [
      ['3:45 PM', 'VOTE',  'TERM-001', 'Vote cast',           'ev-vote',  '0xAB12..'],
      ['3:44 PM', 'AUTH',  'TERM-001', 'Voter authenticated', 'ev-auth',  '—'],
      ['3:42 PM', 'VOTE',  'TERM-032', 'Vote cast',           'ev-vote',  '0x12CD..'],
      ['3:40 PM', 'ALERT', 'TERM-045', 'Fraud: High volume',  'ev-alert', '—'],
      ['3:38 PM', 'VOTE',  'TERM-001', 'Vote cast',           'ev-vote',  '0xCDEF..'],
    ];

    return `
      <div class="panel">
        <div class="panel-title">📜 Audit Log</div>
        <div class="inner-tabs" id="audit-tabs">
          <div class="inner-tab active" data-filter="all">All</div>
          <div class="inner-tab" data-filter="voting">Voting</div>
          <div class="inner-tab" data-filter="security">Security</div>
          <div class="inner-tab" data-filter="system">System</div>
        </div>
        <table class="audit-table" id="audit-table">
          <thead>
            <tr>
              <th>Time</th><th>Event</th><th>Terminal</th><th>Details</th><th>TX Hash</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td>${r[0]}</td>
                <td><span class="ev-badge ${r[4]}">${r[1]}</span></td>
                <td style="color:#8b949e">${r[2]}</td>
                <td>${r[3]}</td>
                <td class="tx-hash">${r[5]}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="pagination">
          <button class="pag-btn">◀ Prev</button>
          <span class="pag-info">Page 1 of 523</span>
          <div style="display:flex;gap:8px">
            <button class="pag-btn">Next ▶</button>
            <button class="export-btn">📥 Export CSV</button>
          </div>
        </div>
      </div>
    `;
  }

  _bindAuditTabs() {
    document.getElementById('audit-tabs')?.addEventListener('click', (e) => {
      const tab = e.target.closest('.inner-tab');
      if (!tab) return;
      document.querySelectorAll('.inner-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  }

  // ── Tab: Verify ───────────────────────────────────────────────────────────
  _tabVerify() {
    return `
      <div class="panel">
        <div class="panel-title">🔍 Verify Vote on Blockchain</div>
        <div class="verify-label">Enter Receipt Number:</div>
        <input class="verify-input" id="receipt-input" type="text"
               value="12ABC34" placeholder="e.g. 12ABC34" />
        <div class="verify-or">— OR —</div>
        <div class="qr-scanner-box">📷 QR Scanner Active</div>
        <button class="verify-btn" id="verify-btn">🔍 VERIFY</button>
        <div id="verify-result-area"></div>
      </div>
    `;
  }

  _bindVerify() {
    document.getElementById('verify-btn')?.addEventListener('click', () => {
      document.getElementById('verify-result-area').innerHTML = `
        <div class="verify-result">
          <h4>✅ Vote Verified</h4>
          <div class="verify-row"><span class="vr-label">Receipt</span><span class="vr-val">12ABC34</span></div>
          <div class="verify-row"><span class="vr-label">Vote ID</span><span class="vr-val">a1b2c3d4-e5f6…</span></div>
          <div class="verify-row"><span class="vr-label">Timestamp</span><span class="vr-val">2024-03-15 10:45:23</span></div>
          <div class="verify-row"><span class="vr-label">Election</span><span class="vr-val">General Election 2024</span></div>
          <div class="verify-row"><span class="vr-label">Blockchain</span><span class="vr-val" style="color:#1DB954">✅ Found</span></div>
          <div class="verify-row"><span class="vr-label">Block #</span><span class="vr-val">12,345</span></div>
          <div class="verify-row"><span class="vr-label">TX Hash</span><span class="vr-val">0xAB12CD34EF56…</span></div>
          <div class="verify-row"><span class="vr-label">Integrity</span><span class="vr-val" style="color:#1DB954">✅ Verified</span></div>
          <div class="verify-row"><span class="vr-label">District</span><span class="vr-val">Mumbai Central</span></div>
          <div class="verify-row"><span class="vr-label">Terminal</span><span class="vr-val">TERM-001</span></div>
          <button class="verify-export-btn">📥 Export Proof</button>
        </div>
      `;
    });
  }

  // ── Tab: Terminals ────────────────────────────────────────────────────────
  _tabTerminals() {
    const statuses = Array.from({ length: 64 }, (_, i) => {
      const r = Math.random();
      if (i === 11 || i === 44) return 'offline';
      if (r < .05) return 'offline';
      if (r < .12) return 'warn';
      return 'online';
    });

    return `
      <div class="panel">
        <div class="panel-title">🖥 Terminal Status Grid</div>
        <div class="terminal-grid">
          ${statuses.map((s, i) => `
            <div class="terminal-dot ${s}"
                 title="TERM-${String(i + 1).padStart(3, '0')}: ${s}"></div>
          `).join('')}
        </div>
        <div class="terminal-legend">
          <span><span style="color:#1DB954;font-size:16px">■</span> Online: 45,234</span>
          <span><span style="color:#E67E22;font-size:16px">■</span> Warning: 1,502</span>
          <span><span style="color:#E74C3C;font-size:16px">■</span> Offline: 1,264</span>
        </div>
      </div>
    `;
  }
}
