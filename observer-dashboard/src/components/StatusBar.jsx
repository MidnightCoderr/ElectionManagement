export default function StatusBar() {
    return (
        <>
            <div className="grid grid-cols-5 gap-3">
                {[
                    { label: 'System Status', value: 'Online', color: 'text-accent-green' },
                    { label: 'Blockchain Sync', value: 'Synced', color: 'text-accent-green' },
                    { label: 'Network Latency', value: '24ms', color: 'text-accent-blue' },
                    { label: 'Pending Verifications', value: '4', color: 'text-accent-orange' },
                    { label: 'Last Block', value: '#892', color: 'text-white' },
                ].map((item, i) => (
                    <div key={i} className="bg-dark-800/60 border border-dark-600/30 rounded-xl px-4 py-3 flex items-center justify-between">
                        <span className="text-[11px] text-muted">{item.label}</span>
                        <span className={`text-xs font-bold ${item.color}`}>{item.value}</span>
                    </div>
                ))}
            </div>

            <div className="text-center text-[11px] text-muted/50 py-2">
                Blockchain-verified results &middot; Read-only observer portal &middot; Refreshing every 5s
            </div>
        </>
    )
}
