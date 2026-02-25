-- FinQuest RPG - Complete Database Schema
-- Financial Literacy RPG Quest

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CHARACTERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    class VARCHAR(50) DEFAULT 'Financial Apprentice',
    level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 50),
    xp INTEGER DEFAULT 0,
    xp_to_next_level INTEGER DEFAULT 100,
    gold DECIMAL(15,2) DEFAULT 500.00,
    
    -- Financial Stats
    income DECIMAL(15,2) DEFAULT 2000.00,
    net_worth DECIMAL(15,2) DEFAULT 1000.00,
    debt DECIMAL(15,2) DEFAULT 0.00,
    credit_score INTEGER DEFAULT 650 CHECK (credit_score >= 300 AND credit_score <= 850),
    emergency_fund DECIMAL(15,2) DEFAULT 0.00,
    investments DECIMAL(15,2) DEFAULT 0.00,
    savings_rate DECIMAL(5,2) DEFAULT 0.00,
    monthly_expenses DECIMAL(15,2) DEFAULT 1500.00,
    
    -- RPG Stats
    wisdom INTEGER DEFAULT 5,
    discipline INTEGER DEFAULT 5,
    risk_tolerance INTEGER DEFAULT 5,
    negotiation INTEGER DEFAULT 5,
    
    total_quests_completed INTEGER DEFAULT 0,
    total_gold_earned DECIMAL(15,2) DEFAULT 0.00,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT one_character_per_user UNIQUE(user_id)
);

-- ============================================
-- QUEST CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS quest_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- QUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id INTEGER REFERENCES quest_categories(id),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    story_text TEXT,
    difficulty VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
    min_level INTEGER DEFAULT 1,
    xp_reward INTEGER NOT NULL DEFAULT 50,
    gold_reward DECIMAL(10,2) NOT NULL DEFAULT 25.00,
    stat_rewards JSONB DEFAULT '{}',
    learning_content TEXT,
    questions JSONB NOT NULL DEFAULT '[]',
    time_limit_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    prerequisite_quest_id UUID REFERENCES quests(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PLAYER QUEST PROGRESS
-- ============================================
CREATE TABLE IF NOT EXISTS player_quest_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'accepted' CHECK (status IN ('accepted', 'in_progress', 'completed', 'failed')),
    score INTEGER DEFAULT 0,
    answers JSONB DEFAULT '[]',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    attempts INTEGER DEFAULT 1,
    
    CONSTRAINT unique_active_quest UNIQUE(character_id, quest_id)
);

-- ============================================
-- ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon VARCHAR(50),
    category VARCHAR(50),
    rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
    condition_type VARCHAR(50) NOT NULL,
    condition_value DECIMAL(15,2) NOT NULL,
    xp_bonus INTEGER DEFAULT 0,
    gold_bonus DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PLAYER ACHIEVEMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS player_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_player_achievement UNIQUE(character_id, achievement_id)
);

-- ============================================
-- FRIENDSHIPS
-- ============================================
CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_friendship UNIQUE(user_id, friend_id),
    CONSTRAINT no_self_friend CHECK (user_id != friend_id)
);

-- ============================================
-- MINI GAME SCORES
-- ============================================
CREATE TABLE IF NOT EXISTS mini_game_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    game_type VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    data JSONB DEFAULT '{}',
    played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ACTIVITY LOG
-- ============================================
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    description TEXT,
    xp_gained INTEGER DEFAULT 0,
    gold_gained DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id);
