import { useState, useEffect } from 'react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const MOCK_MODE = import.meta.env.VITE_MOCK_MODE !== 'false'

const MOCK_RESULTS = {
    election: { totalVoters: 2120000, totalVotesCast: 1236567 },
    blockchainResults: {
        'Candidate A - Party X': 523400,
        'Candidate B - Party Y': 412300,
        'Candidate C - Party Z': 300867,
    },
}

const SPARKLINE_DATA_UP = [
    { v: 20 }, { v: 35 }, { v: 25 }, { v: 45 }, { v: 38 }, { v: 55 }, { v: 48 }, { v: 62 }, { v: 58 }, { v: 70 }, { v: 65 }, { v: 78 },
]
const SPARKLINE_DATA_DOWN = [
    { v: 70 }, { v: 65 }, { v: 72 }, { v: 55 }, { v: 60 }, { v: 45 }, { v: 50 }, { v: 38 }, { v: 42 }, { v: 30 }, { v: 35 }, { v: 25 },
]
const SPARKLINE_DATA_FLAT = [
    { v: 40 }, { v: 45 }, { v: 38 }, { v: 50 }, { v: 42 }, { v: 48 }, { v: 44 }, { v: 52 }, { v: 46 }, { v: 50 }, { v: 48 }, { v: 51 },
]
const SPARKLINE_DATA_VOLATILE = [
    { v: 30 }, { v: 55 }, { v: 25 }, { v: 60 }, { v: 35 }, { v: 70 }, { v: 40 }, { v: 65 }, { v: 30 }, { v: 58 }, { v: 45 }, { v: 72 },
]

const AUDIT_LOG = [
    { time: '14:32:08', event: 'Vote batch verified', region: 'North District', status: 'success' },
    { time: '14:31:55', event: 'New booth online', region: 'East District', status: 'info' },
    { time: '14:31:12', event: 'Anomaly flagged', region: 'South District', status: 'warning' },
    { time: '14:30:45', event: 'Blockchain sync complete', region: 'All Regions', status: 'success' },
    { time: '14:29:33', event: 'Vote batch verified', region: 'West District', status: 'success' },
]

const CANDIDATE_COLORS = ['#7c5cfc', '#4e8eff', '#22d3ee', '#fb923c', '#34d399']

/* ─── Sidebar Icon Components ─── */
const IconDashboard = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
)
const IconElection = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
)
const IconCandidates = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
)
const IconRegions = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
)
const IconAudit = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
)
const IconReports = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
)
const IconSettings = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
)
const IconSearch = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
)
const IconBell = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
)
const IconShield = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
)
const IconArrowUp = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
)
const IconArrowDown = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
)

/* ─── Sparkline Component ─── */
function Sparkline({ data, color, height = 40 }) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#grad-${color.replace('#', '')})`} dot={false} />
            </AreaChart>
        </ResponsiveContainer>
    )
}

