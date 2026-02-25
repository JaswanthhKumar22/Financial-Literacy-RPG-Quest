import { Router } from 'express';
import { query } from '../db/pool.js';
import { authenticateToken } from '../middleware/auth.js';
import { calculateQuestScore, calculateRewards, processLevelUp, getCharacterClass } from '../utils/gameLogic.js';

const router = Router();

// GET /api/quests - Get all available quests
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { category, difficulty } = req.query;

        let sql = `
      SELECT q.*, qc.name as category_name, qc.icon as category_icon, qc.color as category_color
      FROM quests q
      JOIN quest_categories qc ON q.category_id = qc.id
      WHERE q.is_active = true
    `;
        const params = [];

        if (category) {
            params.push(category);
            sql += ` AND qc.name = $${params.length}`;
        }
        if (difficulty) {
            params.push(difficulty);
            sql += ` AND q.difficulty = $${params.length}`;
        }

        sql += ' ORDER BY q.order_index, q.min_level, q.created_at';

        const result = await query(sql, params);

        // Get user's character for progress info
        const charResult = await query('SELECT id, level FROM characters WHERE user_id = $1', [req.user.userId]);
        const character = charResult.rows[0];

        let quests = result.rows;

        if (character) {
            // Get progress for each quest
            const progressResult = await query(
                'SELECT quest_id, status, score FROM player_quest_progress WHERE character_id = $1',
                [character.id]
            );

            const progressMap = {};
            progressResult.rows.forEach(p => {
                progressMap[p.quest_id] = p;
            });

            quests = quests.map(q => ({
                ...q,
                progress: progressMap[q.id] || null,
                isLocked: q.min_level > (character?.level || 1),
                questions: undefined, // Don't send questions in list view
            }));
        }

        res.json({ quests });
    } catch (error) {
        console.error('Get quests error:', error);
        res.status(500).json({ error: 'Failed to fetch quests' });
    }
});

// GET /api/quests/categories - Get quest categories
router.get('/categories', authenticateToken, async (req, res) => {
    try {
        const result = await query(`
      SELECT qc.*, COUNT(q.id) as quest_count
      FROM quest_categories qc
      LEFT JOIN quests q ON qc.id = q.category_id AND q.is_active = true
      GROUP BY qc.id
      ORDER BY qc.id
    `);

        res.json({ categories: result.rows });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// GET /api/quests/:id - Get single quest with full details
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            `SELECT q.*, qc.name as category_name, qc.icon as category_icon, qc.color as category_color
       FROM quests q
       JOIN quest_categories qc ON q.category_id = qc.id
       WHERE q.id = $1`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Quest not found' });
        }

        const quest = result.rows[0];

        // Get progress if exists
        const charResult = await query('SELECT id FROM characters WHERE user_id = $1', [req.user.userId]);
        if (charResult.rows.length > 0) {
            const progressResult = await query(
                'SELECT * FROM player_quest_progress WHERE character_id = $1 AND quest_id = $2',
                [charResult.rows[0].id, quest.id]
            );
            quest.progress = progressResult.rows[0] || null;
        }

        res.json({ quest });
    } catch (error) {
        console.error('Get quest error:', error);
        res.status(500).json({ error: 'Failed to fetch quest' });
    }
});

// POST /api/quests/:id/accept - Accept a quest
router.post('/:id/accept', authenticateToken, async (req, res) => {
    try {
        const charResult = await query('SELECT * FROM characters WHERE user_id = $1', [req.user.userId]);
        if (charResult.rows.length === 0) {
            return res.status(404).json({ error: 'Create a character first' });
        }

        const character = charResult.rows[0];
        const questResult = await query('SELECT * FROM quests WHERE id = $1', [req.params.id]);

        if (questResult.rows.length === 0) {
            return res.status(404).json({ error: 'Quest not found' });
        }

        const quest = questResult.rows[0];

        if (character.level < quest.min_level) {
            return res.status(403).json({ error: `You need to be level ${quest.min_level} to accept this quest` });
        }

        // Check if already accepted
        const existing = await query(
            `SELECT * FROM player_quest_progress 
       WHERE character_id = $1 AND quest_id = $2`,
            [character.id, quest.id]
        );

        if (existing.rows.length > 0) {
            if (existing.rows[0].status === 'completed') {
                // Allow re-attempt
                await query(
                    `UPDATE player_quest_progress SET status = 'accepted', score = 0, 
           answers = '[]', started_at = NOW(), completed_at = NULL,
           attempts = attempts + 1
           WHERE id = $1 RETURNING *`,
                    [existing.rows[0].id]
                );
            } else {
                return res.status(409).json({ error: 'Quest already accepted' });
            }
        } else {
            await query(
                `INSERT INTO player_quest_progress (character_id, quest_id, status)
         VALUES ($1, $2, 'accepted')`,
                [character.id, quest.id]
            );
        }

        // Log activity
        await query(
            `INSERT INTO activity_log (character_id, action_type, description)
       VALUES ($1, 'quest_accepted', $2)`,
            [character.id, `Accepted quest: ${quest.title}`]
        );

        res.json({ message: `Quest "${quest.title}" accepted!`, quest });
    } catch (error) {
        console.error('Accept quest error:', error);
        res.status(500).json({ error: 'Failed to accept quest' });
    }
});

