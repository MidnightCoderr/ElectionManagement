import { AUDIT_LOG } from '../data/mockData.js'

const IconShield = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
)

export default function AuditLog({ wsAlerts = [] }) {
    const combinedLog = wsAlerts.length > 0
        ? wsAlerts.map(a => ({
            time: new Date(a.timestamp).toLocaleTimeString(),
            event: a.message || a.type,
            region: a.department || 'System',
            status: a.severity === 'high' ? 'warning' : 'success'
        }))
        : AUDIT_LOG

    return (
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
                        <span className="bg-white/20 rounded-lg px-3 py-1.5 font-semibold">99.8% Integrity</span>
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
                    {combinedLog.map((log, i) => (
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
    )
}
