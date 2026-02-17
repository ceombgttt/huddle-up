import { Router } from 'express';
import pool from '../db.js';

const router = Router();

const requireAuth = (req, res, next) => {
  if (!req.session?.userId) return res.status(401).json({ error: 'Not authenticated' });
  next();
};

router.get('/parties/:partyId/messages', requireAuth, async (req, res) => {
  try {
    const { partyId } = req.params;
    const { before } = req.query;

    const memberCheck = await pool.query(
      'SELECT 1 FROM party_attendees WHERE party_id = $1 AND user_id = $2 UNION SELECT 1 FROM parties WHERE id = $1 AND host_id = $2',
      [partyId, req.session.userId]
    );
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You must be in this party to view chat' });
    }

    let query = `
      SELECT pm.id, pm.message, pm.created_at,
        u.id as user_id, u.name as user_name, u.profile_picture
      FROM party_messages pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.party_id = $1
    `;
    const params = [partyId];

    if (before) {
      query += ' AND pm.created_at < $2';
      params.push(before);
    }

    query += ' ORDER BY pm.created_at DESC LIMIT 50';

    const result = await pool.query(query, params);
    res.json(result.rows.reverse());
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

router.post('/parties/:partyId/messages', requireAuth, async (req, res) => {
  try {
    const { partyId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (message.length > 500) {
      return res.status(400).json({ error: 'Message too long (max 500 characters)' });
    }

    const memberCheck = await pool.query(
      'SELECT 1 FROM party_attendees WHERE party_id = $1 AND user_id = $2 UNION SELECT 1 FROM parties WHERE id = $1 AND host_id = $2',
      [partyId, req.session.userId]
    );
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You must be in this party to send messages' });
    }

    const result = await pool.query(
      `INSERT INTO party_messages (party_id, user_id, message) VALUES ($1, $2, $3)
       RETURNING id, message, created_at`,
      [partyId, req.session.userId, message.trim()]
    );

    const user = await pool.query('SELECT name, profile_picture FROM users WHERE id = $1', [req.session.userId]);

    res.json({
      ...result.rows[0],
      user_id: req.session.userId,
      user_name: user.rows[0].name,
      profile_picture: user.rows[0].profile_picture
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
