import { Router } from 'express';
import { query } from '../db/pool.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/achievements - Get all achievements with unlock status
router.get('/', authenticateToken, async (req, res) => {
    try {
        const charResult = await query('SELECT id FROM characters WHERE user_id = $1', [req.user.userId]);

        let achievements;
        if (charResult.rows.length > 0) {
            const characterId = charResult.rows[0].id;
            achievements = await query(
                `SELECT a.*, 
          CASE WHEN pa.id IS NOT NULL THEN true ELSE false END as unlocked,
          pa.unlocked_at
         FROM achievements a
         LEFT JOIN player_achievements pa ON a.id = pa.achievement_id AND pa.character_id = $1
         ORDER BY a.category, a.condition_value`,
                [characterId]
            );
        } else {
            achievements = await query('SELECT *, false as unlocked FROM achievements ORDER BY category, condition_value');
        }

        res.json({ achievements: achievements.rows });
    } catch (error) {
        console.error('Get achievements error:', error);
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
});

// GET /api/achievements/my - Get player's unlocked achievements
router.get('/my', authenticateToken, async (req, res) => {
    try {
        const charResult = await query('SELECT id FROM characters WHERE user_id = $1', [req.user.userId]);
        if (charResult.rows.length === 0) {
            return res.status(404).json({ error: 'Character not found' });
        }

        const result = await query(
            `SELECT a.*, pa.unlocked_at
       FROM player_achievements pa
       JOIN achievements a ON pa.achievement_id = a.id
       WHERE pa.character_id = $1
       ORDER BY pa.unlocked_at DESC`,
            [charResult.rows[0].id]
        );

        res.json({ achievements: result.rows });
    } catch (error) {
        console.error('Get my achievements error:', error);
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
});

export default router;