// POST /api/quests/:id/submit - Submit quest answers
router.post('/:id/submit', authenticateToken, async (req, res) => {
    try {
        const { answers } = req.body;

        const charResult = await query('SELECT * FROM characters WHERE user_id = $1', [req.user.userId]);
        if (charResult.rows.length === 0) {
            return res.status(404).json({ error: 'Character not found' });
        }

        const character = charResult.rows[0];
        const questResult = await query('SELECT * FROM quests WHERE id = $1', [req.params.id]);

        if (questResult.rows.length === 0) {
            return res.status(404).json({ error: 'Quest not found' });
        }

        const quest = questResult.rows[0];
        const questions = quest.questions;

        // Calculate score
        const scoreResult = calculateQuestScore(answers, questions);
        const rewards = calculateRewards(quest, scoreResult);

        const status = scoreResult.passed ? 'completed' : 'failed';

        // Update quest progress
        await query(
            `UPDATE player_quest_progress 
       SET status = $1, score = $2, answers = $3, completed_at = NOW()
       WHERE character_id = $4 AND quest_id = $5`,
            [status, scoreResult.percentage, JSON.stringify(answers), character.id, quest.id]
        );

        let levelUpResult = null;

        if (scoreResult.passed) {
            // Apply rewards
            const newXP = character.xp + rewards.xp;
            const newGold = parseFloat(character.gold) + rewards.gold;

            // Process level up
            levelUpResult = processLevelUp(newXP, character.level);

            // Apply stat rewards
            const statUpdates = rewards.statRewards || {};

            await query(
                `UPDATE characters SET 
          xp = $1, level = $2, xp_to_next_level = $3,
          gold = $4, class = $5,
          total_quests_completed = total_quests_completed + 1,
          total_gold_earned = total_gold_earned + $6,
          wisdom = wisdom + $7,
          discipline = discipline + $8,
          risk_tolerance = risk_tolerance + $9,
          negotiation = negotiation + $10,
          updated_at = NOW()
         WHERE id = $11`,
                [
                    levelUpResult.remainingXP,
                    levelUpResult.newLevel,
                    levelUpResult.xpToNextLevel,
                    newGold,
                    levelUpResult.newClass,
                    rewards.gold,
                    statUpdates.wisdom || 0,
                    statUpdates.discipline || 0,
                    statUpdates.risk_tolerance || 0,
                    statUpdates.negotiation || 0,
                    character.id,
                ]
            );

            // Log activity
            await query(
                `INSERT INTO activity_log (character_id, action_type, description, xp_gained, gold_gained)
         VALUES ($1, 'quest_completed', $2, $3, $4)`,
                [character.id, `Completed quest: ${quest.title} (Score: ${scoreResult.percentage}%)`, rewards.xp, rewards.gold]
            );

            // Check for achievements
            await checkAndAwardAchievements(character.id);
        } else {
            await query(
                `INSERT INTO activity_log (character_id, action_type, description)
         VALUES ($1, 'quest_failed', $2)`,
                [character.id, `Failed quest: ${quest.title} (Score: ${scoreResult.percentage}%)`]
            );
        }

        res.json({
            message: scoreResult.passed ? '🎉 Quest completed!' : '❌ Quest failed. Try again!',
            score: scoreResult,
            rewards: scoreResult.passed ? rewards : null,
            levelUp: levelUpResult?.levelUps?.length > 0 ? levelUpResult : null,
            questStatus: status,
            feedback: questions.map((q, i) => ({
                question: q.question,
                yourAnswer: answers[i],
                correctAnswer: q.correct,
                isCorrect: answers[i] === q.correct,
                explanation: q.explanation,
            })),
        });
    } catch (error) {
        console.error('Submit quest error:', error);
        res.status(500).json({ error: 'Failed to submit quest' });
    }
});

// Check and award achievements
async function checkAndAwardAchievements(characterId) {
    try {
        const charResult = await query('SELECT * FROM characters WHERE id = $1', [characterId]);
        const character = charResult.rows[0];

        // Get all achievements not yet earned
        const unearnedResult = await query(
            `SELECT a.* FROM achievements a
       WHERE a.id NOT IN (SELECT achievement_id FROM player_achievements WHERE character_id = $1)`,
            [characterId]
        );

        for (const achievement of unearnedResult.rows) {
            let earned = false;

            switch (achievement.condition_type) {
                case 'quests_completed':
                    earned = character.total_quests_completed >= achievement.condition_value;
                    break;
                case 'level':
                    earned = character.level >= achievement.condition_value;
                    break;
                case 'gold':
                    earned = parseFloat(character.total_gold_earned) >= achievement.condition_value;
                    break;
                case 'zero_debt':
                    earned = parseFloat(character.debt) === 0;
                    break;
                case 'emergency_fund':
                    earned = parseFloat(character.emergency_fund) >= achievement.condition_value;
                    break;
                case 'investments':
                    earned = parseFloat(character.investments) >= achievement.condition_value;
                    break;
                case 'credit_score':
                    earned = character.credit_score >= achievement.condition_value;
                    break;
            }

            if (earned) {
                await query(
                    `INSERT INTO player_achievements (character_id, achievement_id) VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
                    [characterId, achievement.id]
                );

                // Apply achievement bonuses
                if (achievement.xp_bonus > 0 || achievement.gold_bonus > 0) {
                    await query(
                        `UPDATE characters SET 
              xp = xp + $1, gold = gold + $2, updated_at = NOW()
             WHERE id = $3`,
                        [achievement.xp_bonus, achievement.gold_bonus, characterId]
                    );
                }

                await query(
                    `INSERT INTO activity_log (character_id, action_type, description, xp_gained, gold_gained)
           VALUES ($1, 'achievement_unlocked', $2, $3, $4)`,
                    [characterId, `🏆 Achievement Unlocked: ${achievement.name}`, achievement.xp_bonus, achievement.gold_bonus]
                );
            }
        }
    } catch (error) {
        console.error('Achievement check error:', error);
    }
}

export default router;
