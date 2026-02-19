import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /preferences - Get current user's notification preferences
router.get('/preferences', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT team_alerts, rivalry_alerts, suggested_parties, game_reminders FROM notification_preferences WHERE user_id = $1',
      [req.session.userId]
    );

    if (result.rows.length > 0) {
      res.json({
        teamAlerts: result.rows[0].team_alerts,
        rivalryAlerts: result.rows[0].rivalry_alerts,
        suggestedParties: result.rows[0].suggested_parties,
        gameReminders: result.rows[0].game_reminders
      });
    } else {
      // Return defaults if none exist
      res.json({
        teamAlerts: true,
        rivalryAlerts: true,
        suggestedParties: true,
        gameReminders: true
      });
    }
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /preferences - Update notification preferences
router.put('/preferences', requireAuth, async (req, res) => {
  try {
    const { teamAlerts, rivalryAlerts, suggestedParties, gameReminders } = req.body;

    // Upsert into notification_preferences table
    await pool.query(
      `INSERT INTO notification_preferences (user_id, team_alerts, rivalry_alerts, suggested_parties, game_reminders)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET
         team_alerts = $2,
         rivalry_alerts = $3,
         suggested_parties = $4,
         game_reminders = $5`,
      [req.session.userId, teamAlerts, rivalryAlerts, suggestedParties, gameReminders]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /team-alerts - Check if any of the user's favorite teams are playing soon (next 48 hours)
router.get('/team-alerts', requireAuth, async (req, res) => {
  try {
    // Get user's favorite teams
    const favTeamsResult = await pool.query(
      'SELECT team, sport FROM user_favorite_teams WHERE user_id = $1',
      [req.session.userId]
    );

    if (favTeamsResult.rows.length === 0) {
      return res.json({ alerts: [] });
    }

    const alerts = [];

    // For each favorite team, check for upcoming parties in the next 48 hours
    for (const favTeam of favTeamsResult.rows) {
      const partiesResult = await pool.query(
        `SELECT p.id, p.sport, p.home_team, p.away_team, p.game_time, p.created_at
         FROM parties p
         WHERE p.sport = $1
         AND (LOWER(p.home_team) = LOWER($2) OR LOWER(p.away_team) = LOWER($2))
         AND p.game_time IS NOT NULL
         AND TO_TIMESTAMP(p.game_time, 'YYYY-MM-DD HH24:MI:SS') > NOW()
         AND TO_TIMESTAMP(p.game_time, 'YYYY-MM-DD HH24:MI:SS') <= NOW() + INTERVAL '48 hours'
         ORDER BY p.game_time ASC`,
        [favTeam.sport, favTeam.team]
      );

      // Group parties by opponent and game date
      const gameMap = new Map();
      for (const party of partiesResult.rows) {
        const opponent = party.home_team.toLowerCase() === favTeam.team.toLowerCase() ? party.away_team : party.home_team;
        const gameKey = `${favTeam.sport}-${favTeam.team}-${opponent}-${party.game_time}`;
        
        if (!gameMap.has(gameKey)) {
          gameMap.set(gameKey, {
            team: favTeam.team,
            opponent,
            gameDate: party.game_time,
            sport: favTeam.sport,
            partiesNearby: 0
          });
        }
        gameMap.get(gameKey).partiesNearby += 1;
      }

      alerts.push(...gameMap.values());
    }

    res.json({ alerts });
  } catch (error) {
    console.error('Get team alerts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /rivalry-alerts - Check for upcoming rivalry games
router.get('/rivalry-alerts', requireAuth, async (req, res) => {
  try {
    // Get all rivalry pairs
    const rivalryResult = await pool.query(
      'SELECT sport, team_a, team_b FROM rivalry_pairs'
    );

    const alerts = [];

    // For each rivalry pair, check for upcoming parties in the next 48 hours
    for (const rivalry of rivalryResult.rows) {
      const partiesResult = await pool.query(
        `SELECT p.id, p.sport, p.home_team, p.away_team, p.game_time
         FROM parties p
         WHERE p.sport = $1
         AND (
           (LOWER(p.home_team) = LOWER($2) AND LOWER(p.away_team) = LOWER($3))
           OR (LOWER(p.home_team) = LOWER($3) AND LOWER(p.away_team) = LOWER($2))
         )
         AND p.game_time IS NOT NULL
         AND TO_TIMESTAMP(p.game_time, 'YYYY-MM-DD HH24:MI:SS') > NOW()
         AND TO_TIMESTAMP(p.game_time, 'YYYY-MM-DD HH24:MI:SS') <= NOW() + INTERVAL '48 hours'
         ORDER BY p.game_time ASC`,
        [rivalry.sport, rivalry.team_a, rivalry.team_b]
      );

      if (partiesResult.rows.length > 0) {
        alerts.push({
          teamA: rivalry.team_a,
          teamB: rivalry.team_b,
          sport: rivalry.sport,
          partiesNearby: partiesResult.rows.length,
          gameDate: partiesResult.rows[0].game_time
        });
      }
    }

    res.json({ alerts });
  } catch (error) {
    console.error('Get rivalry alerts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /rivalry-pairs - Admin only: add a rivalry pair
router.post('/rivalry-pairs', requireAuth, async (req, res) => {
  try {
    // Check if user is admin
    const userResult = await pool.query(
      'SELECT is_admin FROM users WHERE id = $1',
      [req.session.userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { sport, teamA, teamB, intensity } = req.body;

    // Insert the rivalry pair (will fail gracefully if duplicate)
    const result = await pool.query(
      `INSERT INTO rivalry_pairs (sport, team_a, team_b, intensity)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (sport, team_a, team_b) DO NOTHING
       RETURNING id`,
      [sport, teamA, teamB, intensity || 'high']
    );

    if (result.rows.length === 0) {
      return res.status(409).json({ error: 'Rivalry pair already exists' });
    }

    res.json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Add rivalry pair error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /rivalry-pairs - List all rivalry pairs
router.get('/rivalry-pairs', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, sport, team_a, team_b, intensity FROM rivalry_pairs ORDER BY sport, team_a, team_b'
    );

    const pairs = result.rows.map(row => ({
      id: row.id,
      sport: row.sport,
      teamA: row.team_a,
      teamB: row.team_b,
      intensity: row.intensity
    }));

    res.json(pairs);
  } catch (error) {
    console.error('Get rivalry pairs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Seed default rivalry pairs if table is empty
async function seedRivalryPairs() {
  try {
    const check = await pool.query('SELECT COUNT(*) as count FROM rivalry_pairs');
    
    if (parseInt(check.rows[0].count) === 0) {
      const rivalries = [
        // NFL
        { sport: 'NFL', teamA: 'Chiefs', teamB: 'Raiders', intensity: 'high' },
        { sport: 'NFL', teamA: 'Cowboys', teamB: 'Eagles', intensity: 'high' },
        { sport: 'NFL', teamA: 'Packers', teamB: 'Bears', intensity: 'high' },
        { sport: 'NFL', teamA: '49ers', teamB: 'Seahawks', intensity: 'high' },
        { sport: 'NFL', teamA: 'Steelers', teamB: 'Ravens', intensity: 'high' },
        // NBA
        { sport: 'NBA', teamA: 'Lakers', teamB: 'Celtics', intensity: 'high' },
        { sport: 'NBA', teamA: 'Heat', teamB: 'Knicks', intensity: 'high' },
        { sport: 'NBA', teamA: 'Warriors', teamB: 'Clippers', intensity: 'high' },
        // MLB
        { sport: 'MLB', teamA: 'Yankees', teamB: 'Red Sox', intensity: 'high' },
        { sport: 'MLB', teamA: 'Dodgers', teamB: 'Giants', intensity: 'high' },
        { sport: 'MLB', teamA: 'Cubs', teamB: 'Cardinals', intensity: 'high' }
      ];

      for (const rivalry of rivalries) {
        await pool.query(
          `INSERT INTO rivalry_pairs (sport, team_a, team_b, intensity)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (sport, team_a, team_b) DO NOTHING`,
          [rivalry.sport, rivalry.teamA, rivalry.teamB, rivalry.intensity]
        );
      }
      console.log('Rivalry pairs seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding rivalry pairs:', error);
  }
}

// Seed on module load
seedRivalryPairs();

export default router;
