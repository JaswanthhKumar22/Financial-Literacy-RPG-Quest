import { Router } from 'express';
import { query } from '../db/pool.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/social/friends - Get friend list
router.get('/friends', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            `SELECT 
        f.id as friendship_id, f.status, f.created_at,
        u.id as user_id, u.username, u.avatar_url,
        c.name as character_name, c.level, c.class, c.net_worth
       FROM friendships f
       JOIN users u ON (
         CASE WHEN f.user_id = $1 THEN f.friend_id ELSE f.user_id END
       ) = u.id
       LEFT JOIN characters c ON c.user_id = u.id
       WHERE (f.user_id = $1 OR f.friend_id = $1) AND f.status = 'accepted'
       ORDER BY c.level DESC`,
            [req.user.userId]
        );

        res.json({ friends: result.rows });
    } catch (error) {
        console.error('Get friends error:', error);
        res.status(500).json({ error: 'Failed to fetch friends' });
    }
});

// GET /api/social/requests - Get pending friend requests
router.get('/requests', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            `SELECT f.id, f.created_at, u.id as user_id, u.username, u.avatar_url,
        c.name as character_name, c.level
       FROM friendships f
       JOIN users u ON f.user_id = u.id
       LEFT JOIN characters c ON c.user_id = u.id
       WHERE f.friend_id = $1 AND f.status = 'pending'
       ORDER BY f.created_at DESC`,
            [req.user.userId]
        );

        res.json({ requests: result.rows });
    } catch (error) {
        console.error('Get friend requests error:', error);
        res.status(500).json({ error: 'Failed to fetch friend requests' });
    }
});

// POST /api/social/add - Send friend request
router.post('/add', authenticateToken, async (req, res) => {
    try {
        const { username } = req.body;

        const friendResult = await query('SELECT id FROM users WHERE username = $1', [username]);
        if (friendResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const friendId = friendResult.rows[0].id;

        if (friendId === req.user.userId) {
            return res.status(400).json({ error: 'You cannot add yourself as a friend' });
        }

        // Check existing friendship
        const existing = await query(
            `SELECT * FROM friendships 
       WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`,
            [req.user.userId, friendId]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Friend request already exists' });
        }

        await query(
            'INSERT INTO friendships (user_id, friend_id) VALUES ($1, $2)',
            [req.user.userId, friendId]
        );

        res.json({ message: `Friend request sent to ${username}!` });
    } catch (error) {
        console.error('Add friend error:', error);
        res.status(500).json({ error: 'Failed to send friend request' });
    }
});

// PUT /api/social/accept/:id - Accept friend request
router.put('/accept/:id', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            `UPDATE friendships SET status = 'accepted' 
       WHERE id = $1 AND friend_id = $2 AND status = 'pending'
       RETURNING *`,
            [req.params.id, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Friend request not found' });
        }

        res.json({ message: 'Friend request accepted!' });
    } catch (error) {
        console.error('Accept friend error:', error);
        res.status(500).json({ error: 'Failed to accept friend request' });
    }
});

// POST /api/social/compare/:userId - Compare stats with friend
router.post('/compare/:userId', authenticateToken, async (req, res) => {
    try {
        const myChar = await query('SELECT * FROM characters WHERE user_id = $1', [req.user.userId]);
        const friendChar = await query('SELECT * FROM characters WHERE user_id = $1', [req.params.userId]);

        if (myChar.rows.length === 0 || friendChar.rows.length === 0) {
            return res.status(404).json({ error: 'Character not found' });
        }

        const me = myChar.rows[0];
        const friend = friendChar.rows[0];

        const comparison = {
            level: { me: me.level, friend: friend.level },
            net_worth: { me: parseFloat(me.net_worth), friend: parseFloat(friend.net_worth) },
            credit_score: { me: me.credit_score, friend: friend.credit_score },
            quests_completed: { me: me.total_quests_completed, friend: friend.total_quests_completed },
            gold_earned: { me: parseFloat(me.total_gold_earned), friend: parseFloat(friend.total_gold_earned) },
            wisdom: { me: me.wisdom, friend: friend.wisdom },
            discipline: { me: me.discipline, friend: friend.discipline },
        };

        res.json({
            myCharacter: me.name,
            friendCharacter: friend.name,
            comparison,
        });
    } catch (error) {
        console.error('Compare error:', error);
        res.status(500).json({ error: 'Failed to compare stats' });
    }
});

// GET /api/social/search - Search users
router.get('/search', authenticateToken, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.status(400).json({ error: 'Search query must be at least 2 characters' });
        }

        const result = await query(
            `SELECT u.id, u.username, u.avatar_url, c.name as character_name, c.level, c.class
       FROM users u
       LEFT JOIN characters c ON c.user_id = u.id
       WHERE u.username ILIKE $1 AND u.id != $2
       LIMIT 20`,
            [`%${q}%`, req.user.userId]
        );

        res.json({ users: result.rows });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ error: 'Failed to search users' });
    }
});

export default router;
