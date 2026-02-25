import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const classPreview = [
    { emoji: '🧙', name: 'Financial Apprentice', desc: 'Begin your journey into financial wisdom' },
    { emoji: '⚔️', name: 'Money Squire', desc: 'Level 5: Basic budgeting mastered' },
    { emoji: '🛡️', name: 'Savings Knight', desc: 'Level 15: Shield against financial storms' },
    { emoji: '🏰', name: 'Portfolio Architect', desc: 'Level 30: Build empires of wealth' },
    { emoji: '👑', name: 'Financial Grandmaster', desc: 'Level 45: Master of all realms' },
];

export default function CharacterCreation() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { createCharacter } = useAuth();
    const navigate = useNavigate();

    const handleCreate = async (e) => {
        e.preventDefault();
        if (name.trim().length < 2) {
            setError('Name must be at least 2 characters');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await createCharacter(name.trim());
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-animated" />

            <div className="w-full max-w-2xl">
                <div className="text-center mb-8 animate-fadeInUp">
                    <div className="text-7xl mb-4 animate-float">🧙</div>
                    <h1 className="font-display text-4xl font-bold text-accent-gold text-glow-gold mb-2">
                        Create Your Hero
                    </h1>
                    <p className="text-text-secondary text-lg">Choose a name and begin your financial quest</p>
                </div>

                <div className="glass-card p-8 mb-8 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleCreate} className="space-y-6">
                        <div>
                            <label className="block text-lg font-semibold mb-3">Character Name</label>
                            <input
                                id="character-name"
                                type="text"
                                value={name}
                                onChange={(e) => { setName(e.target.value); setError(''); }}
                                className="input-field text-lg py-4"
                                placeholder="Enter your hero's name..."
                                required
                                maxLength={100}
                                autoFocus
                            />
                        </div>

                        {/* Starting Stats Preview */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: 'Level', value: '1', icon: '⭐' },
                                { label: 'Gold', value: '500', icon: '💰' },
                                { label: 'Income', value: '$2,000', icon: '💵' },
                                { label: 'Credit', value: '650', icon: '💳' },
                            ].map((stat) => (
                                <div key={stat.label} className="text-center p-3 rounded-xl bg-bg-primary/50 border border-border-dim">
                                    <div className="text-2xl mb-1">{stat.icon}</div>
                                    <div className="font-mono text-lg font-bold text-accent-gold">{stat.value}</div>
                                    <div className="text-xs text-text-muted">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        <button
                            id="create-character-submit"
                            type="submit"
                            disabled={loading || name.trim().length < 2}
                            className="btn-gold w-full text-lg py-4 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><span className="spinner !w-5 !h-5" /> Creating Hero...</>
                            ) : (
                                <>⚔️ Begin Your Quest!</>
                            )}
                        </button>
                    </form>
                </div>

                {/* Class Progression Preview */}
                <div className="glass-card p-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    <h3 className="font-display text-lg font-bold text-accent-purple mb-4">Class Progression</h3>
                    <div className="grid gap-3">
                        {classPreview.map((cls, idx) => (
                            <div
                                key={cls.name}
                                className="flex items-center gap-3 p-3 rounded-xl bg-bg-primary/30 border border-border-dim/50"
                                style={{ animationDelay: `${0.3 + idx * 0.05}s` }}
                            >
                                <span className="text-3xl">{cls.emoji}</span>
                                <div>
                                    <div className="font-semibold text-sm">{cls.name}</div>
                                    <div className="text-xs text-text-muted">{cls.desc}</div>
                                </div>
                                {idx === 0 && (
                                    <span className="ml-auto text-xs stat-badge badge-beginner">Starting Class</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
