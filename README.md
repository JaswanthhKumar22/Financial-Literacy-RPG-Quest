# ⚔️ FinQuest RPG — Financial Literacy Adventure

> Master personal finance through epic quests, mini-games, and RPG progression!

![Tech](https://img.shields.io/badge/React-18-blue) ![Tech](https://img.shields.io/badge/Node.js-Express-green) ![Tech](https://img.shields.io/badge/PostgreSQL-Database-blue) ![Tech](https://img.shields.io/badge/TailwindCSS-4-purple)

---

## 📁 Project Structure

```
Financial Literacy RPG Quest/
├── client/                          # React Frontend (Vite)
│   ├── src/
│   │   ├── api/
│   │   │   └── index.js             # Axios API layer
│   │   ├── components/
│   │   │   ├── LoadingScreen.jsx     # Animated loading screen
│   │   │   └── Navbar.jsx            # Navigation bar
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Auth state management
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx         # Login screen
│   │   │   ├── RegisterPage.jsx      # Registration screen
│   │   │   ├── CharacterCreation.jsx # Character creation
│   │   │   ├── Dashboard.jsx         # Main dashboard
│   │   │   ├── QuestBoard.jsx        # Quest listing
│   │   │   ├── QuestPlay.jsx         # Quest gameplay flow
│   │   │   ├── MiniGameArcade.jsx    # 4 mini-games
│   │   │   ├── Achievements.jsx      # Achievement gallery
│   │   │   ├── Leaderboard.jsx       # Global rankings
│   │   │   └── Social.jsx            # Friends & compare
│   │   ├── App.jsx                   # Routes & layout
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Global styles + design system
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                          # Node.js Backend
│   ├── src/
│   │   ├── db/
│   │   │   ├── pool.js              # PostgreSQL connection pool
│   │   │   ├── init.js              # Database initialization script
│   │   │   └── schema.sql           # Full database schema + seed data
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT authentication
│   │   ├── routes/
│   │   │   ├── auth.js              # Register/Login/Me
│   │   │   ├── characters.js        # CRUD + stats
│   │   │   ├── quests.js            # Quest system + scoring
│   │   │   ├── achievements.js      # Achievement tracking
│   │   │   ├── leaderboard.js       # Global rankings
│   │   │   ├── social.js            # Friends/Compare
│   │   │   └── minigames.js         # Mini-game scoring
│   │   ├── utils/
│   │   │   └── gameLogic.js         # XP/Level/Reward calculations
│   │   └── index.js                 # Express server entry
│   ├── .env                         # Environment variables
│   └── package.json
│
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** v18+
- **PostgreSQL** 14+
- **npm** or **yarn**

### Step 1: Database Setup

1. Install PostgreSQL and create the database:
```sql
CREATE DATABASE finquest;
```

2. Update `server/.env` with your PostgreSQL credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finquest
DB_USER=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=your_secret_key_here
```

3. Initialize the database (creates tables + seed data):
```bash
cd server
npm run db:init
```

### Step 2: Start the Backend
```bash
cd server
npm install
npm run dev
```
Server starts on **http://localhost:5000**

### Step 3: Start the Frontend
```bash
cd client
npm install
npm run dev
```
Frontend starts on **http://localhost:5173**

---

## 📡 API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/characters` | Create character |
| GET | `/api/characters/me` | Get my character |
| PUT | `/api/characters/me` | Update character |
| GET | `/api/characters/stats` | Detailed stats |
| GET | `/api/quests` | List all quests |
| GET | `/api/quests/categories` | Quest categories |
| GET | `/api/quests/:id` | Get quest details |
| POST | `/api/quests/:id/accept` | Accept quest |
| POST | `/api/quests/:id/submit` | Submit quest answers |
| GET | `/api/achievements` | All achievements |
| GET | `/api/achievements/my` | My achievements |
| GET | `/api/leaderboard` | Global leaderboard |
| GET | `/api/social/friends` | Friend list |
| GET | `/api/social/requests` | Pending requests |
| POST | `/api/social/add` | Send friend request |
| PUT | `/api/social/accept/:id` | Accept request |
| POST | `/api/social/compare/:userId` | Compare stats |
| GET | `/api/social/search` | Search users |
| POST | `/api/minigames/score` | Submit game score |
| GET | `/api/minigames/history` | Game history |
| GET | `/api/minigames/best` | Best scores |

---

## 🎮 Features

### 🧙 Character System
- Level 1–50 progression with exponential XP curve
- 10 character classes from "Financial Apprentice" to "Financial Grandmaster"
- Financial stats: income, net worth, debt, credit score, emergency fund, investments
- RPG stats: wisdom, discipline, risk tolerance, negotiation

### ⚔️ Quest System
- 9 quests across 6 categories (Budgeting, Saving, Investing, Debt, Credit, Retirement)
- 4-phase gameplay: Story → Learn → Challenge → Results
- Score-based rewards with difficulty multipliers
- Re-attempt failed quests

### 🎮 Mini-Games
- **Budget Balancer**: Allocate monthly income across categories
- **Interest Oracle**: Predict compound interest outcomes
- **Debt Slayer**: Strategize debt payoff allocation
- **Investment Simulator**: Build portfolios and simulate 5 years

### 🏆 Achievements
- 27 achievements across 10 categories
- 5 rarity tiers: Common, Uncommon, Rare, Epic, Legendary
- Auto-awarded on quest completion

### 📊 Leaderboard
- Global rankings by level, net worth, gold, or quests completed
- Shows your current rank

### 👥 Social
- Add friends, accept requests
- Visual stat comparison with friends
- User search

---

## 🎨 Design System
- **Dark RPG theme** with glassmorphism cards
- **Custom CSS** with Tailwind CSS v4
- **Fonts**: Cinzel (display), Inter (body), JetBrains Mono (stats)
- **Animations**: Float, shimmer, pulse glow, fade-in
- **Responsive** design for mobile & desktop

---

## 📊 Database Schema
- **8 tables**: users, characters, quest_categories, quests, player_quest_progress, achievements, player_achievements, friendships, mini_game_scores, activity_log
- Full indexes for performance
- Seed data with quests and achievements

---

## 🎯 Game Mechanics
- **XP Formula**: `100 * 1.15^(level-1)` per level
- **Quest Scoring**: Percentage correct × difficulty bonus
- **Financial Health**: Composite score (0-100) from emergency fund, debt ratio, credit score, savings rate
- **Reward Multipliers**: Beginner (1x), Intermediate (1.25x), Advanced (1.5x), Expert (2x)

---

## License
MIT
