import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { awardPoints } from './rewards.js';

const router = Router();

router.get('/search', requireAuth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const searchTerm = q.trim();
    const isPhoneSearch = /^[\d\s\-\+\(\)]+$/.test(searchTerm) && searchTerm.replace(/\D/g, '').length >= 4;

    let result;
    if (isPhoneSearch) {
      const digits = searchTerm.replace(/\D/g, '');
      result = await pool.query(
        `SELECT u.id, u.name, u.gender, u.profile_picture, u.joined_at, u.subscription_tier,
          COALESCE((SELECT json_agg(DISTINCT jsonb_build_object('sport', ft.sport, 'team', ft.team)) FROM user_favorite_teams ft WHERE ft.user_id = u.id), '[]') as favorite_teams,
          (SELECT COUNT(*) FROM parties WHERE host_id = u.id) as parties_hosted,
          (SELECT COUNT(*) FROM party_attendees WHERE user_id = u.id) as parties_attended
         FROM users u
         WHERE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(u.phone_number, '-', ''), ' ', ''), '(', ''), ')', ''), '+', '') LIKE $1
         AND u.id != $2
         ORDER BY u.name
         LIMIT 50`,
        [`%${digits}%`, req.session.userId]
      );
    } else {
      const nameParts = searchTerm.split(/\s+/);
      if (nameParts.length >= 2) {
        result = await pool.query(
          `SELECT u.id, u.name, u.gender, u.profile_picture, u.joined_at, u.subscription_tier,
            COALESCE((SELECT json_agg(DISTINCT jsonb_build_object('sport', ft.sport, 'team', ft.team)) FROM user_favorite_teams ft WHERE ft.user_id = u.id), '[]') as favorite_teams,
            (SELECT COUNT(*) FROM parties WHERE host_id = u.id) as parties_hosted,
            (SELECT COUNT(*) FROM party_attendees WHERE user_id = u.id) as parties_attended
           FROM users u
           WHERE (LOWER(u.name) LIKE LOWER($1) OR (LOWER(u.name) LIKE LOWER($2) AND LOWER(u.name) LIKE LOWER($3)))
           AND u.id != $4
           ORDER BY u.name
           LIMIT 50`,
          [`%${searchTerm}%`, `%${nameParts[0]}%`, `%${nameParts[nameParts.length - 1]}%`, req.session.userId]
        );
      } else {
        result = await pool.query(
          `SELECT u.id, u.name, u.gender, u.profile_picture, u.joined_at, u.subscription_tier,
            COALESCE((SELECT json_agg(DISTINCT jsonb_build_object('sport', ft.sport, 'team', ft.team)) FROM user_favorite_teams ft WHERE ft.user_id = u.id), '[]') as favorite_teams,
            (SELECT COUNT(*) FROM parties WHERE host_id = u.id) as parties_hosted,
            (SELECT COUNT(*) FROM party_attendees WHERE user_id = u.id) as parties_attended
           FROM users u
           WHERE LOWER(u.name) LIKE LOWER($1)
           AND u.id != $2
           ORDER BY u.name
           LIMIT 50`,
          [`%${searchTerm}%`, req.session.userId]
        );
      }
    }

    res.json(result.rows.map(r => ({
      id: r.id,
      name: r.name,
      gender: r.gender,
      profilePicture: r.profile_picture,
      joinedAt: r.joined_at,
      subscriptionTier: r.subscription_tier || 'free',
      favoriteTeams: r.favorite_teams,
      partiesHosted: parseInt(r.parties_hosted),
      partiesAttended: parseInt(r.parties_attended)
    })));
  } catch (error) {
    console.error('Fan search by name/phone error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/nearby', requireAuth, async (req, res) => {
  try {
    const { city } = req.query;
    if (!city || city.trim().length < 2) {
      return res.status(400).json({ error: 'City is required' });
    }

    const searchCity = city.trim();

    const result = await pool.query(
      `SELECT u.id, u.name, u.gender, u.profile_picture, u.joined_at, u.subscription_tier, u.user_city,
        COALESCE((SELECT json_agg(DISTINCT jsonb_build_object('sport', ft.sport, 'team', ft.team)) FROM user_favorite_teams ft WHERE ft.user_id = u.id), '[]') as favorite_teams,
        (SELECT COUNT(*) FROM parties WHERE host_id = u.id) as parties_hosted,
        (SELECT COUNT(*) FROM party_attendees WHERE user_id = u.id) as parties_attended
       FROM users u
       WHERE LOWER(u.user_city) LIKE LOWER($1)
       AND u.id != $2
       ORDER BY u.subscription_tier = 'pro' DESC, u.name
       LIMIT 100`,
      [`%${searchCity}%`, req.session.userId]
    );

    const upcomingParties = await pool.query(
      `SELECT p.id, p.game_id, p.title, p.sport, p.home_team, p.away_team, p.game_time, p.venue_name, p.city,
        (SELECT COUNT(*) FROM party_attendees pa WHERE pa.party_id = p.id) as attendee_count,
        p.max_size
       FROM parties p
       WHERE LOWER(p.city) LIKE LOWER($1)
       AND (p.game_time IS NULL OR p.game_time::timestamptz > NOW() - INTERVAL '2 hours')
       ORDER BY p.game_time ASC
       LIMIT 20`,
      [`%${searchCity}%`]
    );

    res.json({
      fans: result.rows.map(r => ({
        id: r.id,
        name: r.name,
        gender: r.gender,
        profilePicture: r.profile_picture,
        joinedAt: r.joined_at,
        subscriptionTier: r.subscription_tier || 'free',
        favoriteTeams: r.favorite_teams,
        partiesHosted: parseInt(r.parties_hosted),
        partiesAttended: parseInt(r.parties_attended),
        city: r.user_city
      })),
      parties: upcomingParties.rows.map(p => ({
        id: p.id,
        gameId: p.game_id,
        title: p.title,
        sport: p.sport,
        homeTeam: p.home_team,
        awayTeam: p.away_team,
        gameTime: p.game_time,
        venueName: p.venue_name,
        city: p.city,
        attendeeCount: parseInt(p.attendee_count),
        maxSize: p.max_size
      }))
    });
  } catch (error) {
    console.error('Nearby fans error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/by-team', requireAuth, async (req, res) => {
  try {
    const { sport, team } = req.query;
    if (!sport || !team) {
      return res.status(400).json({ error: 'Sport and team are required' });
    }

    const result = await pool.query(
      `SELECT u.id, u.name, u.gender, u.profile_picture, u.joined_at, u.subscription_tier,
        json_agg(DISTINCT jsonb_build_object('sport', ft.sport, 'team', ft.team)) as favorite_teams,
        (SELECT COUNT(*) FROM parties WHERE host_id = u.id) as parties_hosted,
        (SELECT COUNT(*) FROM party_attendees WHERE user_id = u.id) as parties_attended
       FROM users u
       JOIN user_favorite_teams ft ON ft.user_id = u.id
       WHERE u.id IN (
         SELECT user_id FROM user_favorite_teams WHERE sport = $1 AND team = $2
       )
       AND u.id != $3
       GROUP BY u.id, u.name, u.gender, u.profile_picture, u.joined_at, u.subscription_tier
       ORDER BY u.name`,
      [sport, team, req.session.userId]
    );

    res.json(result.rows.map(r => ({
      id: r.id,
      name: r.name,
      gender: r.gender,
      profilePicture: r.profile_picture,
      joinedAt: r.joined_at,
      subscriptionTier: r.subscription_tier || 'free',
      favoriteTeams: r.favorite_teams,
      partiesHosted: parseInt(r.parties_hosted),
      partiesAttended: parseInt(r.parties_attended)
    })));
  } catch (error) {
    console.error('Fan search error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/invite', requireAuth, async (req, res) => {
  try {
    const { partyId, toUserId } = req.body;
    if (!partyId || !toUserId) {
      return res.status(400).json({ error: 'Party ID and user ID are required' });
    }

    const partyCheck = await pool.query(
      'SELECT id FROM party_attendees WHERE party_id = $1 AND user_id = $2',
      [partyId, req.session.userId]
    );
    if (partyCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You must be a member of this party to send invites' });
    }

    const alreadyMember = await pool.query(
      'SELECT id FROM party_attendees WHERE party_id = $1 AND user_id = $2',
      [partyId, toUserId]
    );
    if (alreadyMember.rows.length > 0) {
      return res.status(400).json({ error: 'This user is already in the party' });
    }

    const invResult = await pool.query(
      `INSERT INTO party_invitations (party_id, from_user_id, to_user_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (party_id, to_user_id) DO UPDATE SET
         status = 'pending', from_user_id = $2, created_at = NOW(), responded_at = NULL
       RETURNING id`,
      [partyId, req.session.userId, toUserId]
    );

    if (invResult.rows.length > 0) {
      awardPoints(req.session.userId, 'invite_friend', 'Invited a friend to a party', partyId).catch(() => {});
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/invitations', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.id, i.status, i.created_at,
        p.id as party_id, p.title, p.sport, p.home_team, p.away_team, p.game_time, p.venue_name, p.city,
        u.name as from_name
       FROM party_invitations i
       JOIN parties p ON i.party_id = p.id
       JOIN users u ON i.from_user_id = u.id
       WHERE i.to_user_id = $1
       ORDER BY i.created_at DESC`,
      [req.session.userId]
    );

    res.json(result.rows.map(r => ({
      id: r.id,
      status: r.status,
      createdAt: r.created_at,
      partyId: r.party_id,
      partyTitle: r.title,
      sport: r.sport,
      homeTeam: r.home_team,
      awayTeam: r.away_team,
      gameTime: r.game_time,
      venueName: r.venue_name,
      city: r.city,
      fromName: r.from_name
    })));
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/invitations/:id/accept', requireAuth, async (req, res) => {
  try {
    const inv = await pool.query(
      'SELECT * FROM party_invitations WHERE id = $1 AND to_user_id = $2',
      [req.params.id, req.session.userId]
    );
    if (inv.rows.length === 0) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    const invitation = inv.rows[0];

    await pool.query(
      "UPDATE party_invitations SET status = 'accepted', responded_at = NOW() WHERE id = $1",
      [req.params.id]
    );

    await pool.query(
      'INSERT INTO party_attendees (party_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [invitation.party_id, req.session.userId]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/invitations/:id/decline', requireAuth, async (req, res) => {
  try {
    const inv = await pool.query(
      'SELECT * FROM party_invitations WHERE id = $1 AND to_user_id = $2',
      [req.params.id, req.session.userId]
    );
    if (inv.rows.length === 0) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    await pool.query(
      "UPDATE party_invitations SET status = 'declined', responded_at = NOW() WHERE id = $1",
      [req.params.id]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('Decline invitation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