CREATE INDEX IF NOT EXISTS idx_characters_level ON characters(level DESC);
CREATE INDEX IF NOT EXISTS idx_characters_net_worth ON characters(net_worth DESC);
CREATE INDEX IF NOT EXISTS idx_quests_category ON quests(category_id);
CREATE INDEX IF NOT EXISTS idx_quests_difficulty ON quests(difficulty);
CREATE INDEX IF NOT EXISTS idx_player_progress_character ON player_quest_progress(character_id);
CREATE INDEX IF NOT EXISTS idx_player_achievements_character ON player_achievements(character_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_character ON activity_log(character_id);
CREATE INDEX IF NOT EXISTS idx_mini_game_scores_character ON mini_game_scores(character_id);

-- ============================================
-- SEED DATA: Quest Categories
-- ============================================
INSERT INTO quest_categories (name, description, icon, color) VALUES
    ('Budgeting', 'Learn to manage your money and create effective budgets', '📊', '#4CAF50'),
    ('Saving', 'Build healthy saving habits and grow your emergency fund', '🏦', '#2196F3'),
    ('Investing', 'Understand markets, stocks, bonds, and grow your wealth', '📈', '#FF9800'),
    ('Debt Management', 'Strategies to manage and eliminate debt effectively', '💳', '#F44336'),
    ('Credit Building', 'Build and maintain a strong credit score', '⭐', '#9C27B0'),
    ('Retirement', 'Plan for a secure financial future', '🏖️', '#00BCD4')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- SEED DATA: Quests
-- ============================================
INSERT INTO quests (category_id, title, description, story_text, difficulty, min_level, xp_reward, gold_reward, learning_content, questions, stat_rewards) VALUES

-- BUDGETING QUESTS
(1, 'The Budget Awakening', 'Learn the fundamentals of creating your first budget', 
'You arrive at the village of Goldshire, where the elder tells you that many villagers struggle with their finances. Your first quest: learn the ancient art of budgeting!',
'beginner', 1, 100, 50.00,
'A budget is a plan for how you will spend your money. The 50/30/20 rule suggests: 50% for needs (rent, food, utilities), 30% for wants (entertainment, dining out), and 20% for savings and debt repayment. Creating a budget helps you understand where your money goes and ensures you can cover essential expenses while saving for the future.',
'[
    {"id": 1, "question": "What percentage of income should go to needs according to the 50/30/20 rule?", "options": ["30%", "50%", "20%", "40%"], "correct": 1, "explanation": "The 50/30/20 rule allocates 50% of income to needs like rent, food, and utilities."},
    {"id": 2, "question": "Which of these is considered a NEED, not a WANT?", "options": ["Netflix subscription", "Rent payment", "Designer shoes", "Concert tickets"], "correct": 1, "explanation": "Rent is a basic necessity. Entertainment and luxury items are wants."},
    {"id": 3, "question": "Why is tracking expenses important?", "options": ["To impress your friends", "To understand spending patterns and find areas to save", "It is not important", "Only accountants need to track expenses"], "correct": 1, "explanation": "Tracking expenses helps you understand where your money goes and identify areas where you can cut back."},
    {"id": 4, "question": "What should you do first when creating a budget?", "options": ["Plan a vacation", "Calculate your total income", "Buy budgeting software", "Ask for a raise"], "correct": 1, "explanation": "The first step in budgeting is knowing how much money you have coming in."}
]',
'{"wisdom": 2, "discipline": 1}'),

(1, 'The Expense Tracker', 'Master the art of tracking every coin', 
'The guild master notices your budgeting skills and challenges you to track every expense for a month. Can you categorize your spending?',
'beginner', 3, 150, 75.00,
'Expense tracking is the foundation of good financial management. Categories include: Fixed expenses (rent, insurance), Variable expenses (groceries, gas), and Discretionary expenses (entertainment, dining). Use the envelope method, apps, or spreadsheets to track every dollar.',
'[
    {"id": 1, "question": "Which expense category is the easiest to reduce?", "options": ["Rent", "Insurance premiums", "Discretionary spending", "Loan payments"], "correct": 2, "explanation": "Discretionary spending on entertainment, dining out, etc. is the easiest category to reduce."},
    {"id": 2, "question": "What is a fixed expense?", "options": ["Grocery bills", "Monthly rent", "Gas for your car", "Restaurant meals"], "correct": 1, "explanation": "Fixed expenses like rent stay the same each month, making them predictable."},
    {"id": 3, "question": "The envelope budgeting method involves:", "options": ["Putting all money in one envelope", "Allocating cash to different category envelopes", "Mailing your bills", "Saving envelopes for recycling"], "correct": 1, "explanation": "The envelope method assigns specific amounts of cash to spending category envelopes."}
]',
'{"wisdom": 1, "discipline": 3}'),

