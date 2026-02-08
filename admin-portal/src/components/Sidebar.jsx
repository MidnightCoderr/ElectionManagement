import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Vote,
    Users,
    BarChart3,
    Server,
    FileText,
    LogOut
} from 'lucide-react';
import './Sidebar.css';

function Sidebar({ user, onLogout, activePage }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate('/login');
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { id: 'elections', label: 'Elections', icon: Vote, path: '/elections' },
        { id: 'candidates', label: 'Candidates', icon: Users, path: '/candidates' },
        { id: 'results', label: 'Results', icon: BarChart3, path: '/results' },
        { id: 'terminals', label: 'Terminals', icon: Server, path: '/terminals' },
        { id: 'audit', label: 'Audit Logs', icon: FileText, path: '/audit' }
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2>🗳️ Admin Portal</h2>
                <p className="user-info">{user.username}</p>
                <span className="user-role">{user.role}</span>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map(item => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-button">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
