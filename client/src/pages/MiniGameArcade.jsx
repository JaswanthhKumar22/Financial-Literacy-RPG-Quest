import { useState, useEffect, useRef, useCallback } from 'react';
import { minigameAPI } from '../api';
import { useAuth } from '../context/AuthContext';

// ===== BUDGET BALANCER GAME =====
function BudgetBalancer({ onComplete }) {
    const [income] = useState(5000);
    const [allocations, setAllocations] = useState({
        rent: 1500, food: 500, transport: 300, entertainment: 200,
        savings: 500, utilities: 200, insurance: 150, personal: 150,
    });
    const [submitted, setSubmitted] = useState(false);

    const total = Object.values(allocations).reduce((a, b) => a + b, 0);
    const remaining = income - total;

    const handleChange = (key, value) => {
        setAllocations(prev => ({ ...prev, [key]: Math.max(0, parseInt(value) || 0) }));
    };

    const calculateScore = () => {
        let score = 0;
        const savingsRate = (allocations.savings / income) * 100;
        if (savingsRate >= 20) score += 30;
        else if (savingsRate >= 10) score += 15;

        if (allocations.rent <= income * 0.3) score += 20;
        else if (allocations.rent <= income * 0.35) score += 10;

        if (remaining >= 0 && remaining <= 200) score += 25;
        else if (remaining >= 0) score += 10;

        if (allocations.entertainment <= income * 0.1) score += 15;

        if (allocations.insurance >= 100) score += 10;

        return Math.min(100, score);
    };

    const handleSubmit = () => {
        if (remaining < 0) return;
        const score = calculateScore();
        setSubmitted(true);
        onComplete('budget_balance', score);
    };

    const categories = [
        { key: 'rent', label: '🏠 Rent/Housing', color: '#ef4444' },
        { key: 'food', label: '🍔 Food/Groceries', color: '#f59e0b' },
        { key: 'transport', label: '🚗 Transport', color: '#3b82f6' },
        { key: 'utilities', label: '💡 Utilities', color: '#06b6d4' },
        { key: 'insurance', label: '🛡️ Insurance', color: '#8b5cf6' },
        { key: 'entertainment', label: '🎮 Entertainment', color: '#ec4899' },
        { key: 'savings', label: '💰 Savings', color: '#00d68f' },
        { key: 'personal', label: '👤 Personal', color: '#f97316' },
    ];

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="font-display text-xl font-bold text-accent-gold mb-2">Monthly Budget Challenge</h3>
                <p className="text-text-secondary">Allocate your ${income.toLocaleString()} monthly income wisely</p>
            </div>

            <div className="glass-card p-4 flex items-center justify-between">
                <span className="text-text-secondary">Remaining:</span>
                <span className={`font-mono text-2xl font-bold ${remaining < 0 ? 'text-accent-red' : remaining === 0 ? 'text-accent-emerald' : 'text-accent-gold'
                    }`}>
                    ${remaining.toLocaleString()}
                </span>
            </div>

            <div className="grid gap-3">
                {categories.map(({ key, label, color }) => (
                    <div key={key} className="flex items-center gap-4 p-3 rounded-xl bg-bg-primary/30 border border-border-dim/50">
                        <span className="text-sm flex-shrink-0 w-36">{label}</span>
                        <input
                            type="range"
                            min="0"
                            max="2500"
                            step="50"
                            value={allocations[key]}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="flex-1 accent-purple-500"
                            disabled={submitted}
                        />
                        <input
                            type="number"
                            value={allocations[key]}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="w-20 input-field !py-1 !px-2 text-center font-mono text-sm"
                            disabled={submitted}
                        />
                        <div className="w-16 h-2 rounded-full bg-bg-card overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${(allocations[key] / income) * 100}%`, background: color }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {!submitted ? (
                <button
                    onClick={handleSubmit}
                    disabled={remaining < 0}
                    className="btn-gold w-full"
                >
                    {remaining < 0 ? '⚠️ Over Budget!' : '📊 Submit Budget'}
                </button>
            ) : (
                <div className="text-center p-4 glass-card">
                    <div className="text-accent-emerald font-bold text-lg">Budget Submitted! ✅</div>
                    <p className="text-text-secondary text-sm mt-1">
                        Savings Rate: {((allocations.savings / income) * 100).toFixed(0)}%
                    </p>
                </div>
            )}
        </div>
    );
}

