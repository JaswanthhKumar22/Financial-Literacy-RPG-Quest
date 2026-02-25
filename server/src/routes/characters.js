import { Router } from 'express';
import { query } from '../db/pool.js';
import { authenticateToken } from '../middleware/auth.js';
import { getCharacterClass, getXPForLevel, calculateFinancialHealth } from '../utils/gameLogic.js';

const router = Router();

// POST /api/characters - Create character
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.userId;

        if (!name || name.trim().length < 2) {
            return res.status(400).json({ error: 'Character name must be at least 2 characters' });
        }

        // Check if user already has a character
        const existing = await query('SELECT id FROM characters WHERE user_id = $1', [userId]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'You already have a character' });
        }

        const result = await query(
            `INSERT INTO characters (user_id, name, class, xp_to_next_level)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [userId, name.trim(), 'Financial Apprentice', getXPForLevel(1)]
        );

        const character = result.rows[0];

        // Log activity
        await query(
            `INSERT INTO activity_log (character_id, action_type, description)
       VALUES ($1, 'character_created', $2)`,
            [character.id, `Created character "${character.name}"`]
        );

        res.status(201).json({
            message: `Welcome, ${character.name}! Your financial journey begins!`,
            character,
        });
    } catch (error) {
        console.error('Character creation error:', error);
        res.status(500).json({ error: 'Failed to create character' });
    }
});

// GET /api/characters/me - Get current user's character
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const result = await query('SELECT * FROM characters WHERE user_id = $1', [req.user.userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No character found', hasCharacter: false });
        }

        const character = result.rows[0];
        character.financialHealth = calculateFinancialHealth(character);
        character.className = getCharacterClass(character.level);

        // Get achievement count
        const achievementCount = await query(
            'SELECT COUNT(*) FROM player_achievements WHERE character_id = $1',
            [character.id]
        );
        character.achievementCount = parseInt(achievementCount.rows[0].count);

        // Get recent activity
        const activity = await query(
            `SELECT * FROM activity_log WHERE character_id = $1 
       ORDER BY created_at DESC LIMIT 10`,
            [character.id]
        );
        character.recentActivity = activity.rows;

        res.json({ character });
    } catch (error) {
        console.error('Get character error:', error);
        res.status(500).json({ error: 'Failed to fetch character' });
    }
});

// PUT /api/characters/me - Update character
router.put('/me', authenticateToken, async (req, res) => {
    try {
        const { name } = req.body;
        const result = await query(
            `UPDATE characters SET name = COALESCE($1, name), updated_at = NOW()
       WHERE user_id = $2 RETURNING *`,
            [name, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Character not found' });
        }

        res.json({ character: result.rows[0] });
    } catch (error) {
        console.error('Update character error:', error);
        res.status(500).json({ error: 'Failed to update character' });
    }
});

// GET /api/characters/stats - Get detailed stats
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const charResult = await query('SELECT * FROM characters WHERE user_id = $1', [req.user.userId]);
        if (charResult.rows.length === 0) {
            return res.status(404).json({ error: 'Character not found' });
        }

        const character = charResult.rows[0];

        // Quest stats
        const questStats = await query(
            `SELECT 
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        AVG(score) FILTER (WHERE status = 'completed') as avg_score
       FROM player_quest_progress WHERE character_id = $1`,
            [character.id]
        );

        // Achievement stats
        const achievementStats = await query(
            `SELECT a.category, COUNT(*) as count
       FROM player_achievements pa
       JOIN achievements a ON pa.achievement_id = a.id
       WHERE pa.character_id = $1
       GROUP BY a.category`,
            [character.id]
        );

        // Mini game stats
        const miniGameStats = await query(
            `SELECT game_type, COUNT(*) as plays, MAX(score) as best_score, AVG(score) as avg_score
       FROM mini_game_scores WHERE character_id = $1
       GROUP BY game_type`,
            [character.id]
        );

        res.json({
            character,
            financialHealth: calculateFinancialHealth(character),
            questStats: questStats.rows[0],
            achievementStats: achievementStats.rows,
            miniGameStats: miniGameStats.rows,
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

export default router;
