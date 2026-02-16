import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.put('/me/favorites', requireAuth, async (req, res) => {
  try {
    const { sport, team } = req.body;
    await pool.query(
      `INSERT INTO user_favorite_teams (user_id, sport, team) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, sport) DO UPDATE SET team = $3`,
      [req.session.userId, sport, team]
    );

    const favResult = await pool.query('SELECT sport, team FROM user_favorite_teams WHERE user_id = $1', [req.session.userId]);
    const favoriteTeams = {};
    favResult.rows.forEach(row => { favoriteTeams[row.sport] = row.team; });

    res.json({ favoriteTeams });
  } catch (error) {
    console.error('Update favorites error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/me/favorites/:sport', requireAuth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM user_favorite_teams WHERE user_id = $1 AND sport = $2',
      [req.session.userId, req.params.sport]
    );

    const favResult = await pool.query('SELECT sport, team FROM user_favorite_teams WHERE user_id = $1', [req.session.userId]);
    const favoriteTeams = {};
    favResult.rows.forEach(row => { favoriteTeams[row.sport] = row.team; });

    res.json({ favoriteTeams });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const partyCount = await pool.query('SELECT COUNT(*) FROM parties');
    const venueCount = await pool.query('SELECT COUNT(*) FROM venues WHERE verified = TRUE');
    res.json({
      totalUsers: parseInt(userCount.rows[0].count),
      totalParties: parseInt(partyCount.rows[0].count),
      totalVenues: parseInt(venueCount.rows[0].count)
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
