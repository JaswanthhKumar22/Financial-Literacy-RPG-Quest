import { useState, useEffect } from 'react';
import { socialAPI } from '../api';

export default function Social() {
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [addUsername, setAddUsername] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [tab, setTab] = useState('friends');
    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSocial();
    }, []);

    const loadSocial = async () => {
        try {
            const [friendsRes, reqRes] = await Promise.all([
                socialAPI.getFriends(),
                socialAPI.getRequests(),
            ]);
            setFriends(friendsRes.data.friends || []);
            setRequests(reqRes.data.requests || []);
        } catch (err) {
            console.error('Social load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddFriend = async (e) => {
        e.preventDefault();
        if (!addUsername.trim()) return;
        setError('');
        setMessage('');
        try {
            const { data } = await socialAPI.addFriend(addUsername.trim());
            setMessage(data.message);
            setAddUsername('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send request');
        }
    };

    const handleAccept = async (id) => {
        try {
            await socialAPI.acceptFriend(id);
            await loadSocial();
            setMessage('Friend request accepted!');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to accept');
        }
    };

    const handleSearch = async () => {
        if (searchQuery.length < 2) return;
        try {
            const { data } = await socialAPI.search(searchQuery);
            setSearchResults(data.users || []);
        } catch (err) {
            console.error('Search error:', err);
        }
    };

    const handleCompare = async (userId) => {
        try {
            const { data } = await socialAPI.compare(userId);
            setComparison(data);
        } catch (err) {
            console.error('Compare error:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <div>
                <h1 className="font-display text-3xl font-bold text-accent-gold text-glow-gold flex items-center gap-3">
                    <span className="animate-float">👥</span> Social Hub
                </h1>
                <p className="text-text-secondary mt-1">Connect with fellow adventurers</p>
            </div>

            {/* Messages */}
            {message && (
                <div className="p-3 rounded-lg bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald text-sm">
                    {message}
                </div>
            )}
            {error && (
                <div className="p-3 rounded-lg bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm">
                    {error}
                </div>
            )}

            {/* Add Friend */}
            <div className="glass-card p-6">
                <h3 className="font-semibold mb-3">➕ Add Friend</h3>
                <form onSubmit={handleAddFriend} className="flex gap-3">
                    <input
                        type="text"
                        value={addUsername}
                        onChange={(e) => setAddUsername(e.target.value)}
                        className="input-field flex-1"
                        placeholder="Enter username..."
                    />
                    <button type="submit" className="btn-primary !px-6">Send Request</button>
                </form>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {[
                    { id: 'friends', label: `Friends (${friends.length})`, icon: '👥' },
                    { id: 'requests', label: `Requests (${requests.length})`, icon: '📩' },
                    { id: 'search', label: 'Search', icon: '🔍' },
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`stat-badge cursor-pointer transition-all ${tab === t.id ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/40'
                                : 'bg-bg-primary/30 text-text-secondary border border-border-dim'
                            }`}
                    >
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* Friends List */}
            {tab === 'friends' && (
                <div className="space-y-3">
                    {friends.length === 0 ? (
                        <div className="glass-card p-12 text-center">
                            <div className="text-5xl mb-4">🤝</div>
                            <h3 className="text-xl font-bold mb-2">No Friends Yet</h3>
                            <p className="text-text-secondary">Add friends by their username!</p>
                        </div>
                    ) : (
                        friends.map((friend) => (
                            <div key={friend.friendship_id} className="glass-card p-4 flex items-center gap-4">
                                <div className="text-3xl">🧙</div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{friend.character_name || friend.username}</span>
                                        <span className="stat-badge bg-accent-purple/10 text-accent-purple border border-accent-purple/20 !text-xs !py-0">
                                            {friend.class || 'Apprentice'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-text-muted">
                                        @{friend.username} · Lv.{friend.level || 1} · Net Worth: ${parseFloat(friend.net_worth || 0).toLocaleString()}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleCompare(friend.user_id)}
                                    className="btn-outline !py-2 !px-4 text-sm"
                                >
                                    📊 Compare
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Friend Requests */}
            {tab === 'requests' && (
                <div className="space-y-3">
                    {requests.length === 0 ? (
                        <div className="glass-card p-12 text-center">
                            <div className="text-5xl mb-4">📭</div>
                            <h3 className="text-xl font-bold mb-2">No Pending Requests</h3>
                        </div>
                    ) : (
                        requests.map((req) => (
                            <div key={req.id} className="glass-card p-4 flex items-center gap-4">
                                <div className="text-3xl">🧙</div>
                                <div className="flex-1">
                                    <span className="font-semibold">{req.username}</span>
                                    <div className="text-xs text-text-muted">
                                        {req.character_name ? `${req.character_name} · Lv.${req.level}` : 'New adventurer'}
                                    </div>
                                </div>
                                <button onClick={() => handleAccept(req.id)} className="btn-primary !py-2 !px-4 text-sm">
                                    ✅ Accept
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Search */}
            {tab === 'search' && (
                <div className="space-y-4">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field flex-1"
                            placeholder="Search by username..."
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button onClick={handleSearch} className="btn-primary !px-6">🔍 Search</button>
                    </div>
                    <div className="space-y-2">
                        {searchResults.map((u) => (
                            <div key={u.id} className="glass-card p-4 flex items-center gap-4">
                                <div className="text-3xl">🧙</div>
                                <div className="flex-1">
                                    <span className="font-semibold">{u.username}</span>
                                    <div className="text-xs text-text-muted">
                                        {u.character_name ? `${u.character_name} · ${u.class} · Lv.${u.level}` : 'No character yet'}
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setAddUsername(u.username);
                                        setTab('friends');
                                    }}
                                    className="btn-outline !py-2 !px-4 text-sm"
                                >
                                    ➕ Add
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Comparison Modal */}
            {comparison && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fadeIn">
                    <div className="glass-card p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-display text-xl font-bold">📊 Stats Comparison</h3>
                            <button onClick={() => setComparison(null)} className="text-xl text-text-muted hover:text-white">✕</button>
                        </div>

                        <div className="flex justify-between mb-6 text-center">
                            <div>
                                <div className="text-2xl mb-1">🧙</div>
                                <div className="font-semibold text-accent-gold">{comparison.myCharacter}</div>
                                <div className="text-xs text-text-muted">You</div>
                            </div>
                            <div className="text-2xl self-center text-text-muted">⚔️</div>
                            <div>
                                <div className="text-2xl mb-1">🧙</div>
                                <div className="font-semibold text-accent-blue">{comparison.friendCharacter}</div>
                                <div className="text-xs text-text-muted">Friend</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {Object.entries(comparison.comparison).map(([key, val]) => {
                                const isBetter = val.me > val.friend;
                                const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                return (
                                    <div key={key}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className={`font-mono ${isBetter ? 'text-accent-emerald' : 'text-text-secondary'}`}>
                                                {typeof val.me === 'number' && val.me > 100 ? val.me.toLocaleString() : val.me}
                                            </span>
                                            <span className="text-text-muted text-xs">{label}</span>
                                            <span className={`font-mono ${!isBetter ? 'text-accent-emerald' : 'text-text-secondary'}`}>
                                                {typeof val.friend === 'number' && val.friend > 100 ? val.friend.toLocaleString() : val.friend}
                                            </span>
                                        </div>
                                        <div className="flex h-2 rounded-full overflow-hidden bg-bg-primary/50">
                                            <div
                                                className="h-full rounded-l-full transition-all"
                                                style={{
                                                    width: `${(val.me / (val.me + val.friend || 1)) * 100}%`,
                                                    background: isBetter ? '#00d68f' : '#6b7280',
                                                }}
                                            />
                                            <div
                                                className="h-full rounded-r-full transition-all"
                                                style={{
                                                    width: `${(val.friend / (val.me + val.friend || 1)) * 100}%`,
                                                    background: !isBetter ? '#00d68f' : '#6b7280',
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button onClick={() => setComparison(null)} className="btn-outline w-full mt-6">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
