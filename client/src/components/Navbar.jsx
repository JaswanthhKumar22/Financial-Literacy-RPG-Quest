import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏰' },
    { path: '/quests', label: 'Quests', icon: '⚔️' },
    { path: '/arcade', label: 'Arcade', icon: '🎮' },
    { path: '/achievements', label: 'Awards', icon: '🏆' },
    { path: '/leaderboard', label: 'Rankings', icon: '📊' },
    { path: '/social', label: 'Social', icon: '👥' },
];

export default function Navbar() {
    const { user, character, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-bg-primary/80 border-b border-border-dim">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <NavLink to="/dashboard" className="flex items-center gap-3 group">
                    <span className="text-2xl group-hover:animate-float">⚔️</span>
                    <span className="font-display font-bold text-xl text-accent-gold text-glow-gold hidden sm:block">
                        FinQuest
                    </span>
                </NavLink>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center gap-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-link flex items-center gap-2 text-sm ${isActive ? 'active' : ''}`
                            }
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </div>

                {/* User Info */}
                <div className="flex items-center gap-4">
                    {character && (
                        <div className="hidden md:flex items-center gap-3 text-sm">
                            <span className="stat-badge bg-accent-purple/15 text-accent-purple border border-accent-purple/30">
                                Lv.{character.level}
                            </span>
                            <span className="stat-badge bg-accent-gold/15 text-accent-gold border border-accent-gold/30">
                                💰 {parseFloat(character.gold).toLocaleString()}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-text-secondary hidden sm:block">
                            {user?.username}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="text-sm px-3 py-1.5 rounded-lg border border-border-dim text-text-secondary hover:text-accent-red hover:border-accent-red/50 transition-all"
                        >
                            Logout
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="lg:hidden text-xl p-2"
                        id="mobile-menu-toggle"
                    >
                        {mobileOpen ? '✕' : '☰'}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            {mobileOpen && (
                <div className="lg:hidden absolute top-16 left-0 right-0 bg-bg-secondary/95 backdrop-blur-xl border-b border-border-dim animate-fadeIn">
                    <div className="p-4 flex flex-col gap-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileOpen(false)}
                                className={({ isActive }) =>
                                    `nav-link flex items-center gap-3 py-3 text-base ${isActive ? 'active' : ''}`
                                }
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}
