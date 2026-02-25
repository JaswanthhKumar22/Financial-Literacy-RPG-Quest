import { Router } from 'express';
import { query } from '../db/pool.js';
import { authenticateToken } from '../middleware/auth.js';
import { calculateMiniGameReward } from '../utils/gameLogic.js';

const router = Router();

// POST /api/minigames/score - Submit mini-game score
router.post('/score', authenticateToken, async (req, res) => {
    try {
        const { gameType, score, data } = req.body;

        const validGames = ['budget_balance', 'compound_interest', 'debt_payoff', 'investment_sim'];
        if (!validGames.includes(gameType)) {
            return res.status(400).json({ error: 'Invalid game type' });
        }

        const charResult = await query('SELECT * FROM characters WHERE user_id = $1', [req.user.userId]);
        if (charResult.rows.length === 0) {
            return res.status(404).json({ error: 'Character not found' });
        }

        const character = charResult.rows[0];
        const rewards = calculateMiniGameReward(gameType, score, character.level);

        // Save score
        await query(
            `INSERT INTO mini_game_scores (character_id, game_type, score, data)
       VALUES ($1, $2, $3, $4)`,
            [character.id, gameType, score, JSON.stringify(data || {})]
        );

        // Apply rewards
        await query(
            `UPDATE characters SET 
        xp = xp + $1, gold = gold + $2, updated_at = NOW()
       WHERE id = $3`,
            [rewards.xp, rewards.gold, character.id]
        );

        // Log activity
        await query(
            `INSERT INTO activity_log (character_id, action_type, description, xp_gained, gold_gained)
       VALUES ($1, 'minigame_played', $2, $3, $4)`,
            [character.id, `Played ${gameType.replace('_', ' ')} - Score: ${score}`, rewards.xp, rewards.gold]
        );

        res.json({
            message: 'Score submitted!',
            score,
            rewards,
        });
    } catch (error) {
        console.error('Mini-game score error:', error);
        res.status(500).json({ error: 'Failed to submit score' });
    }
});

// GET /api/minigames/history - Get mini-game history
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const charResult = await query('SELECT id FROM characters WHERE user_id = $1', [req.user.userId]);
        if (charResult.rows.length === 0) {
            return res.status(404).json({ error: 'Character not found' });
        }

        const result = await query(
            `SELECT game_type, score, data, played_at
       FROM mini_game_scores WHERE character_id = $1
       ORDER BY played_at DESC LIMIT 50`,
            [charResult.rows[0].id]
        );

        res.json({ history: result.rows });
    } catch (error) {
        console.error('Mini-game history error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// GET /api/minigames/best - Get best scores
router.get('/best', authenticateToken, async (req, res) => {
    try {
        const charResult = await query('SELECT id FROM characters WHERE user_id = $1', [req.user.userId]);
        if (charResult.rows.length === 0) {
            return res.status(404).json({ error: 'Character not found' });
        }

        const result = await query(
            `SELECT game_type, MAX(score) as best_score, COUNT(*) as times_played
       FROM mini_game_scores WHERE character_id = $1
       GROUP BY game_type`,
            [charResult.rows[0].id]
        );

        res.json({ bestScores: result.rows });
    } catch (error) {
        console.error('Best scores error:', error);
        res.status(500).json({ error: 'Failed to fetch best scores' });
    }
});

export default router;
