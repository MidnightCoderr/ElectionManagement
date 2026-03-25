import './Sidebar.css'

const NAV = [
  {
    section: 'Main',
    items: [
      { id: 'dashboard',  icon: '📊', label: 'Dashboard' },
      { id: 'elections',  icon: '🗳',  label: 'Elections' },
      { id: 'candidates', icon: '👤', label: 'Candidates' },
      { id: 'voters',     icon: '📋', label: 'Voters',     badge: '12K', badgeColor: 'blue' },
    ],
  },
  {
    section: 'Operations',
    items: [
      { id: 'alerts',     icon: '🚨', label: 'Alerts',      badge: '5',  badgeColor: '' },
    ],
  },
  {
    section: 'System',
    items: [
      { id: 'users',      icon: '👥', label: 'Admin Users' },
      { id: 'settings',   icon: '⚙',  label: 'Settings' },
      { id: 'logs',       icon: '🔍', label: 'System Logs' },
    ],
  },
]

export default function Sidebar({ activePage, onNavigate, admin }) {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">☸</div>
        <div className="sidebar-brand-text">
          <div className="top">Student Election Board</div>
          <div className="bottom">Admin Portal</div>
        </div>
      </div>

      {/* Nav */}
      {NAV.map(({ section, items }) => (
        <div className="sidebar-section" key={section}>
          <div className="sidebar-section-label">{section}</div>
          {items.map(item => (
            <button
              key={item.id}
              className={`sidebar-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="item-icon">{item.icon}</span>
              <span className="item-label">{item.label}</span>
              {item.badge && (
                <span className={`item-badge ${item.badgeColor || ''}`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      ))}

      {/* User card */}
      <div className="sidebar-user">
        <div className="sidebar-avatar">👤</div>
        <div>
          <div className="sidebar-user-name">{admin?.name || 'Admin User'}</div>
          <div className="sidebar-user-role">{admin?.role || 'Super Admin'}</div>
        </div>
        <button
          className="sidebar-logout-btn"
          title="Logout"
          onClick={() => onNavigate('logout')}
        >
          ↩
        </button>
      </div>
    </aside>
  )
}
