import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*,
        (SELECT COUNT(*) FROM raffle_entries WHERE raffle_id = r.id) as total_entries,
        (SELECT COUNT(*) FROM raffle_entries WHERE raffle_id = r.id AND user_id = $1) as my_entries,
        (SELECT name FROM users WHERE id = r.winner_id) as winner_name
       FROM raffles r
       WHERE r.status != 'cancelled'
       ORDER BY r.status ASC, r.end_date ASC`,
      [req.session.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get raffles error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/enter', requireAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { entries = 1 } = req.body;
    const raffleId = req.params.id;
    const userId = req.session.userId;

    if (entries < 1 || !Number.isInteger(entries)) {
      return res.status(400).json({ error: 'Enter at least 1 entry' });
    }

    await client.query('BEGIN');

    const raffle = await client.query(
      'SELECT * FROM raffles WHERE id = $1 AND status = $2',
      [raffleId, 'active']
    );
    if (raffle.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Raffle not found or has ended' });
    }

    const r = raffle.rows[0];
    if (new Date(r.end_date) < new Date()) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'This raffle has ended' });
    }

    const existingEntries = await client.query(
      'SELECT COUNT(*) as count FROM raffle_entries WHERE raffle_id = $1 AND user_id = $2',
      [raffleId, userId]
    );
    const currentEntries = parseInt(existingEntries.rows[0].count);
    if (currentEntries + entries > r.max_entries_per_user) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `You can only have ${r.max_entries_per_user} entries max. You already have ${currentEntries}.`
      });
    }

    const totalCost = r.points_per_entry * entries;

    await client.query(
      `INSERT INTO user_points (user_id, total_points, lifetime_points, updated_at)
       VALUES ($1, 0, 0, NOW())
       ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    );

    const balance = await client.query(
      'SELECT total_points FROM user_points WHERE user_id = $1 FOR UPDATE',
      [userId]
    );
    const currentPoints = balance.rows[0]?.total_points || 0;
    if (currentPoints < totalCost) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `Not enough points. You need ${totalCost} but have ${currentPoints}.`
      });
    }

    await client.query(
      'UPDATE user_points SET total_points = total_points - $1, updated_at = NOW() WHERE user_id = $2',
      [totalCost, userId]
    );

    const entryValues = [];
    const entryParams = [];
    for (let i = 0; i < entries; i++) {
      const offset = i * 3;
      entryValues.push(`($${offset + 1}, $${offset + 2}, $${offset + 3})`);
      entryParams.push(raffleId, userId, r.points_per_entry);
    }
    await client.query(
      `INSERT INTO raffle_entries (raffle_id, user_id, points_spent) VALUES ${entryValues.join(', ')}`,
      entryParams
    );

    await client.query(
      `INSERT INTO points_history (user_id, points, action, description, reference_id)
       VALUES ($1, $2, 'raffle_entry', $3, $4)`,
      [userId, -totalCost, `Entered raffle: ${r.title} (${entries} ${entries === 1 ? 'entry' : 'entries'})`, raffleId]
    );

    await client.query('COMMIT');

    const updated = await pool.query(
      'SELECT total_points, lifetime_points FROM user_points WHERE user_id = $1',
      [userId]
    );

    res.json({
      ok: true,
      entriesAdded: entries,
      totalEntries: currentEntries + entries,
      pointsSpent: totalCost,
      totalPoints: updated.rows[0]?.total_points || 0,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Enter raffle error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

router.get('/my-entries', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.title, r.prize_icon, r.end_date, r.status, r.winner_id,
              COUNT(re.id) as entries, SUM(re.points_spent) as total_spent,
              (SELECT name FROM users WHERE id = r.winner_id) as winner_name
       FROM raffle_entries re
       JOIN raffles r ON re.raffle_id = r.id
       WHERE re.user_id = $1
       GROUP BY r.id, r.title, r.prize_icon, r.end_date, r.status, r.winner_id
       ORDER BY r.end_date DESC`,
      [req.session.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get my entries error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
