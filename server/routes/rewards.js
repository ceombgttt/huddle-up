import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const POINT_VALUES = {
  create_party: 50,
  attend_party: 25,
  invite_friend: 100,
  venue_checkin: 75,
  welcome_bonus: 50,
};

async function awardPoints(userId, action, description, referenceId = null) {
  let points = POINT_VALUES[action];
  if (!points) return;

  const userResult = await pool.query('SELECT subscription_tier FROM users WHERE id = $1', [userId]);
  const isPro = userResult.rows[0]?.subscription_tier === 'pro';
  if (isPro) points *= 3;

  await pool.query(
    `INSERT INTO user_points (user_id, total_points, lifetime_points, updated_at)
     VALUES ($1, $2, $2, NOW())
     ON CONFLICT (user_id)
     DO UPDATE SET total_points = user_points.total_points + $2,
                   lifetime_points = user_points.lifetime_points + $2,
                   updated_at = NOW()`,
    [userId, points]
  );

  await pool.query(
    `INSERT INTO points_history (user_id, points, action, description, reference_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, points, action, description || (isPro ? `${action} (3x Pro bonus)` : action), referenceId]
  );

  return points;
}

router.get('/balance', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT total_points, lifetime_points FROM user_points WHERE user_id = $1',
      [req.session.userId]
    );
    const data = result.rows[0] || { total_points: 0, lifetime_points: 0 };
    res.json({ totalPoints: data.total_points, lifetimePoints: data.lifetime_points });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/history', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, points, action, description, created_at
       FROM points_history WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 50`,
      [req.session.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/catalog', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM rewards WHERE active = TRUE ORDER BY points_cost ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get catalog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/redeem', requireAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { rewardId } = req.body;
    if (!rewardId) return res.status(400).json({ error: 'Reward ID required' });

    await client.query('BEGIN');

    const reward = await client.query('SELECT * FROM rewards WHERE id = $1 AND active = TRUE', [rewardId]);
    if (reward.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Reward not found' });
    }

    const pointsCost = reward.rows[0].points_cost;

    const balance = await client.query(
      'SELECT total_points FROM user_points WHERE user_id = $1 FOR UPDATE',
      [req.session.userId]
    );
    const currentPoints = balance.rows[0]?.total_points || 0;

    if (currentPoints < pointsCost) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Not enough points. You need ${pointsCost} but have ${currentPoints}` });
    }

    await client.query(
      'UPDATE user_points SET total_points = total_points - $1, updated_at = NOW() WHERE user_id = $2',
      [pointsCost, req.session.userId]
    );

    await client.query(
      `INSERT INTO reward_redemptions (user_id, reward_id, points_spent)
       VALUES ($1, $2, $3)`,
      [req.session.userId, rewardId, pointsCost]
    );

    await client.query(
      `INSERT INTO points_history (user_id, points, action, description, reference_id)
       VALUES ($1, $2, 'redeem', $3, $4)`,
      [req.session.userId, -pointsCost, `Redeemed: ${reward.rows[0].name}`, rewardId]
    );

    await client.query('COMMIT');

    const updated = await pool.query(
      'SELECT total_points, lifetime_points FROM user_points WHERE user_id = $1',
      [req.session.userId]
    );

    res.json({
      ok: true,
      reward: reward.rows[0],
      totalPoints: updated.rows[0].total_points,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Redeem error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

router.get('/redemptions', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT rr.*, r.name as reward_name, r.description as reward_description,
              r.icon as reward_icon, r.category as reward_category
       FROM reward_redemptions rr
       JOIN rewards r ON rr.reward_id = r.id
       WHERE rr.user_id = $1
       ORDER BY rr.redeemed_at DESC LIMIT 20`,
      [req.session.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get redemptions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/checkin', requireAuth, async (req, res) => {
  return res.status(403).json({ error: 'Manual check-in is disabled. Please scan the venue QR code to check in.' });
  try {
    const { partyId } = req.body;
    if (!partyId) return res.status(400).json({ error: 'Party ID required' });

    const partyInfo = await pool.query(
      'SELECT game_time FROM parties WHERE id = $1',
      [partyId]
    );
    if (partyInfo.rows.length > 0 && partyInfo.rows[0].game_time) {
      const gameTime = new Date(partyInfo.rows[0].game_time);
      const hoursAfterGame = (Date.now() - gameTime.getTime()) / (1000 * 60 * 60);
      if (hoursAfterGame > 4) {
        return res.status(400).json({ error: 'This party has ended. Check-ins are no longer available.' });
      }
    }

    const membership = await pool.query(
      'SELECT 1 FROM party_attendees WHERE party_id = $1 AND user_id = $2',
      [partyId, req.session.userId]
    );
    if (membership.rows.length === 0) {
      return res.status(403).json({ error: 'You must be a party member to check in' });
    }

    const existing = await pool.query(
      'SELECT 1 FROM venue_checkins WHERE user_id = $1 AND party_id = $2',
      [req.session.userId, partyId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'You already checked in to this party' });
    }

    const party = await pool.query('SELECT venue_name FROM parties WHERE id = $1', [partyId]);
    const venueName = party.rows[0]?.venue_name || 'Unknown venue';

    await pool.query(
      'INSERT INTO venue_checkins (user_id, party_id, venue_name) VALUES ($1, $2, $3)',
      [req.session.userId, partyId, venueName]
    );

    const points = await awardPoints(
      req.session.userId,
      'venue_checkin',
      `Checked in at ${venueName}`,
      partyId
    );

    res.json({ ok: true, pointsEarned: points });
  } catch (error) {
    console.error('Checkin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export { awardPoints };
export default router;