-- SAVING QUESTS
(2, 'The Emergency Shield', 'Build your financial safety net', 
'A storm approaches the kingdom! The wise wizard teaches you about the magical shield of emergency savings that protects against financial disasters.',
'beginner', 2, 120, 60.00,
'An emergency fund is money saved for unexpected expenses like medical bills, car repairs, or job loss. Financial experts recommend saving 3-6 months of expenses. Start small - even $500 can prevent a financial crisis. Keep emergency funds in a high-yield savings account for easy access.',
'[
    {"id": 1, "question": "How many months of expenses should an ideal emergency fund cover?", "options": ["1 month", "3-6 months", "12 months", "24 months"], "correct": 1, "explanation": "Financial experts recommend 3-6 months of living expenses in your emergency fund."},
    {"id": 2, "question": "Where should you keep your emergency fund?", "options": ["Under your mattress", "In stocks", "In a high-yield savings account", "In cryptocurrency"], "correct": 2, "explanation": "A high-yield savings account offers easy access and earns interest while keeping your money safe."},
    {"id": 3, "question": "Which is a good reason to use your emergency fund?", "options": ["A sale at your favorite store", "An unexpected medical bill", "A new video game release", "A vacation opportunity"], "correct": 1, "explanation": "Emergency funds are for unexpected, necessary expenses like medical bills."},
    {"id": 4, "question": "What is a good first savings goal for an emergency fund?", "options": ["$50", "$500-$1000", "$50,000", "$1 million"], "correct": 1, "explanation": "Starting with $500-$1000 provides a basic safety net and builds the saving habit."}
]',
'{"wisdom": 2, "discipline": 2}'),

(2, 'The Compound Interest Scroll', 'Discover the magic of compound interest',
'Deep in the library, you find an ancient scroll that reveals the most powerful force in finance: compound interest!',
'intermediate', 5, 200, 100.00,
'Compound interest is earning interest on your interest. If you invest $1,000 at 7% annual return, after 30 years it becomes about $7,612! The Rule of 72: divide 72 by the interest rate to estimate how many years it takes to double your money. At 7%, your money doubles roughly every 10.3 years. Start early - time is your greatest ally!',
'[
    {"id": 1, "question": "What is compound interest?", "options": ["Interest on only the principal", "Interest earned on both principal and accumulated interest", "A type of bank fee", "Government-mandated interest"], "correct": 1, "explanation": "Compound interest means you earn interest on your original investment PLUS all previously earned interest."},
    {"id": 2, "question": "Using the Rule of 72, how long to double money at 8% interest?", "options": ["6 years", "8 years", "9 years", "12 years"], "correct": 2, "explanation": "72 ÷ 8 = 9 years. The Rule of 72 gives a quick estimate of doubling time."},
    {"id": 3, "question": "Why is starting to invest early so important?", "options": ["Early investors get special rates", "More time means more compounding periods", "Banks prefer young customers", "It does not actually matter"], "correct": 1, "explanation": "More time = more compounding cycles = exponentially more growth. Time is the biggest factor in compound interest."}
]',
'{"wisdom": 3, "discipline": 1}'),

