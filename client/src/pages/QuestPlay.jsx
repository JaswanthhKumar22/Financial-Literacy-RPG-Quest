import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { questAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const PHASES = ['story', 'learn', 'questions', 'results'];

export default function QuestPlay() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { refreshCharacter } = useAuth();
    const [quest, setQuest] = useState(null);
    const [phase, setPhase] = useState('story');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [showLevelUp, setShowLevelUp] = useState(false);

    useEffect(() => {
        loadQuest();
    }, [id]);

    const loadQuest = async () => {
        try {
            const { data } = await questAPI.getById(id);
            setQuest(data.quest);
            if (data.quest.progress?.status === 'accepted' || data.quest.progress?.status === 'in_progress') {
                setAccepted(true);
            }
        } catch (err) {
            console.error('Failed to load quest:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptQuest = async () => {
        try {
            await questAPI.accept(id);
            setAccepted(true);
        } catch (err) {
            console.error('Failed to accept quest:', err);
        }
    };

    const handleSelectAnswer = (answerIndex) => {
        setSelectedAnswer(answerIndex);
    };

    const handleNextQuestion = () => {
        if (selectedAnswer === null) return;

        const newAnswers = [...answers, selectedAnswer];
        setAnswers(newAnswers);
        setSelectedAnswer(null);

        if (currentQuestion < quest.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            submitQuest(newAnswers);
        }
    };

    const submitQuest = async (finalAnswers) => {
        setSubmitting(true);
        try {
            const { data } = await questAPI.submit(id, finalAnswers);
            setResults(data);
            setPhase('results');

            if (data.levelUp?.levelUps?.length > 0) {
                setShowLevelUp(true);
                setTimeout(() => setShowLevelUp(false), 4000);
            }

            await refreshCharacter();
        } catch (err) {
            console.error('Failed to submit quest:', err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="spinner" />
            </div>
        );
    }

    if (!quest) {
        return (
            <div className="glass-card p-12 text-center">
                <div className="text-5xl mb-4">❌</div>
                <h2 className="text-2xl font-bold mb-2">Quest Not Found</h2>
                <Link to="/quests" className="btn-primary mt-4 inline-block">Back to Quest Board</Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
            {/* Level Up Overlay */}
            {showLevelUp && results?.levelUp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fadeIn">
                    <div className="text-center level-up-animation">
                        <div className="text-8xl mb-4">🏅</div>
                        <h2 className="font-display text-4xl font-bold text-accent-gold text-glow-gold mb-2">
                            Level Up!
                        </h2>
                        {results.levelUp.levelUps.map((lu, idx) => (
                            <div key={idx} className="text-xl text-accent-purple mb-1">
                                Level {lu.newLevel} — {lu.newClass}
                            </div>
                        ))}
                        <p className="text-text-secondary mt-4">Your power grows stronger!</p>
                    </div>
                </div>
            )}

            {/* Quest Header */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-3 text-sm">
                    <Link to="/quests" className="text-text-secondary hover:text-accent-purple transition-colors">
                        ← Quest Board
                    </Link>
                    <span className="text-text-muted">/</span>
                    <span className="text-accent-purple">{quest.category_name}</span>
                </div>
                <div className="flex items-start gap-4">
                    <span className="text-4xl">{quest.category_icon}</span>
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h1 className="font-display text-2xl font-bold">{quest.title}</h1>
                            <span className={`stat-badge badge-${quest.difficulty}`}>{quest.difficulty}</span>
                        </div>
                        <p className="text-text-secondary">{quest.description}</p>
                        <div className="flex gap-4 mt-3 text-sm">
                            <span className="text-accent-purple font-mono">✨ {quest.xp_reward} XP</span>
                            <span className="text-accent-gold font-mono">💰 {quest.gold_reward} Gold</span>
                        </div>
                    </div>
                </div>

                {/* Phase Indicator */}
                <div className="flex items-center gap-2 mt-6">
                    {PHASES.map((p, idx) => (
                        <div key={p} className="flex items-center flex-1">
                            <div className={`w-full h-1.5 rounded-full transition-all ${PHASES.indexOf(phase) >= idx ? 'bg-accent-purple' : 'bg-border-dim'
                                }`} />
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-xs text-text-muted mt-1">
                    <span>Story</span><span>Learn</span><span>Challenge</span><span>Results</span>
                </div>
            </div>

            {/* STORY PHASE */}
            {phase === 'story' && (
                <div className="glass-card p-8 animate-fadeInUp">
                    <div className="text-center mb-6">
                        <div className="text-5xl mb-4">📜</div>
                        <h2 className="font-display text-2xl font-bold text-accent-gold mb-4">The Quest Begins...</h2>
                    </div>
                    <div className="prose prose-invert max-w-none">
                        <p className="text-lg text-text-secondary leading-relaxed italic border-l-4 border-accent-gold/30 pl-4">
                            {quest.story_text || quest.description}
                        </p>
                    </div>
                    <div className="mt-8 flex justify-center">
                        {!accepted ? (
                            <button onClick={handleAcceptQuest} className="btn-gold text-lg px-8">
                                ⚔️ Accept Quest
                            </button>
                        ) : (
                            <button onClick={() => setPhase('learn')} className="btn-primary text-lg px-8">
                                Continue →
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* LEARNING PHASE */}
            {phase === 'learn' && (
                <div className="glass-card p-8 animate-fadeInUp">
                    <div className="text-center mb-6">
                        <div className="text-5xl mb-4">📚</div>
                        <h2 className="font-display text-2xl font-bold text-accent-blue mb-2">Knowledge Scroll</h2>
                        <p className="text-text-muted text-sm">Study this wisdom before the challenge</p>
                    </div>
                    <div className="bg-bg-primary/50 rounded-xl p-6 border border-border-dim/50">
                        <p className="text-text-secondary leading-relaxed text-lg">
                            {quest.learning_content}
                        </p>
                    </div>
                    <div className="mt-8 flex justify-between">
                        <button onClick={() => setPhase('story')} className="btn-outline">
                            ← Back
                        </button>
                        <button onClick={() => setPhase('questions')} className="btn-primary">
                            Begin Challenge ⚔️
                        </button>
                    </div>
                </div>
            )}

            {/* QUESTIONS PHASE */}
            {phase === 'questions' && quest.questions[currentQuestion] && (
                <div className="glass-card p-8 animate-fadeInUp">
                    {/* Progress */}
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-sm text-text-secondary">
                            Question {currentQuestion + 1} of {quest.questions.length}
                        </span>
                        <div className="flex gap-1">
                            {quest.questions.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-3 h-3 rounded-full transition-all ${idx < currentQuestion ? 'bg-accent-emerald' :
                                            idx === currentQuestion ? 'bg-accent-purple scale-125' : 'bg-border-dim'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Question */}
                    <h3 className="text-xl font-semibold mb-6">
                        {quest.questions[currentQuestion].question}
                    </h3>

                    {/* Options */}
                    <div className="space-y-3 mb-8">
                        {quest.questions[currentQuestion].options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSelectAnswer(idx)}
                                className={`w-full text-left p-4 rounded-xl border transition-all ${selectedAnswer === idx
                                        ? 'bg-accent-purple/15 border-accent-purple/50 text-white'
                                        : 'bg-bg-primary/30 border-border-dim/50 text-text-secondary hover:border-accent-purple/30 hover:bg-accent-purple/5'
                                    }`}
                            >
                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm font-bold mr-3 ${selectedAnswer === idx
                                        ? 'bg-accent-purple text-white'
                                        : 'bg-bg-card text-text-muted'
                                    }`}>
                                    {String.fromCharCode(65 + idx)}
                                </span>
                                {option}
                            </button>
                        ))}
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleNextQuestion}
                            disabled={selectedAnswer === null || submitting}
                            className="btn-primary flex items-center gap-2"
                        >
                            {submitting ? (
                                <><span className="spinner !w-5 !h-5" /> Submitting...</>
                            ) : currentQuestion < quest.questions.length - 1 ? (
                                <>Next Question →</>
                            ) : (
                                <>⚔️ Complete Quest</>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* RESULTS PHASE */}
            {phase === 'results' && results && (
                <div className="space-y-6 animate-fadeInUp">
                    {/* Score Card */}
                    <div className={`glass-card p-8 text-center ${results.score.passed ? 'border-accent-emerald/30' : 'border-accent-red/30'
                        }`}>
                        <div className="text-6xl mb-4">
                            {results.score.passed ? '🎉' : '😔'}
                        </div>
                        <h2 className="font-display text-3xl font-bold mb-2">
                            {results.score.passed ? 'Quest Complete!' : 'Quest Failed'}
                        </h2>
                        <div className={`text-5xl font-mono font-bold my-4 ${results.score.percentage >= 80 ? 'text-accent-emerald' :
                                results.score.percentage >= 60 ? 'text-accent-gold' : 'text-accent-red'
                            }`}>
                            {results.score.percentage}%
                        </div>
                        <p className="text-text-secondary">
                            {results.score.correct} / {results.score.total} correct
                        </p>

                        {/* Rewards */}
                        {results.rewards && (
                            <div className="mt-6 flex justify-center gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-mono font-bold text-accent-purple">+{results.rewards.xp}</div>
                                    <div className="text-sm text-text-muted">XP Earned</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-mono font-bold text-accent-gold">+{results.rewards.gold}</div>
                                    <div className="text-sm text-text-muted">Gold Earned</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Answer Review */}
                    <div className="glass-card p-6">
                        <h3 className="font-display text-lg font-bold mb-4">📝 Answer Review</h3>
                        <div className="space-y-4">
                            {results.feedback?.map((fb, idx) => (
                                <div
                                    key={idx}
                                    className={`p-4 rounded-xl border ${fb.isCorrect
                                            ? 'bg-accent-emerald/5 border-accent-emerald/20'
                                            : 'bg-accent-red/5 border-accent-red/20'
                                        }`}
                                >
                                    <div className="flex items-start gap-2 mb-2">
                                        <span className="text-lg">{fb.isCorrect ? '✅' : '❌'}</span>
                                        <h4 className="font-semibold">{fb.question}</h4>
                                    </div>
                                    {!fb.isCorrect && (
                                        <p className="text-sm text-accent-emerald ml-7 mb-1">
                                            Correct: {quest.questions[idx].options[fb.correctAnswer]}
                                        </p>
                                    )}
                                    <p className="text-sm text-text-secondary ml-7 italic">{fb.explanation}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to="/quests" className="btn-outline text-center">
                            ← Quest Board
                        </Link>
                        {!results.score.passed && (
                            <button
                                onClick={() => {
                                    setPhase('story');
                                    setCurrentQuestion(0);
                                    setAnswers([]);
                                    setSelectedAnswer(null);
                                    setResults(null);
                                    setAccepted(true);
                                }}
                                className="btn-primary"
                            >
                                🔄 Try Again
                            </button>
                        )}
                        <Link to="/dashboard" className="btn-gold text-center">
                            🏰 Dashboard
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
