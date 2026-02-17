import { Router } from 'express';
import webpush from 'web-push';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@huddleupusa.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

router.get('/vapid-key', (req, res) => {
  res.json({ publicKey: vapidPublicKey || null });
});

router.post('/subscribe', requireAuth, async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: 'Invalid subscription' });
    }
    await pool.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (endpoint) DO UPDATE SET user_id = $1, p256dh = $3, auth = $4`,
      [req.session.userId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Push subscribe error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/unsubscribe', requireAuth, async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (endpoint) {
      await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1 AND user_id = $2', [endpoint, req.session.userId]);
    } else {
      await pool.query('DELETE FROM push_subscriptions WHERE user_id = $1', [req.session.userId]);
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/watch-game', requireAuth, async (req, res) => {
  try {
    const { gameId, sport, homeTeam, awayTeam } = req.body;
    if (!gameId) return res.status(400).json({ error: 'Game ID required' });
    await pool.query(
      `INSERT INTO score_watches (user_id, game_id, sport, home_team, away_team)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, game_id) DO NOTHING`,
      [req.session.userId, gameId, sport || '', homeTeam || '', awayTeam || '']
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Watch game error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/watch-game/:gameId', requireAuth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM score_watches WHERE user_id = $1 AND game_id = $2',
      [req.session.userId, req.params.gameId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Unwatch game error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/watched-games', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT game_id FROM score_watches WHERE user_id = $1',
      [req.session.userId]
    );
    res.json(result.rows.map(r => r.game_id));
  } catch (error) {
    console.error('Watched games error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export async function sendPushToUser(userId, payload) {
  try {
    const subs = await pool.query(
      'SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1',
      [userId]
    );
    for (const sub of subs.rows) {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth }
      };
      try {
        await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [sub.endpoint]);
        }
      }
    }
  } catch (error) {
    console.error('Send push error:', error);
  }
}

export default router;
