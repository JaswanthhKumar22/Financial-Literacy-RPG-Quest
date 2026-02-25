import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { questAPI } from '../api';

export default function QuestBoard() {
    const [quests, setQuests] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [activeDifficulty, setActiveDifficulty] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [questsRes, catRes] = await Promise.all([
                questAPI.getAll(),
                questAPI.getCategories(),
            ]);
            setQuests(questsRes.data.quests || []);
            setCategories(catRes.data.categories || []);
        } catch (err) {
            console.error('Failed to load quests:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredQuests = quests.filter((q) => {
        if (activeCategory && q.category_name !== activeCategory) return false;
        if (activeDifficulty && q.difficulty !== activeDifficulty) return false;
        return true;
    });

    const difficulties = ['beginner', 'intermediate', 'advanced', 'expert'];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold text-accent-gold text-glow-gold flex items-center gap-3">
                        <span className="animate-float">⚔️</span> Quest Board
                    </h1>
                    <p className="text-text-secondary mt-1">Choose your next financial adventure</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-muted">
                    <span className="text-accent-emerald font-mono">
                        {quests.filter(q => q.progress?.status === 'completed').length}
                    </span>
                    / {quests.length} completed
                </div>
            </div>

            {/* Category Filter */}
            <div className="glass-card p-4">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveCategory(null)}
                        className={`stat-badge cursor-pointer transition-all ${!activeCategory ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/40' : 'bg-bg-primary/30 text-text-secondary border border-border-dim'
                            }`}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
                            className={`stat-badge cursor-pointer transition-all ${activeCategory === cat.name ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/40' : 'bg-bg-primary/30 text-text-secondary border border-border-dim'
                                }`}
                        >
                            {cat.icon} {cat.name}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                    {difficulties.map((diff) => (
                        <button
                            key={diff}
                            onClick={() => setActiveDifficulty(activeDifficulty === diff ? null : diff)}
                            className={`stat-badge cursor-pointer transition-all badge-${diff} ${activeDifficulty === diff ? 'ring-2 ring-current' : 'opacity-70'
                                }`}
                        >
                            {diff}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quest Grid */}
            {filteredQuests.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold mb-2">No Quests Found</h3>
                    <p className="text-text-secondary">Try adjusting your filters</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredQuests.map((quest, idx) => {
                        const isLocked = quest.isLocked;
                        const isCompleted = quest.progress?.status === 'completed';

                        return (
                            <Link
                                key={quest.id}
                                to={isLocked ? '#' : `/quests/${quest.id}`}
                                className={`glass-card p-5 relative overflow-hidden group ${isLocked ? 'opacity-50 cursor-not-allowed' : ''
                                    } ${isCompleted ? 'border-accent-emerald/20' : ''}`}
                                style={{ animationDelay: `${idx * 0.05}s` }}
                                onClick={(e) => isLocked && e.preventDefault()}
                            >
                                {/* Category color accent */}
                                <div
                                    className="absolute top-0 right-0 w-24 h-24 opacity-10 rounded-bl-full"
                                    style={{ background: quest.category_color }}
                                />

                                {isCompleted && (
                                    <div className="absolute top-3 right-3 text-accent-emerald text-lg">✅</div>
                                )}
                                {isLocked && (
                                    <div className="absolute top-3 right-3 text-text-muted text-lg">🔒</div>
                                )}

                                {/* Header */}
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-2xl">{quest.category_icon}</span>
                                    <span className={`stat-badge badge-${quest.difficulty} !text-xs`}>
                                        {quest.difficulty}
                                    </span>
                                    {quest.min_level > 1 && (
                                        <span className="stat-badge bg-bg-primary/50 text-text-muted border border-border-dim text-xs">
                                            Lv.{quest.min_level}+
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <h3 className="font-semibold text-lg mb-2 group-hover:text-accent-gold transition-colors">
                                    {quest.title}
                                </h3>
                                <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                                    {quest.description}
                                </p>

                                {/* Rewards */}
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="flex items-center gap-1 text-accent-purple font-mono">
                                        ✨ {quest.xp_reward} XP
                                    </span>
                                    <span className="flex items-center gap-1 text-accent-gold font-mono">
                                        💰 {quest.gold_reward}
                                    </span>
                                </div>

                                {/* Score if completed */}
                                {quest.progress?.score != null && (
                                    <div className="mt-3 pt-3 border-t border-border-dim/30">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-text-muted">Score</span>
                                            <span className={`font-mono font-bold ${quest.progress.score >= 80 ? 'text-accent-emerald' :
                                                    quest.progress.score >= 60 ? 'text-accent-gold' : 'text-accent-red'
                                                }`}>
                                                {quest.progress.score}%
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
