import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { CANDIDATE_COLORS } from '../data/mockData.js'

const IconShield = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
)

export default function LiveResults({ chartData, totalVotes, electionId, activeTab, onTabChange }) {
    return (
        <div className="col-span-2 space-y-4">
            {/* Active Monitoring Card */}
            <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold">Active Election Monitoring</h3>
                    <div className="flex items-center gap-1 bg-dark-800 rounded-xl p-1">
                        {['Overview', 'Candidates', 'Departments', 'Audit'].map(t => (
                            <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => onTabChange(t)}>{t}</button>
                        ))}
                    </div>
                </div>

                {/* Election detail card */}
                <div className="bg-dark-750 rounded-2xl p-5 border border-dark-600/30">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl gradient-card flex items-center justify-center text-white font-bold text-sm">SC</div>
                            <div>
                                <h4 className="text-sm font-bold">Student Council Election 2026</h4>
                                <p className="text-[11px] text-muted">ID: {electionId.substring(0, 8)}... &middot; Blockchain Verified</p>
                            </div>
                        </div>
                        <span className="tag bg-accent-green/15 text-accent-green">Active</span>
                    </div>

                    {/* Mini stats row */}
                    <div className="grid grid-cols-4 gap-3">
                        <div className="bg-dark-800 rounded-xl p-3">
                            <p className="text-[10px] text-muted mb-1">Lead Candidate</p>
                            <p className="text-sm font-bold text-accent-purple">Arjun Mehta</p>
                            <p className="text-[10px] text-accent-green">43.3% share</p>
                        </div>
                        <div className="bg-dark-800 rounded-xl p-3">
                            <p className="text-[10px] text-muted mb-1">Active Booths</p>
                            <p className="text-sm font-bold">12</p>
                            <p className="text-[10px] text-accent-green">100% online</p>
                        </div>
                        <div className="bg-dark-800 rounded-xl p-3">
                            <p className="text-[10px] text-muted mb-1">Avg. Vote Rate</p>
                            <p className="text-sm font-bold">18/min</p>
                            <p className="text-[10px] text-accent-blue">Steady</p>
                        </div>
                        <div className="bg-dark-800 rounded-xl p-3">
                            <p className="text-[10px] text-muted mb-1">Integrity Score</p>
                            <p className="text-sm font-bold text-accent-green">99.8%</p>
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
                        <BarChart data={chartData} barRadius={[6, 6, 0, 0]}>
                            <XAxis dataKey="name" stroke="#6b6b8a" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis stroke="#6b6b8a" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#161628', border: '1px solid #2a2a45', borderRadius: '12px', fontSize: '12px' }}
                                labelStyle={{ color: '#fff' }}
                                cursor={{ fill: 'rgba(124,92,252,0.08)' }}
                            />
                            <Bar dataKey="votes" fill="#7c5cfc" radius={[6, 6, 0, 0]}>
                                {chartData.map((_, i) => (
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
                                    data={chartData}
                                    cx="50%" cy="50%"
                                    innerRadius={40} outerRadius={65}
                                    paddingAngle={3}
                                    dataKey="votes"
                                    stroke="none"
                                >
                                    {chartData.map((_, i) => (
                                        <Cell key={i} fill={CANDIDATE_COLORS[i % CANDIDATE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#161628', border: '1px solid #2a2a45', borderRadius: '12px', fontSize: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2 flex-1">
                            {chartData.map((c, i) => (
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
    )
}
