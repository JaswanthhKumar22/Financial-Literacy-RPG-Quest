export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-bg-primary z-50">
            <div className="relative mb-8">
                <div className="text-6xl animate-float">⚔️</div>
                <div className="absolute -inset-4 rounded-full bg-accent-purple/10 animate-pulse-glow" />
            </div>
            <h2 className="text-2xl font-display font-bold text-accent-gold text-glow-gold mb-4">
                FinQuest RPG
            </h2>
            <div className="spinner" />
            <p className="mt-4 text-text-secondary text-sm">Loading your adventure...</p>
        </div>
    );
}
