import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Route imports
import authRoutes from './routes/auth.js';
import characterRoutes from './routes/characters.js';
import questRoutes from './routes/quests.js';
import achievementRoutes from './routes/achievements.js';
import leaderboardRoutes from './routes/leaderboard.js';
import socialRoutes from './routes/social.js';
import minigameRoutes from './routes/minigames.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: { error: 'Too many requests, please try again later' },
});
app.use(limiter);

// Parsing & logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/minigames', minigameRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: '⚔️ FinQuest RPG Server is running!',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
    });
});

app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════╗
  ║    ⚔️  FinQuest RPG Server v1.0.0  ⚔️    ║
  ║                                          ║
  ║    🌐 http://localhost:${PORT}              ║
  ║    📊 API: /api/*                        ║
  ║    🏥 Health: /api/health                ║
  ║                                          ║
  ╚══════════════════════════════════════════╝
  `);
});

export default app;
