import { Router } from 'express';
import pool from '../db.js';

const router = Router();

const requireAuth = (req, res, next) => {
  if (!req.session?.userId) return res.status(401).json({ error: 'Not authenticated' });
  next();
};

router.get('/conversations', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, u.name, u.profile_picture,
        last_msg.message AS last_message,
        last_msg.created_at AS last_message_at,
        last_msg.sender_id AS last_sender_id,
        COALESCE(unread.count, 0)::int AS unread_count
      FROM (
        SELECT DISTINCT 
          CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AS other_id
        FROM direct_messages
        WHERE sender_id = $1 OR receiver_id = $1
      ) convos
      JOIN users u ON u.id = convos.other_id
      INNER JOIN friendships f ON f.status = 'accepted' AND (
        (f.user_id = $1 AND f.friend_id = convos.other_id) OR
        (f.user_id = convos.other_id AND f.friend_id = $1)
      )
      LEFT JOIN LATERAL (
        SELECT message, created_at, sender_id FROM direct_messages
        WHERE (sender_id = $1 AND receiver_id = convos.other_id)
           OR (sender_id = convos.other_id AND receiver_id = $1)
        ORDER BY created_at DESC LIMIT 1
      ) last_msg ON true
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS count FROM direct_messages
        WHERE sender_id = convos.other_id AND receiver_id = $1 AND is_read = FALSE
      ) unread ON true
      ORDER BY last_msg.created_at DESC
    `, [req.session.userId]);

    res.json(result.rows.map(r => ({
      userId: r.id,
      name: r.name,
      profilePicture: r.profile_picture,
      lastMessage: r.last_message,
      lastMessageAt: r.last_message_at,
      lastSenderId: r.last_sender_id,
      unreadCount: r.unread_count
    })));
  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({ error: 'Failed to load conversations' });
  }
});

router.get('/messages/:userId', requireAuth, async (req, res) => {
  try {
    const otherId = req.params.userId;
    const myId = req.session.userId;

    const friendCheck = await pool.query(
      `SELECT id FROM friendships WHERE status = 'accepted' AND (
        (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)
      )`, [myId, otherId]
    );
    if (friendCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You can only message crew members' });
    }

    await pool.query(
      `UPDATE direct_messages SET is_read = TRUE WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE`,
      [otherId, myId]
    );

    const result = await pool.query(`
      SELECT dm.id, dm.sender_id, dm.receiver_id, dm.message, dm.is_read, dm.created_at,
             u.name AS sender_name, u.profile_picture AS sender_picture
      FROM direct_messages dm
      JOIN users u ON u.id = dm.sender_id
      WHERE (dm.sender_id = $1 AND dm.receiver_id = $2)
         OR (dm.sender_id = $2 AND dm.receiver_id = $1)
      ORDER BY dm.created_at ASC
      LIMIT 200
    `, [myId, otherId]);

    res.json(result.rows.map(r => ({
      id: r.id,
      senderId: r.sender_id,
      receiverId: r.receiver_id,
      message: r.message,
      isRead: r.is_read,
      createdAt: r.created_at,
      senderName: r.sender_name,
      senderPicture: r.sender_picture
    })));
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

router.post('/messages/:userId', requireAuth, async (req, res) => {
  try {
    const otherId = req.params.userId;
    const myId = req.session.userId;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const friendCheck = await pool.query(
      `SELECT id FROM friendships WHERE status = 'accepted' AND (
        (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)
      )`, [myId, otherId]
    );
    if (friendCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You can only message crew members' });
    }

    const result = await pool.query(
      `INSERT INTO direct_messages (sender_id, receiver_id, message) VALUES ($1, $2, $3) RETURNING *`,
      [myId, otherId, message.trim()]
    );

    const sender = await pool.query('SELECT name, profile_picture FROM users WHERE id = $1', [myId]);

    res.json({
      id: result.rows[0].id,
      senderId: result.rows[0].sender_id,
      receiverId: result.rows[0].receiver_id,
      message: result.rows[0].message,
      isRead: result.rows[0].is_read,
      createdAt: result.rows[0].created_at,
      senderName: sender.rows[0]?.name,
      senderPicture: sender.rows[0]?.profile_picture
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.get('/unread-count', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*)::int AS count FROM direct_messages WHERE receiver_id = $1 AND is_read = FALSE',
      [req.session.userId]
    );
    res.json({ count: result.rows[0].count });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

export default router;