-- INVESTING QUESTS
(3, 'The Stock Market Arena', 'Enter the arena of stocks and shares',
'You enter the great Market Arena where traders shout prices and fortunes are made. The arena master will teach you the fundamentals of stock investing.',
'intermediate', 5, 200, 100.00,
'Stocks represent ownership shares in a company. When you buy a stock, you become a partial owner. Stock prices fluctuate based on supply/demand and company performance. Key concepts: Dividends (profit sharing), P/E Ratio (price relative to earnings), Market Cap (total company value), and Diversification (spreading risk across many investments).',
'[
    {"id": 1, "question": "What does owning a stock mean?", "options": ["You loaned money to a company", "You own a small part of the company", "You work for the company", "You owe the company money"], "correct": 1, "explanation": "A stock represents partial ownership in a company. Stockholders are actual owners."},
    {"id": 2, "question": "What is diversification?", "options": ["Buying only tech stocks", "Spreading investments across different assets to reduce risk", "Investing all money at once", "Only investing in bonds"], "correct": 1, "explanation": "Diversification means spreading investments across different assets, sectors, and types to reduce overall risk."},
    {"id": 3, "question": "What is a dividend?", "options": ["A stock market fee", "A share of company profits paid to stockholders", "A type of tax", "A trading strategy"], "correct": 1, "explanation": "Dividends are portions of a company''s profits distributed to shareholders."},
    {"id": 4, "question": "What does P/E ratio measure?", "options": ["Profit and expense", "Price relative to earnings", "Percentage of equity", "Performance evaluation"], "correct": 1, "explanation": "P/E (Price-to-Earnings) ratio shows how much investors pay per dollar of company earnings."}
]',
'{"wisdom": 2, "risk_tolerance": 2}'),

(3, 'The Index Fund Fortress', 'Learn the power of passive investing',
'A legendary investor guards the Index Fund Fortress. She reveals that most active traders fail to beat the market and teaches you a better way.',
'intermediate', 8, 250, 125.00,
'Index funds track a market index like the S&P 500, which represents the 500 largest US companies. Benefits: Low fees (0.03-0.2% vs 1-2% for active funds), Broad diversification, Historically strong returns (~10% average annually). Dollar-cost averaging means investing fixed amounts regularly regardless of market price, reducing timing risk.',
'[
    {"id": 1, "question": "What is an index fund?", "options": ["A fund that tries to beat the market", "A fund that tracks a market index", "A savings account", "A type of bond"], "correct": 1, "explanation": "Index funds passively track a market index, aiming to match its performance rather than beat it."},
    {"id": 2, "question": "What is dollar-cost averaging?", "options": ["Buying only when prices are low", "Investing a fixed amount at regular intervals", "Converting dollars to other currencies", "Saving dollar coins"], "correct": 1, "explanation": "Dollar-cost averaging means investing the same amount regularly regardless of market price, reducing the impact of volatility."},
    {"id": 3, "question": "Why do index funds typically outperform actively managed funds over time?", "options": ["They are riskier", "Lower fees and consistent market returns", "They invest in better companies", "They have better managers"], "correct": 1, "explanation": "Index funds have much lower fees, and most active managers fail to consistently beat the market."}
]',
'{"wisdom": 3, "risk_tolerance": 1}'),

-- DEBT MANAGEMENT QUESTS
(4, 'The Debt Dragon', 'Face the fearsome Debt Dragon and learn to defeat it',
'A mighty dragon of debt terrorizes the land! You must learn the ancient strategies to slay this beast before it consumes your financial kingdom.',
'beginner', 3, 150, 75.00,
'Debt can be good (mortgage, student loans for career investment) or bad (high-interest credit cards, payday loans). Two main payoff strategies: Debt Avalanche (pay highest interest first - saves most money) and Debt Snowball (pay smallest balance first - psychological wins). Always pay at least the minimum on all debts to avoid penalties.',
'[
    {"id": 1, "question": "Which debt payoff method saves the most money in interest?", "options": ["Debt Snowball", "Debt Avalanche", "Paying minimum only", "Ignoring the debt"], "correct": 1, "explanation": "The Debt Avalanche method, which targets highest interest debts first, minimizes total interest paid."},
    {"id": 2, "question": "Which is generally considered ''good debt''?", "options": ["Credit card debt for shopping", "Payday loans", "Student loans for a useful degree", "Borrowing for a vacation"], "correct": 2, "explanation": "Student loans can be ''good debt'' because education typically increases earning potential."},
    {"id": 3, "question": "What should you always pay on every debt?", "options": ["Nothing if you cannot afford it", "At least the minimum payment", "Only pay your favorite creditor", "Pay once a year"], "correct": 1, "explanation": "Always pay at least the minimum on all debts to avoid penalties, fees, and credit score damage."},
    {"id": 4, "question": "What is the Debt Snowball method?", "options": ["Paying all debts equally", "Paying the largest debt first", "Paying the smallest balance first for quick wins", "Only paying during winter"], "correct": 2, "explanation": "Debt Snowball focuses on paying off the smallest balance first to build momentum and motivation."}
]',
'{"discipline": 3, "wisdom": 1}'),

