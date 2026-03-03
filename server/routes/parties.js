import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { sendSMS } from '../sms.js';
import { awardPoints } from './rewards.js';
import { sendPushToUser } from './push.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { gameId, city } = req.query;
    let query = `
      SELECT p.*, u.name as host_name, u.email as host_email,
        u.subscription_tier as host_subscription_tier,
        (SELECT COUNT(*) FROM party_attendees pa WHERE pa.party_id = p.id) as attendee_count,
        v.picture as venue_picture, v.logo as venue_logo
      FROM parties p
      JOIN users u ON p.host_id = u.id
      LEFT JOIN venues v ON LOWER(v.name) = LOWER(p.venue_name) AND LOWER(v.city) = LOWER(p.city)
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

    conditions.push(`(p.game_time IS NULL OR p.game_time ~ '^\\d{4}-' AND p.game_time::timestamptz > NOW() - INTERVAL '4 hours' OR p.game_time !~ '^\\d{4}-')`);

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ` ORDER BY (CASE WHEN u.subscription_tier = 'pro' THEN 0 ELSE 1 END), p.created_at DESC`;

    const result = await pool.query(query, params);

    const parties = await Promise.all(result.rows.map(async (party) => {
      const attendees = await pool.query(
        `SELECT u.id, u.email, u.name, u.gender, u.profile_picture, u.is_founder, u.founder_number,
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
        attendeeDetails: attendees.rows.map(a => ({ userId: a.id, email: a.email, name: a.name, gender: a.gender, profilePicture: a.profile_picture, favoriteTeams: a.favorite_teams || {}, isFounder: a.is_founder || false, founderNumber: a.founder_number || null })),
        supportedTeam: party.supported_team,
        createdAt: party.created_at,
        venuePicture: party.venue_picture || null,
        venueLogo: party.venue_logo || null
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

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.*, u.name as host_name, u.email as host_email
       FROM parties p JOIN users u ON p.host_id = u.id WHERE p.id = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Party not found' });
    const party = result.rows[0];
    const attendees = await pool.query(
      `SELECT u.id, u.email, u.name, u.profile_picture, u.is_founder, u.founder_number
       FROM party_attendees pa JOIN users u ON pa.user_id = u.id WHERE pa.party_id = $1`,
      [id]
    );
    res.json({
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
      attendeeDetails: attendees.rows.map(a => ({ userId: a.id, email: a.email, name: a.name, profilePicture: a.profile_picture, isFounder: a.is_founder, founderNumber: a.founder_number })),
      supportedTeam: party.supported_team,
      createdAt: party.created_at
    });
  } catch (error) {
    console.error('Get party by id error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { gameId, sport, homeTeam, awayTeam, gameTime, venueName, venueAddress, city, title, notes, maxSize, supportedTeam } = req.body;

    const result = await pool.query(
      `INSERT INTO parties (game_id, sport, home_team, away_team, game_time, venue_name, venue_address, city, title, notes, max_size, host_id, supported_team)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
      [gameId, sport, homeTeam, awayTeam, gameTime, venueName, venueAddress, city, title, notes, maxSize || 20, req.session.userId, supportedTeam || null]
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

        for (const fan of fellowFans.rows) {
          sendPushToUser(fan.id, {
            title: `New ${sport} Watch Party!`,
            body: `${hostName} created "${partyLabel}"${cityLabel}. Join your fellow fans!`,
            icon: '/huddle-up-logo-2.png',
            tag: `party-${partyId}`,
            data: { url: '/' }
          }).catch(() => {});
        }
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

    awardPoints(req.session.userId, 'create_party', `Created party: ${title || `${homeTeam} vs ${awayTeam}`}`, partyId).catch(() => {});

    res.json({ id: partyId });
  } catch (error) {
    console.error('Create party error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const party = await pool.query('SELECT * FROM parties WHERE id = $1', [req.params.id]);
    if (party.rows.length === 0) return res.status(404).json({ error: 'Party not found' });
    if (party.rows[0].host_id !== req.session.userId) return res.status(403).json({ error: 'Only the host can edit this party' });

    const { venueName, venueAddress, city, notes, maxSize, gameTime } = req.body;
    const parsedMaxSize = maxSize && maxSize !== '' ? parseInt(maxSize) : party.rows[0].max_size;
    await pool.query(
      `UPDATE parties SET
        venue_name = COALESCE($1, venue_name),
        venue_address = COALESCE($2, venue_address),
        city = COALESCE($3, city),
        notes = $4,
        max_size = $5,
        game_time = COALESCE($6, game_time)
      WHERE id = $7`,
      [venueName || null, venueAddress || null, city || null, notes !== undefined ? notes : party.rows[0].notes, isNaN(parsedMaxSize) ? party.rows[0].max_size : parsedMaxSize, gameTime || null, req.params.id]
    );
    res.json({ ok: true });
  } catch (error) {
    console.error('Edit party error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/join', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'INSERT INTO party_attendees (party_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING id',
      [req.params.id, req.session.userId]
    );
    if (result.rows.length > 0) {
      awardPoints(req.session.userId, 'attend_party', 'Joined a watch party', req.params.id).catch(() => {});

      const partyInfo = await pool.query('SELECT host_id, home_team, away_team, venue_name FROM parties WHERE id = $1', [req.params.id]);
      const joinerInfo = await pool.query('SELECT name FROM users WHERE id = $1', [req.session.userId]);
      const p = partyInfo.rows[0];
      const joinerName = joinerInfo.rows[0]?.name || 'Someone';

      if (p && p.host_id !== req.session.userId) {
        try {
          await sendPushToUser(p.host_id, {
            title: 'Someone joined your party!',
            body: `${joinerName} just joined your ${p.home_team} vs ${p.away_team} watch party${p.venue_name ? ' at ' + p.venue_name : ''}.`,
            icon: '/huddle-up-logo-2.png',
            url: '/'
          }, { prefType: 'friend_activity' });
        } catch (pushErr) {}
      }

      if (p) {
        try {
          const friendsInParty = await pool.query(
            `SELECT pa.user_id FROM party_attendees pa
             JOIN friendships f ON (
               (f.user_id = $1 AND f.friend_id = pa.user_id)
               OR (f.friend_id = $1 AND f.user_id = pa.user_id)
             )
             WHERE pa.party_id = $2
             AND f.status = 'accepted'
             AND pa.user_id != $1`,
            [req.session.userId, req.params.id]
          );
          for (const friend of friendsInParty.rows) {
            try {
              await sendPushToUser(friend.user_id, {
                title: 'Your friend joined the party! 🎉',
                body: `${joinerName} just joined the ${p.home_team} vs ${p.away_team} watch party${p.venue_name ? ' at ' + p.venue_name : ''}.`,
                icon: '/huddle-up-logo-2.png',
                url: '/'
              }, { prefType: 'friend_activity' });
            } catch (pushErr) {}
          }
        } catch (friendErr) {}
      }
    }
    res.json({ ok: true });
  } catch (error) {
    console.error('Join party error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const party = await pool.query('SELECT * FROM parties WHERE id = $1', [req.params.id]);
    if (party.rows.length === 0) return res.status(404).json({ error: 'Party not found' });
    if (party.rows[0].host_id !== req.session.userId) return res.status(403).json({ error: 'Only the host can delete this party' });

    await pool.query('DELETE FROM party_attendees WHERE party_id = $1', [req.params.id]);
    await pool.query('DELETE FROM parties WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (error) {
    console.error('Delete party error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id/calendar', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT p.*, u.name as host_name FROM parties p JOIN users u ON p.host_id = u.id WHERE p.id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Party not found' });

    const party = result.rows[0];
    const title = party.title || `${party.home_team} vs ${party.away_team} Watch Party`;
    const location = [party.venue_name, party.venue_address].filter(Boolean).join(', ');

    let gameTime;
    if (party.game_time && /^\d+$/.test(party.game_time.trim())) {
      const epoch = Number(party.game_time.trim());
      gameTime = new Date(epoch < 1e12 ? epoch * 1000 : epoch);
    } else {
      gameTime = party.game_time ? new Date(party.game_time) : new Date();
    }
    if (isNaN(gameTime.getTime())) gameTime = new Date();

    const endTime = new Date(gameTime.getTime() + 3 * 60 * 60 * 1000);
    const now = new Date();

    const formatIcsDate = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    const partyUrl = `${req.protocol}://${req.get('host')}`;
    const descParts = [];
    if (party.notes) descParts.push(party.notes);
    descParts.push(`Watch Party hosted by ${party.host_name}`);
    descParts.push(`${party.home_team} vs ${party.away_team}`);
    if (party.venue_name) descParts.push(`Venue: ${party.venue_name}`);
    descParts.push(`Join on Huddle Up: ${partyUrl}`);
    const description = descParts.join('\\n');

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Huddle Up//Watch Party//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `DTSTART:${formatIcsDate(gameTime)}`,
      `DTEND:${formatIcsDate(endTime)}`,
      `DTSTAMP:${formatIcsDate(now)}`,
      `UID:party-${party.id}@huddleup`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'ACTION:DISPLAY',
      `DESCRIPTION:${title} starts in 1 hour!`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="huddle-up-party-${party.id}.ics"`);
    res.send(ics);
  } catch (error) {
    console.error('Calendar export error:', error);
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
