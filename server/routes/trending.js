import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/feed', async (req, res) => {
  try {
    const promotedResult = await pool.query(
      `SELECT p.id, p.host_id, p.venue_name, p.game_time, p.sport, p.home_team, p.away_team, p.city, p.title,
        (SELECT COUNT(*) FROM party_attendees WHERE party_id = p.id) as attendee_count,
        u.name as host_name, u.profile_picture as host_picture
       FROM parties p
       JOIN promoted_parties pp ON p.id = pp.party_id
       JOIN users u ON p.host_id = u.id
       WHERE pp.end_at > NOW()
       ORDER BY pp.created_at DESC
       LIMIT 10`
    );

    const trendingResult = await pool.query(
      `SELECT p.id, p.host_id, p.venue_name, p.game_time, p.sport, p.home_team, p.away_team, p.city, p.title,
        (SELECT COUNT(*) FROM party_attendees WHERE party_id = p.id) as attendee_count,
        u.name as host_name, u.profile_picture as host_picture
       FROM parties p
       JOIN users u ON p.host_id = u.id
       WHERE p.created_at >= NOW() - INTERVAL '7 days'
       ORDER BY attendee_count DESC, p.created_at DESC
       LIMIT 10`
    );

    const trending_parties = [
      ...promotedResult.rows,
      ...trendingResult.rows.filter(tr => !promotedResult.rows.find(pr => pr.id === tr.id))
    ].slice(0, 10);

    const venuesResult = await pool.query(
      `SELECT v.id, v.name, v.address, v.city, v.verified, v.featured, v.featured_tier, v.featured_until, v.logo, v.picture,
        COUNT(p.id) as party_count
       FROM venues v
       LEFT JOIN parties p ON LOWER(v.name) = LOWER(p.venue_name)
       WHERE p.created_at >= NOW() - INTERVAL '30 days'
       GROUP BY v.id, v.name, v.address, v.city, v.verified, v.featured, v.featured_tier, v.featured_until, v.logo, v.picture
       HAVING COUNT(p.id) > 0
       ORDER BY CASE WHEN v.featured = true AND (v.featured_until IS NULL OR v.featured_until > NOW()) THEN 0 ELSE 1 END, party_count DESC
       LIMIT 5`
    );

    const hot_venues = venuesResult.rows;

    const sportsResult = await pool.query(
      `SELECT sport, COUNT(*) as party_count
       FROM parties
       WHERE created_at >= NOW() - INTERVAL '7 days'
       GROUP BY sport
       ORDER BY party_count DESC
       LIMIT 5`
    );

    const popular_games = sportsResult.rows;

    res.json({
      trendingParties: trending_parties.map(p => ({
        id: p.id,
        hostId: p.host_id,
        hostName: p.host_name,
        hostPicture: p.host_picture,
        venueName: p.venue_name,
        sport: p.sport,
        homeTeam: p.home_team,
        awayTeam: p.away_team,
        gameTime: p.game_time,
        city: p.city,
        title: p.title,
        attendeeCount: parseInt(p.attendee_count)
      })),
      hotVenues: hot_venues.map(v => ({
        id: v.id,
        name: v.name,
        address: v.address,
        city: v.city,
        verified: v.verified,
        featured: v.featured && (v.featured_until === null || new Date(v.featured_until) > new Date()),
        logo: v.logo,
        picture: v.picture,
        partyCount: parseInt(v.party_count)
      })),
      popularGames: popular_games.map(g => ({
        sport: g.sport,
        partyCount: parseInt(g.party_count)
      }))
    });
  } catch (error) {
    console.error('Get trending feed error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/suggested', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;

    const userResult = await pool.query(
      `SELECT user_city FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userCity = userResult.rows[0].user_city;

    const friendsResult = await pool.query(
      `SELECT friend_id FROM friendships 
       WHERE user_id = $1 AND status = 'accepted'
       UNION
       SELECT user_id FROM friendships 
       WHERE friend_id = $1 AND status = 'accepted'`,
      [userId]
    );

    const friendIds = friendsResult.rows.map(r => r.friend_id || r.user_id);

    const favoriteTeamsResult = await pool.query(
      `SELECT DISTINCT team FROM user_favorite_teams WHERE user_id = $1`,
      [userId]
    );

    const favoriteTeams = favoriteTeamsResult.rows.map(r => r.team);

    let query = `
      WITH party_scores AS (
        SELECT DISTINCT p.id, p.host_id, p.venue_name, p.game_time, p.sport, p.home_team, p.away_team, p.city, p.title,
          (SELECT COUNT(*) FROM party_attendees WHERE party_id = p.id) as attendee_count,
          u.name as host_name, u.profile_picture as host_picture,
          CASE 
            WHEN EXISTS (SELECT 1 FROM party_attendees pa WHERE pa.party_id = p.id AND pa.user_id = ANY($1::uuid[])) THEN 3
            ELSE 0
          END +
          CASE 
            WHEN p.home_team = ANY($2::text[]) OR p.away_team = ANY($2::text[]) THEN 2
            ELSE 0
          END +
          CASE 
            WHEN LOWER(p.city) = LOWER($3) THEN 1
            ELSE 0
          END as relevance_score
        FROM parties p
        JOIN users u ON p.host_id = u.id
        WHERE p.created_at >= NOW() - INTERVAL '30 days'
        AND p.host_id != $4
        AND NOT EXISTS (SELECT 1 FROM party_attendees WHERE party_id = p.id AND user_id = $4)
      )
      SELECT id, host_id, venue_name, game_time, sport, home_team, away_team, city, title,
        attendee_count, host_name, host_picture, relevance_score
      FROM party_scores
      WHERE relevance_score > 0
      ORDER BY relevance_score DESC, attendee_count DESC
      LIMIT 10
    `;

    const params = [friendIds.length > 0 ? friendIds : [null], favoriteTeams.length > 0 ? favoriteTeams : [null], userCity || '', userId];

    const suggestedResult = await pool.query(query, params);

    const suggested_parties = suggestedResult.rows.map(p => ({
      id: p.id,
      hostId: p.host_id,
      hostName: p.host_name,
      hostPicture: p.host_picture,
      venueName: p.venue_name,
      sport: p.sport,
      homeTeam: p.home_team,
      awayTeam: p.away_team,
      gameTime: p.game_time,
      city: p.city,
      title: p.title,
      attendeeCount: parseInt(p.attendee_count),
      relevanceScore: parseInt(p.relevance_score)
    }));

    res.json(suggested_parties);
  } catch (error) {
    console.error('Get suggested parties error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/highlights/:partyId', requireAuth, async (req, res) => {
  try {
    const { partyId } = req.params;
    const { recapText, photos } = req.body;
    const userId = req.session.userId;

    const partyResult = await pool.query(
      'SELECT host_id FROM parties WHERE id = $1',
      [partyId]
    );

    if (partyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Party not found' });
    }

    if (partyResult.rows[0].host_id !== userId) {
      return res.status(403).json({ error: 'Only the host can create highlights' });
    }

    const photosArray = Array.isArray(photos) ? photos : [];

    const existingHighlight = await pool.query(
      'SELECT id FROM party_highlights WHERE party_id = $1',
      [partyId]
    );

    let result;
    if (existingHighlight.rows.length > 0) {
      result = await pool.query(
        `UPDATE party_highlights 
         SET recap_text = $1, photos = $2
         WHERE party_id = $3
         RETURNING id`,
        [recapText || null, photosArray, partyId]
      );
    } else {
      result = await pool.query(
        `INSERT INTO party_highlights (party_id, user_id, recap_text, photos)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [partyId, userId, recapText || null, photosArray]
      );

      await pool.query(
        'UPDATE parties SET has_recap = TRUE WHERE id = $1',
        [partyId]
      );
    }

    res.json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Create/update highlight error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/highlights/:partyId', async (req, res) => {
  try {
    const { partyId } = req.params;

    const result = await pool.query(
      `SELECT ph.id, ph.party_id, ph.user_id, ph.recap_text, ph.photos, ph.created_at,
        u.name as user_name, u.profile_picture,
        p.venue_name, p.sport, p.home_team, p.away_team, p.city
       FROM party_highlights ph
       JOIN users u ON ph.user_id = u.id
       JOIN parties p ON ph.party_id = p.id
       WHERE ph.party_id = $1`,
      [partyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Highlight not found' });
    }

    const highlight = result.rows[0];
    res.json({
      id: highlight.id,
      partyId: highlight.party_id,
      userId: highlight.user_id,
      userName: highlight.user_name,
      userProfilePicture: highlight.profile_picture,
      recapText: highlight.recap_text,
      photos: highlight.photos || [],
      createdAt: highlight.created_at,
      venueName: highlight.venue_name,
      sport: highlight.sport,
      homeTeam: highlight.home_team,
      awayTeam: highlight.away_team,
      city: highlight.city
    });
  } catch (error) {
    console.error('Get highlight error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/highlights', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ph.id, ph.party_id, ph.user_id, ph.recap_text, ph.photos, ph.created_at,
        u.name as user_name, u.profile_picture,
        p.venue_name, p.sport, p.home_team, p.away_team, p.city
       FROM party_highlights ph
       JOIN users u ON ph.user_id = u.id
       JOIN parties p ON ph.party_id = p.id
       ORDER BY ph.created_at DESC
       LIMIT 20`
    );

    const highlights = result.rows.map(h => ({
      id: h.id,
      partyId: h.party_id,
      userId: h.user_id,
      userName: h.user_name,
      userProfilePicture: h.profile_picture,
      recapText: h.recap_text,
      photos: h.photos || [],
      createdAt: h.created_at,
      venueName: h.venue_name,
      sport: h.sport,
      homeTeam: h.home_team,
      awayTeam: h.away_team,
      city: h.city
    }));

    res.json(highlights);
  } catch (error) {
    console.error('Get highlights list error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
