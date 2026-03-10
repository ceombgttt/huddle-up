import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { sendPushToUser } from './push.js';

const router = Router();

router.post('/request', requireAuth, async (req, res) => {
  try {
    const { friendId } = req.body;
    if (!friendId) return res.status(400).json({ error: 'Friend ID is required' });
    if (friendId === req.session.userId) return res.status(400).json({ error: 'Cannot friend yourself' });

    const existing = await pool.query(
      `SELECT id, status FROM friendships
       WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`,
      [req.session.userId, friendId]
    );

    if (existing.rows.length > 0) {
      const f = existing.rows[0];
      if (f.status === 'accepted') return res.status(400).json({ error: 'Already friends' });
      if (f.status === 'pending') return res.status(400).json({ error: 'Friend request already pending' });
      if (f.status === 'declined') {
        await pool.query(
          `UPDATE friendships SET status = 'pending', user_id = $1, friend_id = $2, created_at = NOW(), responded_at = NULL WHERE id = $3`,
          [req.session.userId, friendId, f.id]
        );
        return res.json({ ok: true });
      }
    }

    await pool.query(
      'INSERT INTO friendships (user_id, friend_id) VALUES ($1, $2)',
      [req.session.userId, friendId]
    );

    const senderName = await pool.query('SELECT name FROM users WHERE id = $1', [req.session.userId]);
    const sName = senderName.rows[0]?.name || 'Someone';
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, 'friend_request', 'New Friend Request', $2)`,
      [friendId, `${sName} wants to add you to their crew!`]
    );

    try {
      await sendPushToUser(friendId, {
        title: 'New Friend Request 👋',
        body: `${sName} wants to add you to their crew!`,
        data: { type: 'friend_request' }
      }, { prefType: 'friend_activity' });
    } catch (e) {}

    res.json({ ok: true });
  } catch (error) {
    console.error('Friend request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/resend', requireAuth, async (req, res) => {
  try {
    const { friendId } = req.body;
    if (!friendId) return res.status(400).json({ error: 'Friend ID is required' });
    if (parseInt(friendId) === req.session.userId) return res.status(400).json({ error: 'Cannot send request to yourself' });

    const existing = await pool.query(
      `SELECT id, status, user_id, friend_id FROM friendships
       WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`,
      [req.session.userId, friendId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'No existing request found. Send a new one instead.' });
    }

    const f = existing.rows[0];
    if (f.status === 'accepted') return res.status(400).json({ error: 'Already friends' });
    if (f.status === 'pending' && f.user_id !== req.session.userId) {
      return res.status(400).json({ error: 'This user already sent you a request. Check your pending requests.' });
    }

    await pool.query(
      `UPDATE friendships SET status = 'pending', created_at = NOW(), responded_at = NULL WHERE id = $1`,
      [f.id]
    );

    const senderName = await pool.query('SELECT name FROM users WHERE id = $1', [req.session.userId]);
    const sName = senderName.rows[0]?.name || 'Someone';
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, 'friend_request', 'New Friend Request', $2)`,
      [friendId, `${sName} wants to add you to their crew!`]
    );

    try {
      await sendPushToUser(friendId, {
        title: 'Friend Request 👋',
        body: `${sName} sent you a friend request again!`,
        data: { type: 'friend_request' }
      }, { prefType: 'friend_activity' });
    } catch (e) {}

    res.json({ ok: true });
  } catch (error) {
    console.error('Resend friend request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/accept/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE friendships SET status = 'accepted', responded_at = NOW()
       WHERE id = $1 AND friend_id = $2 AND status = 'pending' RETURNING user_id`,
      [req.params.id, req.session.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Request not found' });

    const accepterName = await pool.query('SELECT name FROM users WHERE id = $1', [req.session.userId]);
    const aName = accepterName.rows[0]?.name || 'Someone';
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, 'friend_accepted', 'Friend Request Accepted', $2)`,
      [result.rows[0].user_id, `${aName} accepted your friend request! You're now in each other's crew.`]
    );

    try {
      await sendPushToUser(result.rows[0].user_id, {
        title: 'Friend Request Accepted! 🎉',
        body: `${aName} accepted your friend request! You're now crew.`,
        data: { type: 'friend_accepted' }
      }, { prefType: 'friend_activity' });
    } catch (e) {}

    res.json({ ok: true });
  } catch (error) {
    console.error('Accept friend error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/decline/:id', requireAuth, async (req, res) => {
  try {
    await pool.query(
      `UPDATE friendships SET status = 'declined', responded_at = NOW()
       WHERE id = $1 AND friend_id = $2 AND status = 'pending'`,
      [req.params.id, req.session.userId]
    );
    res.json({ ok: true });
  } catch (error) {
    console.error('Decline friend error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:friendId', requireAuth, async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM friendships
       WHERE ((user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1))
       AND status = 'accepted'`,
      [req.session.userId, req.params.friendId]
    );
    res.json({ ok: true });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/list', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        f.id as friendship_id,
        CASE WHEN f.user_id = $1 THEN f.friend_id ELSE f.user_id END as friend_user_id,
        u.name, u.gender, u.profile_picture, u.joined_at,
        (SELECT json_object_agg(ft.sport, ft.team) FROM user_favorite_teams ft WHERE ft.user_id = u.id) as favorite_teams,
        (SELECT COUNT(*) FROM parties WHERE host_id = u.id) as parties_hosted,
        (SELECT COUNT(*) FROM party_attendees WHERE user_id = u.id) as parties_attended,
        f.created_at as friends_since
       FROM friendships f
       JOIN users u ON u.id = CASE WHEN f.user_id = $1 THEN f.friend_id ELSE f.user_id END
       WHERE (f.user_id = $1 OR f.friend_id = $1) AND f.status = 'accepted'
       ORDER BY u.name`,
      [req.session.userId]
    );

    res.json(result.rows.map(r => ({
      friendshipId: r.friendship_id,
      id: r.friend_user_id,
      name: r.name,
      gender: r.gender,
      profilePicture: r.profile_picture,
      joinedAt: r.joined_at,
      favoriteTeams: r.favorite_teams || {},
      partiesHosted: parseInt(r.parties_hosted),
      partiesAttended: parseInt(r.parties_attended),
      friendsSince: r.friends_since
    })));
  } catch (error) {
    console.error('List friends error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/requests', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.id, f.created_at,
        u.id as from_user_id, u.name, u.gender, u.profile_picture,
        (SELECT json_object_agg(ft.sport, ft.team) FROM user_favorite_teams ft WHERE ft.user_id = u.id) as favorite_teams
       FROM friendships f
       JOIN users u ON u.id = f.user_id
       WHERE f.friend_id = $1 AND f.status = 'pending'
       ORDER BY f.created_at DESC`,
      [req.session.userId]
    );

    res.json(result.rows.map(r => ({
      id: r.id,
      fromUserId: r.from_user_id,
      name: r.name,
      gender: r.gender,
      profilePicture: r.profile_picture,
      favoriteTeams: r.favorite_teams || {},
      createdAt: r.created_at
    })));
  } catch (error) {
    console.error('Friend requests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/status/:userId', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, status, user_id, friend_id FROM friendships
       WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`,
      [req.session.userId, req.params.userId]
    );
    if (result.rows.length === 0) {
      return res.json({ status: 'none' });
    }
    const f = result.rows[0];
    if (f.status === 'accepted') return res.json({ status: 'friends', id: f.id });
    if (f.status === 'pending' && f.user_id === req.session.userId) return res.json({ status: 'sent', id: f.id });
    if (f.status === 'pending' && f.friend_id === req.session.userId) return res.json({ status: 'received', id: f.id });
    return res.json({ status: 'none' });
  } catch (error) {
    console.error('Friend status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/referral-code', requireAuth, async (req, res) => {
  try {
    const existing = await pool.query('SELECT referral_code FROM users WHERE id = $1', [req.session.userId]);
    if (existing.rows[0]?.referral_code) {
      return res.json({ referralCode: existing.rows[0].referral_code });
    }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    await pool.query('UPDATE users SET referral_code = $1 WHERE id = $2', [code, req.session.userId]);
    res.json({ referralCode: code });
  } catch (error) {
    if (error.code === '23505') {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
      try {
        await pool.query('UPDATE users SET referral_code = $1 WHERE id = $2', [code, req.session.userId]);
        return res.json({ referralCode: code });
      } catch (retryErr) {
        console.error('Referral code retry error:', retryErr);
        return res.status(500).json({ error: 'Server error' });
      }
    }
    console.error('Referral code error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/activity', requireAuth, async (req, res) => {
  try {
    const friendSubquery = `
      SELECT CASE WHEN f.user_id = $1 THEN f.friend_id ELSE f.user_id END
      FROM friendships f
      WHERE (f.user_id = $1 OR f.friend_id = $1) AND f.status = 'accepted'
    `;

    const result = await pool.query(
      `(SELECT
        u.id as user_id, u.name as user_name,
        'party_joined' as action,
        COALESCE(p.home_team, '') || ' vs ' || COALESCE(p.away_team, '') || ' at ' || COALESCE(p.venue_name, '') as detail,
        pa.joined_at as timestamp
       FROM party_attendees pa
       JOIN users u ON pa.user_id = u.id
       JOIN parties p ON pa.party_id = p.id
       WHERE pa.user_id IN (${friendSubquery})
       AND pa.joined_at >= NOW() - INTERVAL '7 days')
      UNION ALL
      (SELECT
        u.id as user_id, u.name as user_name,
        'prediction_made' as action,
        COALESCE(pr.home_team, '') || ' vs ' || COALESCE(pr.away_team, '') || ' - Picked ' || COALESCE(pr.picked_team, '') as detail,
        pr.created_at as timestamp
       FROM predictions pr
       JOIN users u ON pr.user_id = u.id
       WHERE pr.user_id IN (${friendSubquery})
       AND pr.created_at >= NOW() - INTERVAL '7 days')
      ORDER BY timestamp DESC
      LIMIT 50`,
      [req.session.userId]
    );

    res.json(result.rows.map(r => ({
      userId: r.user_id,
      userName: r.user_name,
      action: r.action,
      detail: r.detail,
      timestamp: r.timestamp
    })));
  } catch (error) {
    console.error('Friend activity error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
