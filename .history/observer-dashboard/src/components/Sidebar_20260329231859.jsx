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
const IconShield = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
)

const navItems = [
    { name: 'Dashboard', icon: <IconDashboard /> },
    { name: 'Elections', icon: <IconElection /> },
    { name: 'Candidates', icon: <IconCandidates /> },
    { name: 'Departments', icon: <IconRegions /> },
    { name: 'Reports', icon: <IconReports /> },
]

export default function ObserverSidebar({ activeNav, onNavChange }) {
    return (
        <aside className="w-[220px] flex-shrink-0 bg-dark-900 border-r border-dark-700/50 flex flex-col">
            {/* Logo */}
            <div className="px-5 py-6 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl gradient-card flex items-center justify-center">
                    <IconShield />
                </div>
                <div>
                    <h1 className="text-sm font-bold tracking-tight">CampusWatch</h1>
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
                        onClick={() => onNavChange(item.name)}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </div>
                ))}
            </nav>

            {/* Sidebar bottom */}
            <div className="px-3 pb-4 space-y-1">
                <div className="sidebar-item" onClick={() => onNavChange('Settings')}>
                    <IconSettings />
                    <span>Settings</span>
                </div>
                <div className="mx-2 my-3 h-px bg-dark-600/50" />
                <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-accent-purple text-white flex items-center justify-center text-xs font-bold">
                        OB
                    </div>
                    <div>
                        <p className="text-xs font-semibold">Observer</p>
                        <p className="text-[10px] text-muted">Read-only</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
