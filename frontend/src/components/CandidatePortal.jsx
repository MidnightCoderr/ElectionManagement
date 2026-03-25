import { useState, useEffect } from 'react'

const MOCK_ELECTIONS = [
  { id: 'sc-2026', name: 'Student Council President 2026', position: 'President', department: 'All Departments', status: 'active', deadline: '2026-04-15' },
  { id: 'cs-cr-2026', name: 'CS-301 Class Representative', position: 'Class Representative', department: 'Computer Science', status: 'active', deadline: '2026-04-10' },
  { id: 'ee-cr-2026', name: 'EE-201 Class Representative', position: 'Class Representative', department: 'Electrical Engineering', status: 'active', deadline: '2026-04-10' },
  { id: 'sc-vp-2026', name: 'Student Council Vice President', position: 'Vice President', department: 'All Departments', status: 'active', deadline: '2026-04-15' },
  { id: 'sc-sec-2026', name: 'Student Council Secretary', position: 'Secretary', department: 'All Departments', status: 'upcoming', deadline: '2026-04-20' },
  { id: 'sports-sec', name: 'Sports Secretary', position: 'Sports Secretary', department: 'All Departments', status: 'active', deadline: '2026-04-12' },
]

const POSITIONS = ['President', 'Vice President', 'Secretary', 'Sports Secretary', 'Class Representative', 'Cultural Secretary', 'Technical Secretary']
const DEPARTMENTS = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Business School', 'Biotechnology']
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year']

const ELIGIBILITY = [
  { label: 'Minimum CGPA of 7.0', icon: '📊', key: 'cgpa' },
  { label: 'No active disciplinary cases', icon: '✅', key: 'discipline' },
  { label: 'Enrolled in relevant department', icon: '🏫', key: 'enrollment' },
  { label: 'Minimum 75% attendance', icon: '📅', key: 'attendance' },
  { label: 'No pending academic dues', icon: '💰', key: 'dues' },
]

