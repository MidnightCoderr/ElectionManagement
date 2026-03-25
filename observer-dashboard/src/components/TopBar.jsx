const IconSearch = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
)
const IconBell = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
)

export default function TopBar({ currentTime, connected }) {
    return (
        <header className="h-14 flex-shrink-0 border-b border-dark-700/50 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-dark-800 rounded-xl px-3 py-2 w-64">
                    <IconSearch />
                    <input type="text" placeholder="Search elections, candidates..." className="bg-transparent text-sm text-white placeholder-muted outline-none flex-1" />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-xs text-muted font-mono">{currentTime.toLocaleTimeString()}</span>
                <div className={`flex items-center gap-1.5 text-xs ${connected ? 'text-accent-green' : 'text-accent-orange'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-accent-green animate-pulse' : 'bg-accent-orange'}`} />
                    {connected ? 'Live' : 'Connecting...'}
                </div>
                <button className="relative text-muted hover:text-white transition-colors">
                    <IconBell />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent-red rounded-full text-[8px] flex items-center justify-center">3</span>
                </button>
                <button className="btn-primary text-xs py-2">Export Report</button>
            </div>
        </header>
    )
}