/* ─── Main App ─── */
function App() {
    const [results, setResults] = useState(null)
    const [stats, setStats] = useState({ totalVoters: 0, votesCast: 0, turnout: 0 })
    const [loading, setLoading] = useState(true)
    const [electionId] = useState('d290f1ee-6c54-4b01-90e6-d701748f0851')
    const [activeNav, setActiveNav] = useState('Dashboard')
    const [activeTab, setActiveTab] = useState('Overview')
    const [timeFilter, setTimeFilter] = useState('24H')
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        fetchResults()
        const dataInterval = setInterval(fetchResults, 5000)
        const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => { clearInterval(dataInterval); clearInterval(clockInterval) }
    }, [electionId])

    const fetchResults = async () => {
        if (MOCK_MODE) {
            setResults(MOCK_RESULTS)
            const e = MOCK_RESULTS.election
            const turnout = e.totalVoters > 0 ? ((e.totalVotesCast / e.totalVoters) * 100).toFixed(2) : 0
            setStats({ totalVoters: e.totalVoters, votesCast: e.totalVotesCast, turnout })
            setLoading(false)
            return
        }
        try {
            const response = await axios.get(`${API_BASE}/api/v1/votes/results/${electionId}`)
            setResults(response.data)
            const e = response.data.election
            if (e) {
                const turnout = e.totalVoters > 0 ? ((e.totalVotesCast / e.totalVoters) * 100).toFixed(2) : 0
                setStats({ totalVoters: e.totalVoters, votesCast: e.totalVotesCast, turnout })
            }
            setLoading(false)
        } catch (error) {
            console.error('Failed to fetch results:', error)
            setLoading(false)
        }
    }

    const prepareChartData = () => {
        if (!results?.blockchainResults) return []
        return Object.entries(results.blockchainResults).map(([name, votes]) => ({
            name: name.split(' - ')[0],
            fullName: name,
            votes,
        }))
    }

    const totalVotes = prepareChartData().reduce((s, c) => s + c.votes, 0)

    const navItems = [
        { name: 'Dashboard', icon: <IconDashboard /> },
        { name: 'Elections', icon: <IconElection /> },
        { name: 'Candidates', icon: <IconCandidates /> },
        { name: 'Regions', icon: <IconRegions /> },
        { name: 'Audit Log', icon: <IconAudit /> },
        { name: 'Reports', icon: <IconReports /> },
    ]

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-950">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-accent-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted text-sm">Loading election data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen overflow-hidden bg-dark-950">
            {/* ─── Sidebar ─── */}
            <aside className="w-[220px] flex-shrink-0 bg-dark-900 border-r border-dark-700/50 flex flex-col">
                {/* Logo */}
                <div className="px-5 py-6 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl gradient-card flex items-center justify-center">
                        <IconShield />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-tight">ElectWatch</h1>
                        <p className="text-[10px] text-muted">Observer Portal</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 space-y-1 mt-2">
                    <p className="text-[10px] uppercase tracking-widest text-muted/60 px-4 mb-2">Menu</p>
                    {navItems.map(item => (
                        <div
                            key={item.name}
                            className={`sidebar-item ${activeNav === item.name ? 'active' : ''}`}
                            onClick={() => setActiveNav(item.name)}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </div>
                    ))}
                </nav>

                {/* Sidebar bottom */}
                <div className="px-3 pb-4 space-y-1">
                    <div className="sidebar-item" onClick={() => setActiveNav('Settings')}>
                        <IconSettings />
                        <span>Settings</span>
                    </div>
                    <div className="mx-2 my-3 h-px bg-dark-600/50" />
                    <div className="flex items-center gap-3 px-4 py-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center text-xs font-bold">
                            OB
                        </div>
                        <div>
                            <p className="text-xs font-semibold">Observer</p>
                            <p className="text-[10px] text-muted">Read-only</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ─── Main Content ─── */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="h-14 flex-shrink-0 border-b border-dark-700/50 flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-dark-800 rounded-xl px-3 py-2 w-64">
                            <IconSearch />
                            <input type="text" placeholder="Search elections, candidates..." className="bg-transparent text-sm text-white placeholder-muted outline-none flex-1" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-muted font-mono">{currentTime.toLocaleTimeString()}</span>
                        <div className="flex items-center gap-1.5 text-accent-green text-xs">
                            <span className="w-1.5 h-1.5 bg-accent-green rounded-full animate-pulse" />
                            Live
                        </div>
                        <button className="relative text-muted hover:text-white transition-colors">
                            <IconBell />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent-red rounded-full text-[8px] flex items-center justify-center">3</span>
                        </button>
                        <button className="btn-primary text-xs py-2">Export Report</button>
                    </div>
                </header>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* ─── Time filters + heading ─── */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">Election Overview</h2>
                            <p className="text-xs text-muted mt-0.5">Real-time monitoring &middot; Blockchain verified</p>
                        </div>
                        <div className="flex items-center gap-1 bg-dark-800 rounded-xl p-1">
                            {['1H', '6H', '24H', '7D'].map(t => (
                                <button key={t} className={`tab-btn ${timeFilter === t ? 'active' : ''}`} onClick={() => setTimeFilter(t)}>{t}</button>
                            ))}
                        </div>
                    </div>

                    {/* ─── Metric Cards Row ─── */}
                    <div className="grid grid-cols-4 gap-4">
                        {/* Card 1 - Voter Turnout */}
                        <div className="metric-card">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-muted">Voter Turnout</p>
                                <span className="tag bg-accent-green/15 text-accent-green flex items-center gap-1">
                                    <IconArrowUp /> +2.4%
                                </span>
                            </div>
                            <p className="text-2xl font-bold">{stats.turnout}%</p>
                            <Sparkline data={SPARKLINE_DATA_UP} color="#34d399" />
                        </div>

                        {/* Card 2 - Total Votes */}
                        <div className="metric-card">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-muted">Total Votes Cast</p>
                                <span className="tag bg-accent-blue/15 text-accent-blue flex items-center gap-1">
                                    <IconArrowUp /> +1.8%
                                </span>
                            </div>
                            <p className="text-2xl font-bold">{(stats.votesCast / 1000000).toFixed(2)}M</p>
                            <Sparkline data={SPARKLINE_DATA_FLAT} color="#4e8eff" />
                        </div>

                        {/* Card 3 - Registered Voters */}
                        <div className="metric-card">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-muted">Registered Voters</p>
                                <span className="tag bg-accent-purple/15 text-accent-purple flex items-center gap-1">
                                    <IconArrowUp /> +0.3%
                                </span>
                            </div>
                            <p className="text-2xl font-bold">{(stats.totalVoters / 1000000).toFixed(2)}M</p>
                            <Sparkline data={SPARKLINE_DATA_UP} color="#7c5cfc" />
                        </div>

                        {/* Card 4 - Active Booths */}
                        <div className="metric-card">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-muted">Flagged Anomalies</p>
                                <span className="tag bg-accent-red/15 text-accent-red flex items-center gap-1">
                                    <IconArrowDown /> -12%
                                </span>
                            </div>
                            <p className="text-2xl font-bold">7</p>
                            <Sparkline data={SPARKLINE_DATA_DOWN} color="#f87171" />
                        </div>
                    </div>

                    {/* ─── Main Grid: Charts + Promo ─── */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* Left: Charts area spanning 2 cols */}
                        <div className="col-span-2 space-y-4">
                            {/* Active Monitoring Card */}
                            <div className="glass-card p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold">Active Election Monitoring</h3>
                                    <div className="flex items-center gap-1 bg-dark-800 rounded-xl p-1">
                                        {['Overview', 'Candidates', 'Regions', 'Audit'].map(t => (
                                            <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
                                        ))}
                                    </div>
                                </div>

                                {/* Election detail card */}
                                <div className="bg-dark-750 rounded-2xl p-5 border border-dark-600/30">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl gradient-card flex items-center justify-center text-white font-bold text-sm">GE</div>
                                            <div>
                                                <h4 className="text-sm font-bold">General Election 2024</h4>
                                                <p className="text-[11px] text-muted">ID: {electionId.substring(0, 8)}... &middot; Blockchain Verified</p>
                                            </div>
                                        </div>
                                        <span className="tag bg-accent-green/15 text-accent-green">Active</span>
                                    </div>

                                    {/* Mini stats row */}
                                    <div className="grid grid-cols-4 gap-3">
                                        <div className="bg-dark-800 rounded-xl p-3">
                                            <p className="text-[10px] text-muted mb-1">Lead Candidate</p>
                                            <p className="text-sm font-bold text-accent-purple">Candidate A</p>
                                            <p className="text-[10px] text-accent-green">42.3% share</p>
                                        </div>
                                        <div className="bg-dark-800 rounded-xl p-3">
                                            <p className="text-[10px] text-muted mb-1">Active Booths</p>
                                            <p className="text-sm font-bold">1,247</p>
                                            <p className="text-[10px] text-accent-green">98.2% online</p>
                                        </div>
                                        <div className="bg-dark-800 rounded-xl p-3">
                                            <p className="text-[10px] text-muted mb-1">Avg. Vote Rate</p>
                                            <p className="text-sm font-bold">342/min</p>
                                            <p className="text-[10px] text-accent-blue">Steady</p>
                                        </div>
                                        <div className="bg-dark-800 rounded-xl p-3">
                                            <p className="text-[10px] text-muted mb-1">Integrity Score</p>
                                            <p className="text-sm font-bold text-accent-green">99.7%</p>
                                            <p className="text-[10px] text-accent-green">Excellent</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bar chart + Pie chart row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="glass-card p-5">
                                    <h3 className="text-sm font-bold mb-3">Votes by Candidate</h3>
                                    <ResponsiveContainer width="100%" height={180}>
                                        <BarChart data={prepareChartData()} barRadius={[6, 6, 0, 0]}>
                                            <XAxis dataKey="name" stroke="#6b6b8a" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis stroke="#6b6b8a" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#161628', border: '1px solid #2a2a45', borderRadius: '12px', fontSize: '12px' }}
                                                labelStyle={{ color: '#fff' }}
                                                cursor={{ fill: 'rgba(124,92,252,0.08)' }}
                                            />
                                            <Bar dataKey="votes" fill="#7c5cfc" radius={[6, 6, 0, 0]}>
                                                {prepareChartData().map((_, i) => (
                                                    <Cell key={i} fill={CANDIDATE_COLORS[i % CANDIDATE_COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="glass-card p-5">
                                    <h3 className="text-sm font-bold mb-3">Vote Distribution</h3>
                                    <div className="flex items-center gap-4">
                                        <ResponsiveContainer width="50%" height={160}>
                                            <PieChart>
                                                <Pie
                                                    data={prepareChartData()}
                                                    cx="50%" cy="50%"
                                                    innerRadius={40} outerRadius={65}
                                                    paddingAngle={3}
                                                    dataKey="votes"
                                                    stroke="none"
                                                >
                                                    {prepareChartData().map((_, i) => (
                                                        <Cell key={i} fill={CANDIDATE_COLORS[i % CANDIDATE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#161628', border: '1px solid #2a2a45', borderRadius: '12px', fontSize: '12px' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="space-y-2 flex-1">
                                            {prepareChartData().map((c, i) => (
                                                <div key={i} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CANDIDATE_COLORS[i] }} />
                                                        <span className="text-xs text-muted">{c.name}</span>
                                                    </div>
                                                    <span className="text-xs font-semibold">{totalVotes > 0 ? ((c.votes / totalVotes) * 100).toFixed(1) : 0}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right column */}
                        <div className="space-y-4">
                            {/* Promo / CTA card */}
                            <div className="gradient-card rounded-2xl p-5 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                                <div className="relative z-10">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                                        <IconShield />
                                    </div>
                                    <h3 className="text-base font-bold mb-1">Blockchain Verified</h3>
                                    <p className="text-xs text-white/70 mb-4 leading-relaxed">All vote records are cryptographically secured and immutable on the blockchain.</p>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="bg-white/20 rounded-lg px-3 py-1.5 font-semibold">99.7% Integrity</span>
                                        <span className="bg-white/20 rounded-lg px-3 py-1.5 font-semibold">0 Tampers</span>
                                    </div>
                                </div>
                            </div>

                            {/* Audit Log */}
                            <div className="glass-card p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold">Live Audit Log</h3>
                                    <span className="text-[10px] text-muted cursor-pointer hover:text-white transition-colors">View all</span>
                                </div>
                                <div className="space-y-2">
                                    {AUDIT_LOG.map((log, i) => (
                                        <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-dark-750/50 hover:bg-dark-700/50 transition-colors">
                                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                                                log.status === 'success' ? 'bg-accent-green' :
                                                log.status === 'warning' ? 'bg-accent-orange' : 'bg-accent-blue'
                                            }`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium">{log.event}</p>
                                                <p className="text-[10px] text-muted">{log.region}</p>
                                            </div>
                                            <span className="text-[10px] text-muted font-mono flex-shrink-0">{log.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─── Bottom Stats Row ─── */}
                    <div className="grid grid-cols-5 gap-3">
                        {[
                            { label: 'System Status', value: 'Online', color: 'text-accent-green' },
                            { label: 'Blockchain Sync', value: 'Synced', color: 'text-accent-green' },
                            { label: 'Network Latency', value: '24ms', color: 'text-accent-blue' },
                            { label: 'Pending Verifications', value: '12', color: 'text-accent-orange' },
                            { label: 'Last Block', value: '#4,821,093', color: 'text-white' },
                        ].map((item, i) => (
                            <div key={i} className="bg-dark-800/60 border border-dark-600/30 rounded-xl px-4 py-3 flex items-center justify-between">
                                <span className="text-[11px] text-muted">{item.label}</span>
                                <span className={`text-xs font-bold ${item.color}`}>{item.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="text-center text-[11px] text-muted/50 py-2">
                        Blockchain-verified results &middot; Read-only observer portal &middot; Refreshing every 5s
                    </div>
                </div>
            </main>
        </div>
    )
}

export default App