-- CREDIT BUILDING QUESTS
(5, 'The Credit Score Crystal', 'Understand the mystical Credit Score Crystal',
'The oracle reveals a glowing crystal that displays your credit worthiness. Understanding this crystal is key to unlocking the best financial opportunities.',
'intermediate', 5, 180, 90.00,
'A credit score (300-850) measures your creditworthiness. Five factors: Payment History (35%), Credit Utilization (30%), Length of Credit History (15%), Credit Mix (10%), New Credit (10%). Tips: Pay on time always, keep utilization below 30%, don''t close old accounts, limit new applications.',
'[
    {"id": 1, "question": "What is the most important factor in your credit score?", "options": ["Credit utilization", "Payment history", "Length of credit history", "Types of credit"], "correct": 1, "explanation": "Payment history accounts for 35% of your credit score - the single largest factor."},
    {"id": 2, "question": "What credit utilization ratio should you aim for?", "options": ["Below 30%", "Exactly 50%", "Above 75%", "100%"], "correct": 0, "explanation": "Keeping credit utilization below 30% shows responsible credit management and helps your score."},
    {"id": 3, "question": "What is a good credit score range?", "options": ["300-500", "500-600", "670-739", "All scores are the same"], "correct": 2, "explanation": "670-739 is considered a ''good'' credit score. 740+ is ''very good'' to ''excellent''."}
]',
'{"wisdom": 2, "discipline": 2}'),

-- RETIREMENT QUESTS
(6, 'The Retirement Realm', 'Plan your journey to the Retirement Realm',
'Legends speak of a paradise called the Retirement Realm, where heroes who planned wisely live in comfort. The path there starts with a single step.',
'advanced', 10, 300, 150.00,
'Retirement accounts: 401(k) - employer-sponsored, often with matching contributions (free money!). IRA - Individual Retirement Account. Roth vs Traditional: Roth = taxed now, tax-free withdrawals; Traditional = tax deduction now, taxed on withdrawals. The 4% Rule: You can safely withdraw 4% of retirement savings annually. Target: 25x your annual expenses.',
'[
    {"id": 1, "question": "What is an employer 401(k) match?", "options": ["A loan from your employer", "Free money your employer adds to your retirement savings", "A penalty for early withdrawal", "A type of bonus"], "correct": 1, "explanation": "Employer matching is essentially free money - they contribute to your 401(k) based on your contributions."},
    {"id": 2, "question": "What is the difference between Roth and Traditional IRA?", "options": ["There is no difference", "Roth is taxed now but withdrawals are tax-free; Traditional gives tax deduction now but withdrawals are taxed", "Roth is for rich people", "Traditional is outdated"], "correct": 1, "explanation": "Roth: pay taxes now, withdraw tax-free in retirement. Traditional: tax deduction now, pay taxes on withdrawals."},
    {"id": 3, "question": "According to the 4% rule, how much do you need saved to withdraw $40,000/year?", "options": ["$400,000", "$800,000", "$1,000,000", "$2,000,000"], "correct": 2, "explanation": "$40,000 ÷ 0.04 = $1,000,000. You need 25x your annual withdrawal amount saved."}
]',
'{"wisdom": 3, "discipline": 2}')

ON CONFLICT DO NOTHING;

