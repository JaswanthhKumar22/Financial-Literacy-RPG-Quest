import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, error, setError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await login(email, password);
            navigate(data.hasCharacter ? '/dashboard' : '/create-character');
        } catch {
            // error is set in context
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-animated" />

            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8 animate-fadeInUp">
                    <div className="text-6xl mb-4 animate-float">⚔️</div>
                    <h1 className="font-display text-4xl font-bold text-accent-gold text-glow-gold mb-2">
                        FinQuest RPG
                    </h1>
                    <p className="text-text-secondary">Begin your financial adventure</p>
                </div>

                {/* Form Card */}
                <div className="glass-card p-8 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back, Hero</h2>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Email Address
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                                className="input-field"
                                placeholder="hero@finquest.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Password
                            </label>
                            <input
                                id="login-password"
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                                className="input-field"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            className="btn-gold w-full text-center flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><span className="spinner !w-5 !h-5 !border-bg-primary/30 !border-t-bg-primary" /> Logging in...</>
                            ) : (
                                <>⚔️ Enter the Realm</>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-text-secondary text-sm">
                        New adventurer?{' '}
                        <Link to="/register" className="text-accent-purple hover:text-accent-gold transition-colors font-medium">
                            Create Account
                        </Link>
                    </p>
                </div>

                {/* Features Preview */}
                <div className="mt-8 grid grid-cols-3 gap-3 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    {[
                        { icon: '📊', label: 'Budgeting' },
                        { icon: '📈', label: 'Investing' },
                        { icon: '🏆', label: 'Achievements' },
                    ].map((feat) => (
                        <div key={feat.label} className="text-center p-3 rounded-xl bg-bg-card/30 border border-border-dim/50">
                            <div className="text-2xl mb-1">{feat.icon}</div>
                            <div className="text-xs text-text-muted">{feat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
