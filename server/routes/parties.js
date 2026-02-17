import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { sendSMS } from '../sms.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { gameId, city } = req.query;
    let query = `
      SELECT p.*, u.name as host_name, u.email as host_email,
        (SELECT COUNT(*) FROM party_attendees pa WHERE pa.party_id = p.id) as attendee_count
      FROM parties p
      JOIN users u ON p.host_id = u.id
    `;
    const params = [];
    const conditions = [];

    if (gameId) {
      params.push(gameId);
      conditions.push(`p.game_id = $${params.length}`);
    }
    if (city) {
      params.push(`%${city}%`);
      conditions.push(`p.city ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY p.created_at DESC';

    const result = await pool.query(query, params);

    const parties = await Promise.all(result.rows.map(async (party) => {
      const attendees = await pool.query(
        `SELECT u.id, u.email, u.name, u.gender, u.profile_picture,
         (SELECT json_object_agg(ft.sport, ft.team) FROM user_favorite_teams ft WHERE ft.user_id = u.id) as favorite_teams
         FROM party_attendees pa JOIN users u ON pa.user_id = u.id WHERE pa.party_id = $1`,
        [party.id]
      );
      return {
        id: party.id,
        gameId: party.game_id,
        sport: party.sport,
        homeTeam: party.home_team,
        awayTeam: party.away_team,
        gameTime: party.game_time,
        venueName: party.venue_name,
        venueAddress: party.venue_address,
        city: party.city,
        title: party.title,
        notes: party.notes,
        maxSize: party.max_size,
        hostEmail: party.host_email,
        hostName: party.host_name,
        hostId: party.host_id,
        attendees: attendees.rows.map(a => a.email),
        attendeeDetails: attendees.rows.map(a => ({ email: a.email, name: a.name, gender: a.gender, profilePicture: a.profile_picture, favoriteTeams: a.favorite_teams || {} })),
        createdAt: party.created_at
      };
    }));

    res.json(parties);
  } catch (error) {
    console.error('Get parties error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/mine', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT party_id FROM party_attendees WHERE user_id = $1',
      [req.session.userId]
    );
    res.json(result.rows.map(r => r.party_id));
  } catch (error) {
    console.error('Get my parties error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { gameId, sport, homeTeam, awayTeam, gameTime, venueName, venueAddress, city, title, notes, maxSize } = req.body;

    const result = await pool.query(
      `INSERT INTO parties (game_id, sport, home_team, away_team, game_time, venue_name, venue_address, city, title, notes, max_size, host_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
      [gameId, sport, homeTeam, awayTeam, gameTime, venueName, venueAddress, city, title, notes, maxSize || 20, req.session.userId]
    );

    const partyId = result.rows[0].id;

    await pool.query(
      'INSERT INTO party_attendees (party_id, user_id) VALUES ($1, $2)',
      [partyId, req.session.userId]
    );

    const hostResult = await pool.query('SELECT name FROM users WHERE id = $1', [req.session.userId]);
    const hostName = hostResult.rows[0]?.name || 'Someone';

    const teams = [homeTeam, awayTeam].filter(Boolean);
    if (teams.length > 0 && sport) {
      const fellowFans = await pool.query(
        `SELECT DISTINCT u.id FROM users u
         JOIN user_favorite_teams ft ON ft.user_id = u.id
         WHERE ft.sport = $1
         AND ft.team = ANY($2::text[])
         AND u.id != $3
         AND u.notifications_enabled = TRUE`,
        [sport, teams, req.session.userId]
      );

      if (fellowFans.rows.length > 0) {
        const partyLabel = title || `${homeTeam} vs ${awayTeam}`;
        const cityLabel = city ? ` in ${city}` : '';
        const values = fellowFans.rows.map((fan, i) => {
          const offset = i * 5;
          return `($${offset+1}, $${offset+2}, $${offset+3}, $${offset+4}, $${offset+5})`;
        }).join(', ');
        const params = fellowFans.rows.flatMap(fan => [
          fan.id,
          'fan_party',
          `New ${sport} Party!`,
          `${hostName} created "${partyLabel}"${cityLabel}. Join your fellow fans!`,
          partyId
        ]);
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, message, party_id) VALUES ${values}`,
          params
        );
      }

      if (teams.length > 0 && city) {
        const smsFans = await pool.query(
          `SELECT DISTINCT u.phone_number FROM users u
           JOIN user_favorite_teams ft ON ft.user_id = u.id
           WHERE ft.sport = $1
           AND ft.team = ANY($2::text[])
           AND u.id != $3
           AND u.sms_notifications = TRUE
           AND u.phone_number IS NOT NULL
           AND u.user_city ILIKE $4`,
          [sport, teams, req.session.userId, `%${city}%`]
        );

        if (smsFans.rows.length > 0) {
          const partyLabel = title || `${homeTeam} vs ${awayTeam}`;
          const smsMessage = `HUDDLE UP! 🏟️ A ${sport} watch party for "${partyLabel}" was just created in ${city}! Open Huddle Up to join your fellow fans.`;
          for (const fan of smsFans.rows) {
            sendSMS(fan.phone_number, smsMessage).catch(() => {});
          }
        }
      }
    }

    res.json({ id: partyId });
  } catch (error) {
    console.error('Create party error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/join', requireAuth, async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO party_attendees (party_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.params.id, req.session.userId]
    );
    res.json({ ok: true });
  } catch (error) {
    console.error('Join party error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/leave', requireAuth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM party_attendees WHERE party_id = $1 AND user_id = $2',
      [req.params.id, req.session.userId]
    );

    const remaining = await pool.query('SELECT COUNT(*) FROM party_attendees WHERE party_id = $1', [req.params.id]);
    if (parseInt(remaining.rows[0].count) === 0) {
      await pool.query('DELETE FROM parties WHERE id = $1', [req.params.id]);
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Leave party error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
