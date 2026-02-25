import { Router } from 'express';
import { query } from '../db/pool.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/leaderboard - Get global leaderboard
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { sort = 'level', limit = 50 } = req.query;

        const validSorts = {
            level: 'c.level DESC, c.xp DESC',
            net_worth: 'c.net_worth DESC',
            gold: 'c.total_gold_earned DESC',
            quests: 'c.total_quests_completed DESC',
        };

        const orderBy = validSorts[sort] || validSorts.level;

        const result = await query(
            `SELECT 
        c.id, c.name, c.class, c.level, c.xp, c.net_worth, c.gold,
        c.total_quests_completed, c.total_gold_earned,
        u.username,
        (SELECT COUNT(*) FROM player_achievements pa WHERE pa.character_id = c.id) as achievement_count,
        ROW_NUMBER() OVER (ORDER BY ${orderBy}) as rank
       FROM characters c
       JOIN users u ON c.user_id = u.id
       WHERE u.is_active = true
       ORDER BY ${orderBy}
       LIMIT $1`,
            [Math.min(parseInt(limit), 100)]
        );

        // Get current user's rank
        const userRank = await query(
            `SELECT rank FROM (
        SELECT c.id, ROW_NUMBER() OVER (ORDER BY ${orderBy}) as rank
        FROM characters c JOIN users u ON c.user_id = u.id WHERE u.is_active = true
       ) ranked WHERE id = (SELECT id FROM characters WHERE user_id = $1)`,
            [req.user.userId]
        );

        res.json({
            leaderboard: result.rows,
            myRank: userRank.rows[0]?.rank || null,
            sortBy: sort,
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

export default router;
