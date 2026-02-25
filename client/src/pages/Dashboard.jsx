import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { characterAPI, questAPI } from '../api';

function StatCard({ icon, label, value, color, sub }) {
    return (
        <div className="glass-card p-4 flex items-center gap-4">
            <div className={`text-3xl p-3 rounded-xl bg-${color}/10`}>{icon}</div>
            <div>
                <div className={`font-mono text-xl font-bold text-${color}`}>{value}</div>
                <div className="text-sm text-text-secondary">{label}</div>
                {sub && <div className="text-xs text-text-muted mt-0.5">{sub}</div>}
            </div>
        </div>
    );
}

function XPBar({ xp, xpToNext, level }) {
    const pct = xpToNext > 0 ? Math.min(100, (xp / xpToNext) * 100) : 100;
    return (
        <div>
            <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">Level {level}</span>
                <span className="font-mono text-accent-purple">{xp} / {xpToNext} XP</span>
            </div>
            <div className="xp-bar">
                <div className="xp-bar-fill" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function FinancialHealthMeter({ score }) {
    const getColor = (s) => {
        if (s >= 80) return '#00d68f';
        if (s >= 60) return '#f5c542';
        if (s >= 40) return '#ff9f43';
        return '#ef4444';
    };
    const getLabel = (s) => {
        if (s >= 80) return 'Excellent';
        if (s >= 60) return 'Good';
        if (s >= 40) return 'Fair';
        return 'Needs Work';
    };

    return (
        <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <circle
                        cx="50" cy="50" r="42" fill="none"
                        stroke={getColor(score)} strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${score * 2.64} ${264 - score * 2.64}`}
                        style={{ transition: 'stroke-dasharray 1s ease' }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono font-bold text-lg" style={{ color: getColor(score) }}>{score}</span>
                </div>
            </div>
            <div>
                <div className="font-semibold" style={{ color: getColor(score) }}>{getLabel(score)}</div>
                <div className="text-xs text-text-muted">Financial Health</div>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { character, refreshCharacter } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentQuests, setRecentQuests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            await refreshCharacter();
            const [statsRes, questsRes] = await Promise.all([
                characterAPI.getStats(),
                questAPI.getAll(),
            ]);
            setStats(statsRes.data);
            setRecentQuests(questsRes.data.quests?.slice(0, 4) || []);
        } catch (err) {
            console.error('Dashboard load error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !character) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="spinner" />
            </div>
        );
    }

    const financialHealth = stats?.financialHealth || 50;

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Hero Banner */}
            <div className="glass-card p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-gold/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="text-6xl animate-float">
                        {character.level >= 30 ? '👑' : character.level >= 15 ? '⚔️' : '🧙'}
                    </div>
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h1 className="font-display text-3xl font-bold text-accent-gold text-glow-gold">
                                {character.name}
                            </h1>
                            <span className="stat-badge bg-accent-purple/15 text-accent-purple border border-accent-purple/30">
                                {character.className || character.class}
                            </span>
                        </div>
                        <XPBar xp={character.xp} xpToNext={character.xp_to_next_level} level={character.level} />
                    </div>
                    <FinancialHealthMeter score={financialHealth} />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon="💰" label="Gold" value={parseFloat(character.gold).toLocaleString()} color="accent-gold" />
                <StatCard icon="💵" label="Income" value={`$${parseFloat(character.income).toLocaleString()}`} color="accent-emerald" />
                <StatCard icon="📊" label="Net Worth" value={`$${parseFloat(character.net_worth).toLocaleString()}`} color="accent-blue" />
                <StatCard icon="💳" label="Credit Score" value={character.credit_score} color="accent-purple" />
            </div>

            {/* RPG Stats + Financial Stats */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* RPG Stats */}
                <div className="glass-card p-6">
                    <h3 className="font-display text-lg font-bold text-accent-purple mb-4">⚔️ Hero Stats</h3>
                    <div className="space-y-3">
                        {[
                            { name: 'Wisdom', value: character.wisdom, max: 50, color: '#3b82f6' },
                            { name: 'Discipline', value: character.discipline, max: 50, color: '#00d68f' },
                            { name: 'Risk Tolerance', value: character.risk_tolerance, max: 50, color: '#ff9f43' },
                            { name: 'Negotiation', value: character.negotiation, max: 50, color: '#ec4899' },
                        ].map((stat) => (
                            <div key={stat.name}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-text-secondary">{stat.name}</span>
                                    <span className="font-mono" style={{ color: stat.color }}>{stat.value}</span>
                                </div>
                                <div className="health-bar">
                                    <div
                                        className="health-bar-fill"
                                        style={{
                                            width: `${(stat.value / stat.max) * 100}%`,
                                            background: `linear-gradient(90deg, ${stat.color}88, ${stat.color})`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Financial Stats */}
                <div className="glass-card p-6">
                    <h3 className="font-display text-lg font-bold text-accent-gold mb-4">💰 Financial Stats</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Emergency Fund', value: `$${parseFloat(character.emergency_fund).toLocaleString()}`, icon: '🛡️' },
                            { label: 'Investments', value: `$${parseFloat(character.investments).toLocaleString()}`, icon: '📈' },
                            { label: 'Debt', value: `$${parseFloat(character.debt).toLocaleString()}`, icon: '💳' },
                            { label: 'Savings Rate', value: `${character.savings_rate}%`, icon: '🏦' },
                            { label: 'Monthly Expenses', value: `$${parseFloat(character.monthly_expenses).toLocaleString()}`, icon: '📋' },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between py-2 border-b border-border-dim/30 last:border-0">
                                <div className="flex items-center gap-2">
                                    <span>{item.icon}</span>
                                    <span className="text-sm text-text-secondary">{item.label}</span>
                                </div>
                                <span className="font-mono font-semibold text-sm">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions + Recent Quests */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Quick Actions */}
                <div className="glass-card p-6">
                    <h3 className="font-display text-lg font-bold mb-4">🚀 Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { to: '/quests', label: 'Quest Board', icon: '⚔️', color: 'accent-purple' },
                            { to: '/arcade', label: 'Mini Games', icon: '🎮', color: 'accent-emerald' },
                            { to: '/achievements', label: 'Achievements', icon: '🏆', color: 'accent-gold' },
                            { to: '/leaderboard', label: 'Leaderboard', icon: '📊', color: 'accent-blue' },
                        ].map((action) => (
                            <Link
                                key={action.to}
                                to={action.to}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-bg-primary/30 border border-border-dim/50 hover:border-${action.color}/40 hover:bg-${action.color}/5 transition-all group`}
                            >
                                <span className="text-3xl group-hover:scale-110 transition-transform">{action.icon}</span>
                                <span className="text-sm text-text-secondary group-hover:text-text-primary">{action.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="glass-card p-6">
                    <h3 className="font-display text-lg font-bold mb-4">📜 Recent Activity</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {character.recentActivity?.length > 0 ? (
                            character.recentActivity.map((activity, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-bg-primary/30 transition-all">
                                    <span className="text-lg mt-0.5">
                                        {activity.action_type === 'quest_completed' ? '✅' :
                                            activity.action_type === 'achievement_unlocked' ? '🏆' :
                                                activity.action_type === 'quest_accepted' ? '📜' :
                                                    activity.action_type === 'minigame_played' ? '🎮' : '📝'}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm truncate">{activity.description}</div>
                                        <div className="text-xs text-text-muted">
                                            {activity.xp_gained > 0 && <span className="text-accent-purple">+{activity.xp_gained} XP </span>}
                                            {activity.gold_gained > 0 && <span className="text-accent-gold">+{activity.gold_gained} Gold</span>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-text-muted py-8">
                                <div className="text-3xl mb-2">🗺️</div>
                                <p>No activity yet. Start a quest!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quest Recommendations */}
            {recentQuests.length > 0 && (
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display text-lg font-bold">📜 Available Quests</h3>
                        <Link to="/quests" className="text-sm text-accent-purple hover:text-accent-gold transition-colors">
                            View All →
                        </Link>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {recentQuests.map((quest) => (
                            <Link
                                key={quest.id}
                                to={`/quests/${quest.id}`}
                                className="p-4 rounded-xl bg-bg-primary/30 border border-border-dim/50 hover:border-accent-purple/40 transition-all group"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span>{quest.category_icon}</span>
                                    <span className={`stat-badge badge-${quest.difficulty} !text-xs !py-0.5`}>
                                        {quest.difficulty}
                                    </span>
                                </div>
                                <h4 className="font-semibold text-sm mb-1 group-hover:text-accent-gold transition-colors">
                                    {quest.title}
                                </h4>
                                <div className="text-xs text-text-muted flex items-center gap-2">
                                    <span className="text-accent-purple">+{quest.xp_reward} XP</span>
                                    <span className="text-accent-gold">+{quest.gold_reward} Gold</span>
                                </div>
                                {quest.progress?.status === 'completed' && (
                                    <span className="mt-2 inline-block text-xs text-accent-emerald">✅ Completed</span>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
