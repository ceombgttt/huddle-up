import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.id, n.type, n.title, n.message, n.party_id, n.is_read, n.created_at,
        p.title as party_title, p.sport, p.home_team, p.away_team, p.venue_name, p.city, p.game_time
       FROM notifications n
       LEFT JOIN parties p ON n.party_id = p.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [req.session.userId]
    );

    res.json(result.rows.map(r => ({
      id: r.id,
      type: r.type,
      title: r.title,
      message: r.message,
      partyId: r.party_id,
      isRead: r.is_read,
      createdAt: r.created_at,
      partyTitle: r.party_title,
      sport: r.sport,
      homeTeam: r.home_team,
      awayTeam: r.away_team,
      venueName: r.venue_name,
      city: r.city,
      gameTime: r.game_time
    })));
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/read/:id', requireAuth, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
      [req.params.id, req.session.userId]
    );
    res.json({ ok: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/read-all', requireAuth, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE',
      [req.session.userId]
    );
    res.json({ ok: true });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/settings', requireAuth, async (req, res) => {
  try {
    const { enabled } = req.body;
    await pool.query(
      'UPDATE users SET notifications_enabled = $1 WHERE id = $2',
      [enabled, req.session.userId]
    );
    res.json({ notificationsEnabled: enabled });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
