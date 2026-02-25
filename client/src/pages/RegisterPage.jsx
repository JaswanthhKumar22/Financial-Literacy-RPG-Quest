import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState('');
    const { register, error, setError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirm) {
            setLocalError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setLocalError('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        setLocalError('');
        try {
            await register(username, email, password);
            navigate('/create-character');
        } catch {
            // error in context
        } finally {
            setLoading(false);
        }
    };

    const displayError = localError || error;

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-animated" />

            <div className="w-full max-w-md">
                <div className="text-center mb-8 animate-fadeInUp">
                    <div className="text-6xl mb-4 animate-float">🛡️</div>
                    <h1 className="font-display text-4xl font-bold text-accent-gold text-glow-gold mb-2">
                        Join FinQuest
                    </h1>
                    <p className="text-text-secondary">Create your hero and begin the journey</p>
                </div>

                <div className="glass-card p-8 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

                    {displayError && (
                        <div className="mb-4 p-3 rounded-lg bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm">
                            {displayError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Username</label>
                            <input
                                id="register-username"
                                type="text"
                                value={username}
                                onChange={(e) => { setUsername(e.target.value); setError(null); setLocalError(''); }}
                                className="input-field"
                                placeholder="Choose your hero name"
                                required
                                minLength={3}
                                maxLength={50}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
                            <input
                                id="register-email"
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(null); setLocalError(''); }}
                                className="input-field"
                                placeholder="hero@finquest.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
                            <input
                                id="register-password"
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setLocalError(''); }}
                                className="input-field"
                                placeholder="Min. 6 characters"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Confirm Password</label>
                            <input
                                id="register-confirm"
                                type="password"
                                value={confirm}
                                onChange={(e) => { setConfirm(e.target.value); setLocalError(''); }}
                                className="input-field"
                                placeholder="Repeat password"
                                required
                            />
                        </div>

                        <button
                            id="register-submit"
                            type="submit"
                            disabled={loading}
                            className="btn-gold w-full text-center flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><span className="spinner !w-5 !h-5 !border-bg-primary/30 !border-t-bg-primary" /> Creating...</>
                            ) : (
                                <>🛡️ Begin Adventure</>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-text-secondary text-sm">
                        Already a hero?{' '}
                        <Link to="/login" className="text-accent-purple hover:text-accent-gold transition-colors font-medium">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
