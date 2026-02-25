import { useState, useEffect } from 'react';
import { achievementAPI } from '../api';

const rarityColors = {
    common: { bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.3)', text: '#9ca3af' },
    uncommon: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', text: '#22c55e' },
    rare: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', text: '#3b82f6' },
    epic: { bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)', text: '#a855f7' },
    legendary: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b' },
};

const categoryIcons = {
    quests: '⚔️', level: '⭐', wealth: '💰', debt: '💳',
    savings: '🛡️', investing: '📈', credit: '📊',
    mastery: '🧙', minigames: '🎮', social: '👥',
};

export default function Achievements() {
    const [achievements, setAchievements] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAchievements();
    }, []);

    const loadAchievements = async () => {
        try {
            const { data } = await achievementAPI.getAll();
            setAchievements(data.achievements || []);
        } catch (err) {
            console.error('Failed to load achievements:', err);
        } finally {
            setLoading(false);
        }
    };

    const categories = [...new Set(achievements.map(a => a.category))];
    const filtered = filter === 'all' ? achievements :
        filter === 'unlocked' ? achievements.filter(a => a.unlocked) :
            filter === 'locked' ? achievements.filter(a => !a.unlocked) :
                achievements.filter(a => a.category === filter);

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold text-accent-gold text-glow-gold flex items-center gap-3">
                        <span className="animate-float">🏆</span> Achievements
                    </h1>
                    <p className="text-text-secondary mt-1">
                        {unlockedCount} / {achievements.length} unlocked
                    </p>
                </div>

                {/* Progress */}
                <div className="glass-card px-4 py-3 flex items-center gap-3">
                    <div className="xp-bar w-32">
                        <div className="xp-bar-fill" style={{ width: `${(unlockedCount / achievements.length) * 100}%` }} />
                    </div>
                    <span className="font-mono text-sm text-accent-purple">
                        {Math.round((unlockedCount / achievements.length) * 100)}%
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {['all', 'unlocked', 'locked'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`stat-badge cursor-pointer capitalize transition-all ${filter === f ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/40'
                                : 'bg-bg-primary/30 text-text-secondary border border-border-dim'
                            }`}
                    >
                        {f}
                    </button>
                ))}
                <span className="text-text-muted self-center px-2">|</span>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(filter === cat ? 'all' : cat)}
                        className={`stat-badge cursor-pointer transition-all ${filter === cat ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/40'
                                : 'bg-bg-primary/30 text-text-secondary border border-border-dim'
                            }`}
                    >
                        {categoryIcons[cat] || '🎯'} {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((achievement, idx) => {
                    const rarity = rarityColors[achievement.rarity] || rarityColors.common;
                    return (
                        <div
                            key={achievement.id || idx}
                            className={`glass-card p-5 relative overflow-hidden transition-all ${achievement.unlocked ? '' : 'opacity-60'
                                }`}
                            style={{
                                borderColor: achievement.unlocked ? rarity.border : undefined,
                            }}
                        >
                            {/* Rarity glow */}
                            {achievement.unlocked && achievement.rarity === 'legendary' && (
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent animate-pulse-glow" />
                            )}

                            <div className="relative flex items-start gap-4">
                                <div className="text-4xl flex-shrink-0">
                                    {achievement.unlocked ? achievement.icon : '🔒'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <h3 className="font-semibold text-sm">{achievement.name}</h3>
                                        <span
                                            className="text-xs font-mono uppercase"
                                            style={{ color: rarity.text }}
                                        >
                                            {achievement.rarity}
                                        </span>
                                    </div>
                                    <p className="text-xs text-text-secondary mb-2">{achievement.description}</p>
                                    <div className="flex items-center gap-3 text-xs">
                                        {achievement.xp_bonus > 0 && (
                                            <span className="text-accent-purple font-mono">+{achievement.xp_bonus} XP</span>
                                        )}
                                        {achievement.gold_bonus > 0 && (
                                            <span className="text-accent-gold font-mono">+{achievement.gold_bonus} Gold</span>
                                        )}
                                    </div>
                                    {achievement.unlocked && achievement.unlocked_at && (
                                        <div className="text-xs text-text-muted mt-2">
                                            ✅ {new Date(achievement.unlocked_at).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="glass-card p-12 text-center">
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold mb-2">No achievements found</h3>
                    <p className="text-text-secondary">Try a different filter</p>
                </div>
            )}
        </div>
    );
}
