// FinQuest RPG - Game Logic & Mechanics

// XP required for each level (exponential curve)
export function getXPForLevel(level) {
    return Math.floor(100 * Math.pow(1.15, level - 1));
}

// Calculate level from total XP
export function calculateLevel(totalXP) {
    let level = 1;
    let xpNeeded = 0;
    while (level < 50) {
        xpNeeded += getXPForLevel(level);
        if (totalXP < xpNeeded) break;
        level++;
    }
    return Math.min(level, 50);
}

// Get character class based on level
export function getCharacterClass(level) {
    if (level >= 45) return 'Financial Grandmaster';
    if (level >= 40) return 'Wealth Sovereign';
    if (level >= 35) return 'Investment Sage';
    if (level >= 30) return 'Portfolio Architect';
    if (level >= 25) return 'Market Strategist';
    if (level >= 20) return 'Budget Warrior';
    if (level >= 15) return 'Savings Knight';
    if (level >= 10) return 'Finance Adept';
    if (level >= 5) return 'Money Squire';
    return 'Financial Apprentice';
}

// Calculate quest score based on correct answers
export function calculateQuestScore(answers, questions) {
    let correct = 0;
    answers.forEach((answer, index) => {
        if (questions[index] && answer === questions[index].correct) {
            correct++;
        }
    });
    return {
        correct,
        total: questions.length,
        percentage: Math.round((correct / questions.length) * 100),
        passed: correct >= Math.ceil(questions.length * 0.6),
    };
}

// Calculate rewards based on quest score
export function calculateRewards(quest, scoreResult) {
    const multiplier = scoreResult.percentage / 100;
    const difficultyBonus = {
        beginner: 1.0,
        intermediate: 1.25,
        advanced: 1.5,
        expert: 2.0,
    };

    const bonus = difficultyBonus[quest.difficulty] || 1.0;

    return {
        xp: Math.floor(quest.xp_reward * multiplier * bonus),
        gold: parseFloat((quest.gold_reward * multiplier * bonus).toFixed(2)),
        statRewards: scoreResult.passed ? quest.stat_rewards : {},
        perfectBonus: scoreResult.percentage === 100,
    };
}

// Process level up
export function processLevelUp(currentXP, currentLevel) {
    let level = currentLevel;
    let xp = currentXP;
    const levelUps = [];

    while (level < 50) {
        const xpNeeded = getXPForLevel(level);
        if (xp >= xpNeeded) {
            xp -= xpNeeded;
            level++;
            levelUps.push({
                newLevel: level,
                newClass: getCharacterClass(level),
                xpToNext: getXPForLevel(level),
            });
        } else {
            break;
        }
    }

    return {
        newLevel: level,
        remainingXP: xp,
        xpToNextLevel: level < 50 ? getXPForLevel(level) : 0,
        levelUps,
        newClass: getCharacterClass(level),
    };
}

// Calculate financial health score (0-100)
export function calculateFinancialHealth(character) {
    let score = 0;

    // Emergency fund coverage (0-25 pts)
    const monthsCovered = character.emergency_fund / (character.monthly_expenses || 1);
    score += Math.min(25, monthsCovered * (25 / 6));

    // Debt-to-income ratio (0-25 pts)
    const dti = character.debt / (character.income || 1);
    score += Math.max(0, 25 - (dti * 50));

    // Credit score (0-25 pts)
    score += ((character.credit_score - 300) / 550) * 25;

    // Savings rate (0-25 pts)
    score += Math.min(25, character.savings_rate * 1.25);

    return Math.round(Math.min(100, Math.max(0, score)));
}

// Mini-game scoring
export function calculateMiniGameReward(gameType, score, level) {
    const baseRewards = {
        budget_balance: { xp: 30, gold: 15 },
        compound_interest: { xp: 40, gold: 20 },
        debt_payoff: { xp: 35, gold: 18 },
        investment_sim: { xp: 50, gold: 25 },
    };

    const base = baseRewards[gameType] || { xp: 25, gold: 12 };
    const scoreMultiplier = Math.min(2, score / 50);

    return {
        xp: Math.floor(base.xp * scoreMultiplier),
        gold: parseFloat((base.gold * scoreMultiplier).toFixed(2)),
    };
}

export default {
    getXPForLevel,
    calculateLevel,
    getCharacterClass,
    calculateQuestScore,
    calculateRewards,
    processLevelUp,
    calculateFinancialHealth,
    calculateMiniGameReward,
};
