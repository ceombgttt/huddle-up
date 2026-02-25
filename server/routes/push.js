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

export async function checkNotificationPreference(userId, prefType) {
  try {
    const result = await pool.query(
      `SELECT ${prefType}, push_enabled FROM notification_preferences WHERE user_id = $1`,
      [userId]
    );
    if (result.rows.length === 0) return true;
    return result.rows[0].push_enabled !== false && result.rows[0][prefType] !== false;
  } catch {
    return true;
  }
}

function isQuietHours() {
  const hour = new Date().getHours();
  return hour >= 22 || hour < 8;
}

export async function sendPushToUser(userId, payload, options = {}) {
  try {
    const { prefType, skipQuietHours = false, critical = false } = options;

    if (!critical && !skipQuietHours && isQuietHours()) return;

    if (prefType) {
      const allowed = await checkNotificationPreference(userId, prefType);
      if (!allowed) return;
    }

    const subs = await pool.query(
      'SELECT id, endpoint, p256dh, auth, daily_push_count, last_push_date FROM push_subscriptions WHERE user_id = $1',
      [userId]
    );
    for (const sub of subs.rows) {
      const today = new Date().toISOString().split('T')[0];
      let count = sub.daily_push_count || 0;
      if (sub.last_push_date && sub.last_push_date.toISOString().split('T')[0] !== today) {
        count = 0;
      }
      if (!critical && count >= 5) continue;

      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth }
      };
      try {
        await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
        await pool.query(
          'UPDATE push_subscriptions SET daily_push_count = $1, last_push_date = CURRENT_DATE WHERE id = $2',
          [count + 1, sub.id]
        );
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

router.get('/preferences', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notification_preferences WHERE user_id = $1',
      [req.session.userId]
    );
    if (result.rows.length === 0) {
      return res.json({
        pushEnabled: true, teamAlerts: true, rivalryAlerts: true, suggestedParties: true,
        gameReminders: true, partyReminders: true, predictionReminders: true,
        predictionResults: true, raffleWinners: true, nearbyParties: true,
        friendActivity: true, achievementUnlocks: true
      });
    }
    const r = result.rows[0];
    res.json({
      pushEnabled: r.push_enabled, teamAlerts: r.team_alerts, rivalryAlerts: r.rivalry_alerts,
      suggestedParties: r.suggested_parties, gameReminders: r.game_reminders,
      partyReminders: r.party_reminders, predictionReminders: r.prediction_reminders,
      predictionResults: r.prediction_results, raffleWinners: r.raffle_winners,
      nearbyParties: r.nearby_parties, friendActivity: r.friend_activity,
      achievementUnlocks: r.achievement_unlocks
    });
  } catch (error) {
    console.error('Get push preferences error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/preferences', requireAuth, async (req, res) => {
  try {
    const {
      pushEnabled, teamAlerts, rivalryAlerts, suggestedParties, gameReminders,
      partyReminders, predictionReminders, predictionResults, raffleWinners,
      nearbyParties, friendActivity, achievementUnlocks
    } = req.body;
    await pool.query(
      `INSERT INTO notification_preferences (user_id, push_enabled, team_alerts, rivalry_alerts, suggested_parties, game_reminders, party_reminders, prediction_reminders, prediction_results, raffle_winners, nearby_parties, friend_activity, achievement_unlocks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (user_id) DO UPDATE SET
         push_enabled = COALESCE($2, notification_preferences.push_enabled),
         team_alerts = COALESCE($3, notification_preferences.team_alerts),
         rivalry_alerts = COALESCE($4, notification_preferences.rivalry_alerts),
         suggested_parties = COALESCE($5, notification_preferences.suggested_parties),
         game_reminders = COALESCE($6, notification_preferences.game_reminders),
         party_reminders = COALESCE($7, notification_preferences.party_reminders),
         prediction_reminders = COALESCE($8, notification_preferences.prediction_reminders),
         prediction_results = COALESCE($9, notification_preferences.prediction_results),
         raffle_winners = COALESCE($10, notification_preferences.raffle_winners),
         nearby_parties = COALESCE($11, notification_preferences.nearby_parties),
         friend_activity = COALESCE($12, notification_preferences.friend_activity),
         achievement_unlocks = COALESCE($13, notification_preferences.achievement_unlocks)`,
      [req.session.userId, pushEnabled, teamAlerts, rivalryAlerts, suggestedParties, gameReminders,
       partyReminders, predictionReminders, predictionResults, raffleWinners,
       nearbyParties, friendActivity, achievementUnlocks]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Update push preferences error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
