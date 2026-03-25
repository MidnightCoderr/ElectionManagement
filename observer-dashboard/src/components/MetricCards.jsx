import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { SPARKLINE_DATA_UP, SPARKLINE_DATA_FLAT, SPARKLINE_DATA_DOWN } from '../data/mockData.js'

const IconArrowUp = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
)
const IconArrowDown = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
)

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

export default function MetricCards({ stats, timeFilter, onTimeFilterChange }) {
    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Election Overview</h2>
                    <p className="text-xs text-muted mt-0.5">Real-time monitoring &middot; Blockchain verified</p>
                </div>
                <div className="flex items-center gap-1 bg-dark-800 rounded-xl p-1">
                    {['1H', '6H', '24H', '7D'].map(t => (
                        <button key={t} className={`tab-btn ${timeFilter === t ? 'active' : ''}`} onClick={() => onTimeFilterChange(t)}>{t}</button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
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

                <div className="metric-card">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-muted">Total Votes Cast</p>
                        <span className="tag bg-accent-blue/15 text-accent-blue flex items-center gap-1">
                            <IconArrowUp /> +1.8%
                        </span>
                    </div>
                    <p className="text-2xl font-bold">{stats.votesCast.toLocaleString()}</p>
                    <Sparkline data={SPARKLINE_DATA_FLAT} color="#4e8eff" />
                </div>

                <div className="metric-card">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-muted">Registered Students</p>
                        <span className="tag bg-accent-purple/15 text-accent-purple flex items-center gap-1">
                            <IconArrowUp /> +0.3%
                        </span>
                    </div>
                    <p className="text-2xl font-bold">{stats.totalVoters.toLocaleString()}</p>
                    <Sparkline data={SPARKLINE_DATA_UP} color="#7c5cfc" />
                </div>

                <div className="metric-card">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-muted">Flagged Anomalies</p>
                        <span className="tag bg-accent-red/15 text-accent-red flex items-center gap-1">
                            <IconArrowDown /> -12%
                        </span>
                    </div>
                    <p className="text-2xl font-bold">3</p>
                    <Sparkline data={SPARKLINE_DATA_DOWN} color="#f87171" />
                </div>
            </div>
        </>
    )
}