export default function CandidatePortal() {
  const [view, setView] = useState('browse') // browse | apply | status
  const [selectedElection, setSelectedElection] = useState(null)
  const [applications, setApplications] = useState([])
  const [form, setForm] = useState({ name: '', studentId: '', department: '', year: '', cgpa: '', manifesto: '', phone: '', email: '' })
  const [eligibility, setEligibility] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [filterDept, setFilterDept] = useState('')
  const [hoverCard, setHoverCard] = useState(null)

  // Simulate eligibility check
  useEffect(() => {
    if (form.cgpa && form.department && form.studentId) {
      const cgpaVal = parseFloat(form.cgpa)
      setEligibility({
        cgpa: cgpaVal >= 7.0,
        discipline: true,
        enrollment: !!form.department,
        attendance: true,
        dues: true,
      })
    }
  }, [form.cgpa, form.department, form.studentId])

  const allEligible = Object.values(eligibility).length === 5 && Object.values(eligibility).every(Boolean)
  const filtered = filterDept ? MOCK_ELECTIONS.filter(e => e.department === filterDept || e.department === 'All Departments') : MOCK_ELECTIONS

  function handleApply(election) {
    setSelectedElection(election)
    setView('apply')
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!allEligible) return
    setSubmitting(true)
    setTimeout(() => {
      setApplications(prev => [...prev, {
        id: `APP-${Date.now()}`,
        election: selectedElection,
        ...form,
        status: 'pending',
        appliedAt: new Date().toISOString(),
      }])
      setSubmitting(false)
      setForm({ name: '', studentId: '', department: '', year: '', cgpa: '', manifesto: '', phone: '', email: '' })
      setView('status')
    }, 1500)
  }

  return (
    <div style={s.wrap}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>🎓 Candidate Portal</h1>
          <p style={s.subtitle}>Apply for student council & class representative positions</p>
        </div>
        <div style={s.tabs}>
          {[
            { id: 'browse', label: '📋 Browse Elections', count: MOCK_ELECTIONS.length },
            { id: 'apply', label: '✏️ Apply' },
            { id: 'status', label: '📊 My Applications', count: applications.length },
          ].map(tab => (
            <button
              key={tab.id}
              style={{ ...s.tab, ...(view === tab.id ? s.tabActive : {}) }}
              onClick={() => setView(tab.id)}
            >
              {tab.label}
              {tab.count !== undefined && <span style={s.tabBadge}>{tab.count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={s.content}>
        {/* ── BROWSE ELECTIONS ── */}
        {view === 'browse' && (
          <div>
            <div style={s.filterRow}>
              <select
                style={s.filterSelect}
                value={filterDept}
                onChange={e => setFilterDept(e.target.value)}
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <span style={s.filterCount}>{filtered.length} positions available</span>
            </div>

            <div style={s.grid}>
              {filtered.map(el => (
                <div
                  key={el.id}
                  style={{ ...s.card, ...(hoverCard === el.id ? s.cardHover : {}) }}
                  onMouseEnter={() => setHoverCard(el.id)}
                  onMouseLeave={() => setHoverCard(null)}
                >
                  <div style={s.cardTop}>
                    <div style={{ ...s.statusBadge, ...(el.status === 'active' ? s.badgeActive : s.badgeUpcoming) }}>
                      {el.status === 'active' ? '🟢 Open' : '🟡 Upcoming'}
                    </div>
                    <span style={s.deadline}>Deadline: {el.deadline}</span>
                  </div>
                  <h3 style={s.cardTitle}>{el.name}</h3>
                  <div style={s.cardMeta}>
                    <span style={s.metaTag}>🎯 {el.position}</span>
                    <span style={s.metaTag}>🏫 {el.department}</span>
                  </div>
                  <div style={s.cardEligibility}>
                    <span style={s.eligLabel}>📋 Eligibility:</span>
                    <span style={s.eligText}>CGPA ≥ 7.0 · No disciplinary cases · 75% attendance</span>
                  </div>
                  <button
                    style={{ ...s.applyBtn, ...(el.status !== 'active' ? s.applyBtnDisabled : {}) }}
                    onClick={() => el.status === 'active' && handleApply(el)}
                    disabled={el.status !== 'active'}
                  >
                    {el.status === 'active' ? 'Apply Now →' : 'Coming Soon'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── APPLICATION FORM ── */}
        {view === 'apply' && (
          <div style={s.formWrap}>
            {selectedElection && (
              <div style={s.selectedBanner}>
                <span style={s.selectedIcon}>🗳️</span>
                <div>
                  <div style={s.selectedName}>{selectedElection.name}</div>
                  <div style={s.selectedPos}>{selectedElection.position} · {selectedElection.department}</div>
                </div>
                <button style={s.changBtn} onClick={() => setView('browse')}>Change</button>
              </div>
            )}

            {!selectedElection && (
              <div style={s.noElection}>
                <p>Please select an election first.</p>
                <button style={s.applyBtn} onClick={() => setView('browse')}>Browse Elections</button>
              </div>
            )}

            {selectedElection && (
              <div style={s.formGrid}>
                <div style={s.formLeft}>
                  <h3 style={s.formSectionTitle}>📝 Registration Form</h3>
                  <form onSubmit={handleSubmit}>
                    <div style={s.fieldGrid}>
                      <div style={s.field}>
                        <label style={s.label}>Full Name *</label>
                        <input style={s.input} required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Arjun Mehta" />
                      </div>
                      <div style={s.field}>
                        <label style={s.label}>Student ID *</label>
                        <input style={s.input} required value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} placeholder="e.g. 2024CS1042" />
                      </div>
                      <div style={s.field}>
                        <label style={s.label}>Department *</label>
                        <select style={s.input} required value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                          <option value="">Select Department</option>
                          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div style={s.field}>
                        <label style={s.label}>Year *</label>
                        <select style={s.input} required value={form.year} onChange={e => setForm({ ...form, year: e.target.value })}>
                          <option value="">Select Year</option>
                          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                      <div style={s.field}>
                        <label style={s.label}>Current CGPA *</label>
                        <input style={s.input} type="number" step="0.01" min="0" max="10" required value={form.cgpa} onChange={e => setForm({ ...form, cgpa: e.target.value })} placeholder="e.g. 8.5" />
                      </div>
                      <div style={s.field}>
                        <label style={s.label}>Phone Number</label>
                        <input style={s.input} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
                      </div>
                      <div style={s.field}>
                        <label style={s.label}>Email *</label>
                        <input style={s.input} type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="arjun@university.edu" />
                      </div>
                    </div>
                    <div style={{ ...s.field, marginTop: 16 }}>
                      <label style={s.label}>Campaign Manifesto *</label>
                      <textarea
                        style={{ ...s.input, minHeight: 120, resize: 'vertical' }}
                        required
                        value={form.manifesto}
                        onChange={e => setForm({ ...form, manifesto: e.target.value })}
                        placeholder="Describe your vision, goals, and what you plan to achieve if elected..."
                      />
                    </div>
                    <button
                      type="submit"
                      style={{ ...s.submitBtn, ...((!allEligible || submitting) ? s.submitDisabled : {}) }}
                      disabled={!allEligible || submitting}
                    >
                      {submitting ? '⏳ Submitting...' : allEligible ? '🚀 Submit Application' : '❌ Eligibility Not Met'}
                    </button>
                  </form>
                </div>

                {/* Eligibility Panel */}
                <div style={s.formRight}>
                  <h3 style={s.formSectionTitle}>✅ Eligibility Check</h3>
                  <div style={s.eligPanel}>
                    {ELIGIBILITY.map(req => {
                      const met = eligibility[req.key]
                      const pending = met === undefined
                      return (
                        <div key={req.key} style={{ ...s.eligRow, ...(met === false ? s.eligFail : met ? s.eligPass : {}) }}>
                          <span style={s.eligIcon}>{pending ? '⏳' : met ? '✅' : '❌'}</span>
                          <span style={s.eligText2}>{req.label}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div style={s.eligSummary}>
                    {allEligible
                      ? <span style={s.eligSumPass}>🎉 All criteria met! You can submit.</span>
                      : <span style={s.eligSumPend}>Fill in your details above to check eligibility.</span>
                    }
                  </div>

                  <div style={s.infoBox}>
                    <h4 style={s.infoTitle}>📌 Important Notes</h4>
                    <ul style={s.infoList}>
                      <li>Applications are reviewed within 48 hours</li>
                      <li>You may apply for only one position per election cycle</li>
                      <li>False information will lead to disqualification</li>
                      <li>Campaign period starts after approval</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── APPLICATION STATUS ── */}
        {view === 'status' && (
          <div>
            {applications.length === 0 ? (
              <div style={s.emptyState}>
                <div style={s.emptyIcon}>📭</div>
                <h3 style={s.emptyTitle}>No Applications Yet</h3>
                <p style={s.emptyText}>You haven't applied for any positions. Browse available elections to get started!</p>
                <button style={s.applyBtn} onClick={() => setView('browse')}>Browse Elections →</button>
              </div>
            ) : (
              <div style={s.appList}>
                {applications.map((app, i) => (
                  <div key={app.id} style={s.appCard}>
                    <div style={s.appHeader}>
                      <div>
                        <h3 style={s.appTitle}>{app.election.name}</h3>
                        <p style={s.appMeta}>{app.election.position} · {app.election.department}</p>
                      </div>
                      <div style={{ ...s.appStatus, ...(app.status === 'pending' ? s.appStatusPending : app.status === 'approved' ? s.appStatusApproved : s.appStatusRejected) }}>
                        {app.status === 'pending' ? '⏳ Under Review' : app.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                      </div>
                    </div>
                    <div style={s.appDetails}>
                      <span>👤 {app.name}</span>
                      <span>🆔 {app.studentId}</span>
                      <span>🏫 {app.department}</span>
                      <span>📅 Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                    </div>
                    <div style={s.appTimeline}>
                      {['Submitted', 'Under Review', 'Approved'].map((step, si) => (
                        <div key={step} style={s.timelineStep}>
                          <div style={{ ...s.timelineDot, ...(si === 0 ? s.timelineDotDone : {}) }} />
                          <span style={{ ...s.timelineLabel, ...(si === 0 ? { color: '#10b981' } : {}) }}>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Styles ── */
const s = {
  wrap: { flex: 1, display: 'flex', flexDirection: 'column', background: '#FAFAFA', color: '#1D1136', fontFamily: "'Inter', 'DM Sans', sans-serif", overflow: 'auto', minHeight: '100vh' },
  header: { padding: '32px 40px 24px', borderBottom: '1px solid #EDE9FE', background: 'linear-gradient(135deg, rgba(115,93,255,0.06), rgba(255,75,108,0.04), rgba(255,213,34,0.03))' },
  title: { fontSize: 28, fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #735DFF, #FF4B6C, #FFD522)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { fontSize: 14, color: '#5B5480', margin: '6px 0 0' },
  tabs: { display: 'flex', gap: 8, marginTop: 20 },
  tab: { padding: '10px 20px', borderRadius: 100, background: '#FFFFFF', border: '1px solid #EDE9FE', color: '#5B5480', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all .2s', fontFamily: 'inherit', boxShadow: '0 1px 3px rgba(29,17,54,0.04)' },
  tabActive: { background: 'linear-gradient(135deg, #735DFF, #FF4B6C)', borderColor: 'transparent', color: '#FFFFFF', boxShadow: '0 4px 16px rgba(115,93,255,0.25)' },
  tabBadge: { background: 'rgba(255,213,34,0.3)', color: '#1D1136', padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700 },
  content: { flex: 1, padding: '28px 40px' },

  // Filter
  filterRow: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 },
  filterSelect: { padding: '10px 16px', borderRadius: 12, border: '1px solid #EDE9FE', background: '#FFFFFF', color: '#1D1136', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', boxShadow: '0 1px 3px rgba(29,17,54,0.04)' },
  filterCount: { fontSize: 13, color: '#5B5480' },

  // Cards grid
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 },
  card: { background: '#FFFFFF', border: '1px solid #EDE9FE', borderRadius: 20, padding: 24, transition: 'all .25s', cursor: 'default', boxShadow: '0 2px 8px rgba(29,17,54,0.04)' },
  cardHover: { border: '1px solid rgba(255,75,108,0.3)', background: '#FFFFFF', transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(255,75,108,0.12)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  statusBadge: { padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600 },
  badgeActive: { background: 'rgba(34,197,94,0.1)', color: '#16a34a' },
  badgeUpcoming: { background: 'rgba(255,213,34,0.15)', color: '#b8860b' },
  deadline: { fontSize: 11, color: '#9F97C0' },
  cardTitle: { fontSize: 17, fontWeight: 700, margin: '0 0 12px', color: '#1D1136' },
  cardMeta: { display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  metaTag: { fontSize: 12, color: '#5B5480', background: '#F5F3FF', padding: '4px 12px', borderRadius: 100, border: '1px solid #EDE9FE' },
  cardEligibility: { background: '#FFF9E6', borderRadius: 12, padding: '10px 14px', marginBottom: 16, border: '1px solid rgba(255,213,34,0.2)' },
  eligLabel: { fontSize: 11, fontWeight: 700, color: '#b8860b' },
  eligText: { fontSize: 11, color: '#5B5480', display: 'block', marginTop: 4 },
  applyBtn: { width: '100%', padding: '12px', borderRadius: 100, border: 'none', background: 'linear-gradient(135deg, #FF4B6C, #735DFF)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all .25s', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(255,75,108,0.25)' },
  applyBtnDisabled: { opacity: 0.4, cursor: 'not-allowed', background: '#D4CEEC', boxShadow: 'none' },

  // Form
  formWrap: { maxWidth: 1100 },
  selectedBanner: { display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(135deg, rgba(115,93,255,0.06), rgba(255,75,108,0.04))', border: '1px solid #EDE9FE', borderRadius: 16, padding: '16px 20px', marginBottom: 28 },
  selectedIcon: { fontSize: 28 },
  selectedName: { fontSize: 16, fontWeight: 700, color: '#1D1136' },
  selectedPos: { fontSize: 12, color: '#5B5480', marginTop: 2 },
  changBtn: { marginLeft: 'auto', padding: '8px 18px', borderRadius: 100, background: '#FFFFFF', border: '1px solid #EDE9FE', color: '#5B5480', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' },
  noElection: { textAlign: 'center', padding: 60, color: '#5B5480' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28 },
  formLeft: {},
  formRight: {},
  formSectionTitle: { fontSize: 16, fontWeight: 700, margin: '0 0 18px', color: '#1D1136' },
  fieldGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  field: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 12, fontWeight: 600, color: '#5B5480', marginBottom: 6 },
  input: { padding: '12px 16px', borderRadius: 12, border: '1px solid #EDE9FE', background: '#FFFFFF', color: '#1D1136', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', transition: 'border .2s, box-shadow .2s', width: '100%' },
  submitBtn: { marginTop: 24, width: '100%', padding: '14px', borderRadius: 100, border: 'none', background: 'linear-gradient(135deg, #FF4B6C, #735DFF)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all .25s', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(255,75,108,0.25)' },
  submitDisabled: { opacity: 0.5, cursor: 'not-allowed' },

  // Eligibility panel
  eligPanel: { display: 'flex', flexDirection: 'column', gap: 8 },
  eligRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, background: '#FFFFFF', border: '1px solid #EDE9FE', transition: 'all .2s' },
  eligPass: { borderColor: 'rgba(34,197,94,0.25)', background: 'rgba(34,197,94,0.06)' },
  eligFail: { borderColor: 'rgba(255,75,108,0.25)', background: 'rgba(255,75,108,0.06)' },
  eligIcon: { fontSize: 16 },
  eligText2: { fontSize: 13, color: '#1D1136' },
  eligSummary: { marginTop: 16, padding: '12px 14px', borderRadius: 12, background: '#F5F3FF' },
  eligSumPass: { color: '#16a34a', fontSize: 13, fontWeight: 600 },
  eligSumPend: { color: '#5B5480', fontSize: 13 },
  infoBox: { marginTop: 20, padding: '16px', borderRadius: 16, background: '#FFF9E6', border: '1px solid rgba(255,213,34,0.25)' },
  infoTitle: { fontSize: 13, fontWeight: 700, margin: '0 0 10px', color: '#b8860b' },
  infoList: { margin: 0, padding: '0 0 0 18px', fontSize: 12, color: '#5B5480', lineHeight: 1.8 },

  // Empty state
  emptyState: { textAlign: 'center', padding: '80px 40px' },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: 700, margin: '0 0 8px', color: '#1D1136' },
  emptyText: { fontSize: 14, color: '#5B5480', marginBottom: 24 },

  // Application list
  appList: { display: 'flex', flexDirection: 'column', gap: 16 },
  appCard: { background: '#FFFFFF', border: '1px solid #EDE9FE', borderRadius: 20, padding: 24, boxShadow: '0 2px 8px rgba(29,17,54,0.04)' },
  appHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  appTitle: { fontSize: 17, fontWeight: 700, margin: 0, color: '#1D1136' },
  appMeta: { fontSize: 12, color: '#5B5480', margin: '4px 0 0' },
  appStatus: { padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700 },
  appStatusPending: { background: 'rgba(255,213,34,0.15)', color: '#b8860b' },
  appStatusApproved: { background: 'rgba(34,197,94,0.1)', color: '#16a34a' },
  appStatusRejected: { background: 'rgba(255,75,108,0.1)', color: '#FF4B6C' },
  appDetails: { display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13, color: '#5B5480', marginBottom: 16 },
  appTimeline: { display: 'flex', alignItems: 'center', gap: 4 },
  timelineStep: { display: 'flex', alignItems: 'center', gap: 6, flex: 1 },
  timelineDot: { width: 10, height: 10, borderRadius: '50%', background: '#EDE9FE', border: '2px solid #D4CEEC' },
  timelineDotDone: { background: '#22C55E', borderColor: '#22C55E' },
  timelineLabel: { fontSize: 11, color: '#9F97C0' },
}
