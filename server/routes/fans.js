import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/by-team', requireAuth, async (req, res) => {
  try {
    const { sport, team } = req.query;
    if (!sport || !team) {
      return res.status(400).json({ error: 'Sport and team are required' });
    }

    const result = await pool.query(
      `SELECT u.id, u.name, u.gender, u.joined_at,
        json_agg(DISTINCT jsonb_build_object('sport', ft.sport, 'team', ft.team)) as favorite_teams,
        (SELECT COUNT(*) FROM parties WHERE host_id = u.id) as parties_hosted,
        (SELECT COUNT(*) FROM party_attendees WHERE user_id = u.id) as parties_attended
       FROM users u
       JOIN user_favorite_teams ft ON ft.user_id = u.id
       WHERE u.id IN (
         SELECT user_id FROM user_favorite_teams WHERE sport = $1 AND team = $2
       )
       AND u.id != $3
       GROUP BY u.id, u.name, u.gender, u.joined_at
       ORDER BY u.name`,
      [sport, team, req.session.userId]
    );

    res.json(result.rows.map(r => ({
      id: r.id,
      name: r.name,
      gender: r.gender,
      joinedAt: r.joined_at,
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

    await pool.query(
      `INSERT INTO party_invitations (party_id, from_user_id, to_user_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (party_id, to_user_id) DO UPDATE SET
         status = 'pending', from_user_id = $2, created_at = NOW(), responded_at = NULL`,
      [partyId, req.session.userId, toUserId]
    );

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
