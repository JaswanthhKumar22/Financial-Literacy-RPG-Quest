import { useState, useEffect } from 'react';
import { leaderboardAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const sortOptions = [
    { value: 'level', label: '⭐ Level', icon: '⭐' },
    { value: 'net_worth', label: '💰 Net Worth', icon: '💰' },
    { value: 'gold', label: '🪙 Gold Earned', icon: '🪙' },
    { value: 'quests', label: '⚔️ Quests', icon: '⚔️' },
];

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [sortBy, setSortBy] = useState('level');
    const [myRank, setMyRank] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        loadLeaderboard();
    }, [sortBy]);

    const loadLeaderboard = async () => {
        setLoading(true);
        try {
            const { data } = await leaderboardAPI.get({ sort: sortBy });
            setLeaderboard(data.leaderboard || []);
            setMyRank(data.myRank);
        } catch (err) {
            console.error('Failed to load leaderboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const getRankStyle = (rank) => {
        if (rank === 1) return { icon: '🥇', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' };
        if (rank === 2) return { icon: '🥈', bg: 'bg-gray-400/10', border: 'border-gray-400/30', text: 'text-gray-300' };
        if (rank === 3) return { icon: '🥉', bg: 'bg-amber-700/10', border: 'border-amber-700/30', text: 'text-amber-600' };
        return { icon: `#${rank}`, bg: '', border: 'border-border-dim/30', text: 'text-text-muted' };
    };

    const getSortValue = (entry) => {
        switch (sortBy) {
            case 'level': return `Lv.${entry.level}`;
            case 'net_worth': return `$${parseFloat(entry.net_worth).toLocaleString()}`;
            case 'gold': return `${parseFloat(entry.total_gold_earned).toLocaleString()} gold`;
            case 'quests': return `${entry.total_quests_completed} quests`;
            default: return '';
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold text-accent-gold text-glow-gold flex items-center gap-3">
                        <span className="animate-float">📊</span> Leaderboard
                    </h1>
                    <p className="text-text-secondary mt-1">
                        {myRank ? `Your rank: #${myRank}` : 'Global rankings'}
                    </p>
                </div>
            </div>

            {/* Sort Options */}
            <div className="glass-card p-4">
                <div className="flex flex-wrap gap-2">
                    {sortOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setSortBy(option.value)}
                            className={`stat-badge cursor-pointer transition-all ${sortBy === option.value
                                    ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/40'
                                    : 'bg-bg-primary/30 text-text-secondary border border-border-dim'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="spinner" />
                </div>
            ) : leaderboard.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div className="text-5xl mb-4">🏆</div>
                    <h3 className="text-xl font-bold mb-2">No Rankings Yet</h3>
                    <p className="text-text-secondary">Be the first to climb the leaderboard!</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {leaderboard.map((entry, idx) => {
                        const rank = parseInt(entry.rank);
                        const style = getRankStyle(rank);
                        const isMe = entry.username === user?.username;

                        return (
                            <div
                                key={entry.id}
                                className={`glass-card p-4 flex items-center gap-4 ${style.bg} border ${style.border} ${isMe ? 'ring-2 ring-accent-purple/40' : ''
                                    }`}
                                style={{ animationDelay: `${idx * 0.03}s` }}
                            >
                                {/* Rank */}
                                <div className={`w-12 text-center font-display font-bold text-lg ${style.text}`}>
                                    {rank <= 3 ? style.icon : rank}
                                </div>

                                {/* Avatar + Name */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold truncate">
                                            {entry.name}
                                            {isMe && <span className="text-accent-purple text-xs ml-1">(You)</span>}
                                        </span>
                                        <span className="stat-badge bg-accent-purple/10 text-accent-purple border border-accent-purple/20 !text-xs !py-0">
                                            {entry.class}
                                        </span>
                                    </div>
                                    <div className="text-xs text-text-muted">@{entry.username}</div>
                                </div>

                                {/* Stats */}
                                <div className="hidden sm:flex items-center gap-4 text-sm">
                                    <span className="font-mono text-accent-purple">Lv.{entry.level}</span>
                                    <span className="font-mono text-accent-gold">{parseFloat(entry.gold).toLocaleString()}g</span>
                                    <span className="text-text-muted">{entry.achievement_count} 🏆</span>
                                </div>

                                {/* Sort Value */}
                                <div className="text-right">
                                    <div className="font-mono font-bold text-accent-gold">{getSortValue(entry)}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