-- ============================================
-- SEED DATA: Achievements
-- ============================================
INSERT INTO achievements (name, description, icon, category, rarity, condition_type, condition_value, xp_bonus, gold_bonus) VALUES
    ('First Steps', 'Complete your first quest', '🎯', 'quests', 'common', 'quests_completed', 1, 50, 25),
    ('Quest Warrior', 'Complete 10 quests', '⚔️', 'quests', 'uncommon', 'quests_completed', 10, 200, 100),
    ('Quest Master', 'Complete 25 quests', '🏆', 'quests', 'rare', 'quests_completed', 25, 500, 250),
    ('Quest Legend', 'Complete 50 quests', '👑', 'quests', 'legendary', 'quests_completed', 50, 1000, 500),
    
    ('Level 5 Hero', 'Reach level 5', '⭐', 'level', 'common', 'level', 5, 100, 50),
    ('Level 10 Champion', 'Reach level 10', '🌟', 'level', 'uncommon', 'level', 10, 250, 125),
    ('Level 25 Master', 'Reach level 25', '💫', 'level', 'rare', 'level', 25, 500, 250),
    ('Level 50 Legend', 'Reach the maximum level', '🔥', 'level', 'legendary', 'level', 50, 2000, 1000),
    
    ('Penny Saver', 'Accumulate 1,000 gold', '💰', 'wealth', 'common', 'gold', 1000, 50, 25),
    ('Gold Hoarder', 'Accumulate 10,000 gold', '💎', 'wealth', 'uncommon', 'gold', 10000, 200, 100),
    ('Treasure Lord', 'Accumulate 100,000 gold', '🏰', 'wealth', 'rare', 'gold', 100000, 500, 250),
    ('Financial Titan', 'Accumulate 1,000,000 gold', '🌍', 'wealth', 'legendary', 'gold', 1000000, 2000, 1000),
    
    ('Debt Free', 'Reduce your debt to zero', '🆓', 'debt', 'rare', 'zero_debt', 0, 500, 250),
    ('Emergency Ready', 'Build emergency fund to $5,000', '🛡️', 'savings', 'uncommon', 'emergency_fund', 5000, 200, 100),
    ('Safety Net Pro', 'Build emergency fund to $15,000', '🏥', 'savings', 'rare', 'emergency_fund', 15000, 500, 250),
    
    ('Smart Investor', 'Invest $10,000 total', '📊', 'investing', 'uncommon', 'investments', 10000, 200, 100),
    ('Portfolio Master', 'Invest $100,000 total', '🎩', 'investing', 'rare', 'investments', 100000, 500, 250),
    
    ('Credit Builder', 'Reach a credit score of 700', '📈', 'credit', 'uncommon', 'credit_score', 700, 200, 100),
    ('Perfect Credit', 'Reach a credit score of 800+', '💳', 'credit', 'epic', 'credit_score', 800, 500, 250),
    
    ('Budget Master', 'Complete all budgeting quests', '📋', 'mastery', 'epic', 'category_mastery', 1, 500, 250),
    ('Savings Sage', 'Complete all saving quests', '🏦', 'mastery', 'epic', 'category_mastery', 2, 500, 250),
    ('Investment Wizard', 'Complete all investing quests', '🧙', 'mastery', 'epic', 'category_mastery', 3, 500, 250),
    ('Debt Destroyer', 'Complete all debt management quests', '💪', 'mastery', 'epic', 'category_mastery', 4, 500, 250),
    
    ('Mini Game Rookie', 'Play 5 mini games', '🎮', 'minigames', 'common', 'minigames_played', 5, 50, 25),
    ('Mini Game Pro', 'Play 25 mini games', '🕹️', 'minigames', 'uncommon', 'minigames_played', 25, 200, 100),
    
    ('Social Butterfly', 'Add 5 friends', '🦋', 'social', 'uncommon', 'friends_count', 5, 100, 50),
    ('Community Leader', 'Add 20 friends', '👥', 'social', 'rare', 'friends_count', 20, 300, 150)
ON CONFLICT (name) DO NOTHING;