// ===== COMPOUND INTEREST GAME =====
function CompoundInterestGame({ onComplete }) {
    const [principal, setPrincipal] = useState(1000);
    const [rate, setRate] = useState(7);
    const [years, setYears] = useState(10);
    const [guess, setGuess] = useState('');
    const [revealed, setRevealed] = useState(false);

    const actualAmount = principal * Math.pow(1 + rate / 100, years);
    const interestEarned = actualAmount - principal;

    const handleGuess = () => {
        const guessNum = parseFloat(guess);
        if (isNaN(guessNum)) return;

        const accuracy = Math.max(0, 100 - Math.abs(((guessNum - actualAmount) / actualAmount) * 100));
        const score = Math.round(accuracy);
        setRevealed(true);
        onComplete('compound_interest', score);
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="font-display text-xl font-bold text-accent-gold mb-2">Compound Interest Oracle</h3>
                <p className="text-text-secondary">Predict the future value of your investment</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="glass-card p-4 text-center">
                    <div className="text-sm text-text-muted mb-1">Principal</div>
                    <select
                        value={principal}
                        onChange={(e) => { setPrincipal(Number(e.target.value)); setRevealed(false); }}
                        className="input-field !py-2 text-center font-mono"
                    >
                        {[500, 1000, 5000, 10000].map(v => (
                            <option key={v} value={v}>${v.toLocaleString()}</option>
                        ))}
                    </select>
                </div>
                <div className="glass-card p-4 text-center">
                    <div className="text-sm text-text-muted mb-1">Annual Rate</div>
                    <select
                        value={rate}
                        onChange={(e) => { setRate(Number(e.target.value)); setRevealed(false); }}
                        className="input-field !py-2 text-center font-mono"
                    >
                        {[3, 5, 7, 10, 12].map(v => (
                            <option key={v} value={v}>{v}%</option>
                        ))}
                    </select>
                </div>
                <div className="glass-card p-4 text-center">
                    <div className="text-sm text-text-muted mb-1">Years</div>
                    <select
                        value={years}
                        onChange={(e) => { setYears(Number(e.target.value)); setRevealed(false); }}
                        className="input-field !py-2 text-center font-mono"
                    >
                        {[5, 10, 20, 30, 40].map(v => (
                            <option key={v} value={v}>{v} yrs</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="glass-card p-6 text-center">
                <p className="text-text-secondary mb-4">
                    If you invest <span className="text-accent-gold font-mono font-bold">${principal.toLocaleString()}</span> at{' '}
                    <span className="text-accent-emerald font-mono font-bold">{rate}%</span> for{' '}
                    <span className="text-accent-blue font-mono font-bold">{years} years</span>, how much will it be worth?
                </p>

                <div className="flex gap-3 justify-center">
                    <input
                        type="number"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        placeholder="Your guess..."
                        className="input-field !w-48 text-center font-mono"
                        disabled={revealed}
                    />
                    {!revealed && (
                        <button onClick={handleGuess} className="btn-primary" disabled={!guess}>
                            🔮 Predict
                        </button>
                    )}
                </div>
            </div>

            {revealed && (
                <div className="glass-card p-6 text-center animate-fadeInUp">
                    <div className="text-3xl mb-2">💰</div>
                    <div className="text-sm text-text-muted">Actual Value</div>
                    <div className="text-3xl font-mono font-bold text-accent-gold my-2">
                        ${actualAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-text-secondary">
                        Interest earned: <span className="text-accent-emerald font-mono">${interestEarned.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="text-sm text-text-secondary mt-1">
                        Your money grew <span className="text-accent-purple font-bold">{(actualAmount / principal).toFixed(1)}x</span>!
                    </div>
                </div>
            )}
        </div>
    );
}

// ===== DEBT PAYOFF GAME =====
function DebtPayoffGame({ onComplete }) {
    const [debts] = useState([
        { name: 'Credit Card A', balance: 5000, rate: 22, minPayment: 100 },
        { name: 'Credit Card B', balance: 3000, rate: 18, minPayment: 60 },
        { name: 'Student Loan', balance: 15000, rate: 5, minPayment: 150 },
        { name: 'Car Loan', balance: 8000, rate: 7, minPayment: 200 },
    ]);
    const [extraBudget] = useState(500);
    const [allocation, setAllocation] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const totalAllocated = Object.values(allocation).reduce((a, b) => a + b, 0);
    const remaining = extraBudget - totalAllocated;

    const handleAllocate = (idx, value) => {
        setAllocation(prev => ({ ...prev, [idx]: Math.max(0, parseInt(value) || 0) }));
    };

    const handleSubmit = () => {
        let score = 0;

        // Best strategy: pay highest interest first (avalanche)
        const sortedByRate = [...debts].sort((a, b) => b.rate - a.rate);
        const highestRateIdx = debts.indexOf(sortedByRate[0]);

        if ((allocation[highestRateIdx] || 0) >= extraBudget * 0.5) score += 40;
        else if ((allocation[highestRateIdx] || 0) >= extraBudget * 0.3) score += 20;

        // Check all minimums are met
        const meetsMinimums = debts.every((d, i) => !allocation[i] || true);
        if (meetsMinimums) score += 20;

        // Budget usage
        if (remaining >= 0 && remaining <= 50) score += 20;
        else if (remaining >= 0) score += 10;

        // Not putting extra on low-interest debt
        const lowInterestExtra = (allocation[2] || 0); // student loan
        if (lowInterestExtra <= 50) score += 20;

        score = Math.min(100, score);
        setSubmitted(true);
        onComplete('debt_payoff', score);
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="font-display text-xl font-bold text-accent-gold mb-2">Debt Slayer Arena</h3>
                <p className="text-text-secondary">
                    Extra monthly budget: <span className="text-accent-gold font-mono font-bold">${extraBudget}</span>. Allocate it wisely!
                </p>
            </div>

            <div className="glass-card p-4 flex items-center justify-between">
                <span className="text-text-secondary">Remaining to allocate:</span>
                <span className={`font-mono text-xl font-bold ${remaining < 0 ? 'text-accent-red' : 'text-accent-emerald'}`}>
                    ${remaining}
                </span>
            </div>

            <div className="space-y-3">
                {debts.map((debt, idx) => (
                    <div key={idx} className="glass-card p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <div className="font-semibold">{debt.name}</div>
                                <div className="text-xs text-text-muted">
                                    Balance: ${debt.balance.toLocaleString()} · APR: {debt.rate}% · Min: ${debt.minPayment}
                                </div>
                            </div>
                            <span className={`stat-badge ${debt.rate >= 15 ? 'badge-expert' : debt.rate >= 7 ? 'badge-intermediate' : 'badge-beginner'}`}>
                                {debt.rate}% APR
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-text-muted w-16">Extra $:</span>
                            <input
                                type="range"
                                min="0"
                                max={extraBudget}
                                step="25"
                                value={allocation[idx] || 0}
                                onChange={(e) => handleAllocate(idx, e.target.value)}
                                className="flex-1"
                                disabled={submitted}
                            />
                            <span className="font-mono text-sm w-16 text-right">${allocation[idx] || 0}</span>
                        </div>
                    </div>
                ))}
            </div>

            {!submitted ? (
                <button onClick={handleSubmit} disabled={remaining < 0} className="btn-gold w-full">
                    ⚔️ Execute Debt Strategy
                </button>
            ) : (
                <div className="glass-card p-4 text-center">
                    <div className="text-accent-emerald font-bold">Strategy Submitted! ✅</div>
                    <p className="text-sm text-text-secondary mt-1">
                        Pro tip: The Debt Avalanche method (paying highest APR first) saves the most money!
                    </p>
                </div>
            )}
        </div>
    );
}

// ===== INVESTMENT SIM GAME =====
function InvestmentSimGame({ onComplete }) {
    const [portfolio, setPortfolio] = useState({ stocks: 0, bonds: 0, realestate: 0, crypto: 0, savings: 10000 });
    const [year, setYear] = useState(0);
    const [history, setHistory] = useState([]);
    const [simDone, setSimDone] = useState(false);

    const investmentBudget = 10000;

    const totalInvested = portfolio.stocks + portfolio.bonds + portfolio.realestate + portfolio.crypto;
    const remaining = investmentBudget - totalInvested;

    const handleChange = (key, value) => {
        const newVal = Math.max(0, parseInt(value) || 0);
        setPortfolio(prev => ({ ...prev, [key]: newVal }));
    };

    const simulateYear = () => {
        const returns = {
            stocks: (Math.random() * 0.25 - 0.05),
            bonds: (Math.random() * 0.06 + 0.01),
            realestate: (Math.random() * 0.15 - 0.02),
            crypto: (Math.random() * 0.8 - 0.3),
            savings: 0.04,
        };

        const newPortfolio = { ...portfolio };
        let totalValue = 0;
        Object.keys(returns).forEach(key => {
            newPortfolio[key] = Math.max(0, Math.round(newPortfolio[key] * (1 + returns[key])));
            totalValue += newPortfolio[key];
        });

        setPortfolio(newPortfolio);
        setYear(y => y + 1);
        setHistory(h => [...h, { year: year + 1, total: totalValue, returns: { ...returns } }]);

        if (year + 1 >= 5) {
            const finalTotal = Object.values(newPortfolio).reduce((a, b) => a + b, 0);
            const returnPct = ((finalTotal - investmentBudget) / investmentBudget) * 100;

            // Score based on diversification and returns
            let score = 0;
            const invested = { stocks: portfolio.stocks, bonds: portfolio.bonds, realestate: portfolio.realestate, crypto: portfolio.crypto };
            const investedArr = Object.values(invested).filter(v => v > 0);

            if (investedArr.length >= 3) score += 30; // diversification
            else if (investedArr.length >= 2) score += 15;

            if (returnPct > 20) score += 30;
            else if (returnPct > 0) score += 15;

            if (portfolio.crypto <= investmentBudget * 0.2) score += 20; // not too much crypto
            if (portfolio.bonds >= investmentBudget * 0.1) score += 20; // some bonds for safety

            score = Math.min(100, score);
            setSimDone(true);
            onComplete('investment_sim', score);
        }
    };

    const assets = [
        { key: 'stocks', label: '📈 Stocks', color: '#3b82f6' },
        { key: 'bonds', label: '🏦 Bonds', color: '#00d68f' },
        { key: 'realestate', label: '🏠 Real Estate', color: '#f59e0b' },
        { key: 'crypto', label: '₿ Crypto', color: '#8b5cf6' },
    ];

    const totalValue = Object.values(portfolio).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="font-display text-xl font-bold text-accent-gold mb-2">Investment Simulator</h3>
                <p className="text-text-secondary">
                    Invest ${investmentBudget.toLocaleString()} and simulate 5 years. Year: {year}/5
                </p>
            </div>

            <div className="glass-card p-4 flex items-center justify-between">
                <span>Portfolio Value:</span>
                <span className={`font-mono text-2xl font-bold ${totalValue >= investmentBudget ? 'text-accent-emerald' : 'text-accent-red'}`}>
                    ${totalValue.toLocaleString()}
                </span>
            </div>

            {year === 0 && (
                <div className="glass-card p-4 text-center text-sm text-text-muted">
                    Remaining: <span className={`font-mono font-bold ${remaining < 0 ? 'text-accent-red' : 'text-accent-gold'}`}>${remaining.toLocaleString()}</span>
                </div>
            )}

            <div className="grid gap-3">
                {assets.map(({ key, label, color }) => (
                    <div key={key} className="p-3 rounded-xl bg-bg-primary/30 border border-border-dim/50">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">{label}</span>
                            <span className="font-mono text-sm" style={{ color }}>${portfolio[key].toLocaleString()}</span>
                        </div>
                        {year === 0 && (
                            <input
                                type="range" min="0" max={investmentBudget} step="500"
                                value={portfolio[key]}
                                onChange={(e) => handleChange(key, e.target.value)}
                                className="w-full"
                            />
                        )}
                    </div>
                ))}
                <div className="p-3 rounded-xl bg-bg-primary/30 border border-border-dim/50 flex items-center justify-between">
                    <span className="text-sm">💵 Cash Savings</span>
                    <span className="font-mono text-sm text-accent-gold">${portfolio.savings.toLocaleString()}</span>
                </div>
            </div>

            {!simDone && (
                <button
                    onClick={simulateYear}
                    disabled={year === 0 && remaining < 0}
                    className="btn-primary w-full"
                >
                    {year === 0 ? '🚀 Start Simulation' : `📅 Simulate Year ${year + 1}`}
                </button>
            )}

            {history.length > 0 && (
                <div className="glass-card p-4">
                    <h4 className="text-sm font-semibold mb-2">Performance History</h4>
                    <div className="space-y-2">
                        {history.map((h) => (
                            <div key={h.year} className="flex items-center justify-between text-sm">
                                <span className="text-text-muted">Year {h.year}</span>
                                <span className={`font-mono ${h.total >= investmentBudget ? 'text-accent-emerald' : 'text-accent-red'}`}>
                                    ${h.total.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ===== MAIN ARCADE PAGE =====
const GAMES = [
    { id: 'budget_balance', name: 'Budget Balancer', icon: '📊', desc: 'Allocate a monthly budget wisely', color: '#00d68f', Component: BudgetBalancer },
    { id: 'compound_interest', name: 'Interest Oracle', icon: '🔮', desc: 'Predict compound interest outcomes', color: '#8b5cf6', Component: CompoundInterestGame },
    { id: 'debt_payoff', name: 'Debt Slayer', icon: '⚔️', desc: 'Strategize your debt payoff approach', color: '#ef4444', Component: DebtPayoffGame },
    { id: 'investment_sim', name: 'Investment Sim', icon: '📈', desc: 'Build and simulate a portfolio', color: '#3b82f6', Component: InvestmentSimGame },
];

export default function MiniGameArcade() {
    const [activeGame, setActiveGame] = useState(null);
    const [lastResult, setLastResult] = useState(null);
    const [bestScores, setBestScores] = useState({});
    const { refreshCharacter } = useAuth();

    useEffect(() => {
        loadBestScores();
    }, []);

    const loadBestScores = async () => {
        try {
            const { data } = await minigameAPI.getBest();
            const map = {};
            data.bestScores.forEach(s => { map[s.game_type] = s; });
            setBestScores(map);
        } catch (err) {
            console.error('Failed to load scores:', err);
        }
    };

    const handleGameComplete = async (gameType, score) => {
        try {
            const { data } = await minigameAPI.submitScore({ gameType, score });
            setLastResult(data);
            await refreshCharacter();
            await loadBestScores();
        } catch (err) {
            console.error('Score submit error:', err);
        }
    };

    if (activeGame) {
        const game = GAMES.find(g => g.id === activeGame);
        const GameComponent = game.Component;

        return (
            <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
                <div className="flex items-center gap-3">
                    <button onClick={() => { setActiveGame(null); setLastResult(null); }} className="btn-outline !py-2 !px-4 text-sm">
                        ← Back
                    </button>
                    <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                        <span>{game.icon}</span> {game.name}
                    </h2>
                </div>

                <GameComponent onComplete={handleGameComplete} />

                {lastResult && (
                    <div className="glass-card p-4 text-center animate-fadeInUp border-accent-emerald/30">
                        <div className="text-accent-emerald font-bold mb-1">🎮 Game Complete!</div>
                        <div className="flex justify-center gap-6 text-sm">
                            <span className="text-accent-purple font-mono">+{lastResult.rewards.xp} XP</span>
                            <span className="text-accent-gold font-mono">+{lastResult.rewards.gold} Gold</span>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <div>
                <h1 className="font-display text-3xl font-bold text-accent-gold text-glow-gold flex items-center gap-3">
                    <span className="animate-float">🎮</span> Mini-Game Arcade
                </h1>
                <p className="text-text-secondary mt-1">Play financial mini-games to earn XP and Gold</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                {GAMES.map((game) => (
                    <button
                        key={game.id}
                        onClick={() => setActiveGame(game.id)}
                        className="glass-card p-6 text-left group"
                    >
                        <div className="flex items-start gap-4">
                            <span className="text-5xl group-hover:scale-110 transition-transform">{game.icon}</span>
                            <div className="flex-1">
                                <h3 className="font-display text-lg font-bold group-hover:text-accent-gold transition-colors">
                                    {game.name}
                                </h3>
                                <p className="text-sm text-text-secondary mt-1">{game.desc}</p>
                                {bestScores[game.id] && (
                                    <div className="mt-3 flex items-center gap-3 text-xs">
                                        <span className="text-accent-gold font-mono">Best: {bestScores[game.id].best_score}</span>
                                        <span className="text-text-muted">Played {bestScores[game.id].times_played}x</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-border-dim/30 text-sm text-accent-purple flex items-center gap-1">
                            Play Now →
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
