import { Router } from 'express';
import pool from '../db.js';

const router = Router();

const requireAuth = (req, res, next) => {
  if (!req.session?.userId) return res.status(401).json({ error: 'Not authenticated' });
  next();
};

router.get('/leagues', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT fl.*, u.name as commissioner_name,
        (SELECT COUNT(*) FROM fantasy_teams ft WHERE ft.league_id = fl.id) as team_count
      FROM fantasy_leagues fl
      LEFT JOIN users u ON fl.commissioner_id = u.id
      WHERE fl.id IN (SELECT league_id FROM fantasy_teams WHERE user_id = $1)
         OR fl.commissioner_id = $1
      ORDER BY fl.created_at DESC
    `, [req.session.userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/leagues', requireAuth, async (req, res) => {
  try {
    const { name, platform, sport, season, teamName } = req.body;
    if (!name || !teamName) return res.status(400).json({ error: 'League name and your team name are required' });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const league = await client.query(
        `INSERT INTO fantasy_leagues (name, platform, sport, season, commissioner_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [name, platform || 'espn', sport || 'NFL', season || '2025-26', req.session.userId]
      );
      await client.query(
        `INSERT INTO fantasy_teams (league_id, user_id, team_name) VALUES ($1, $2, $3)`,
        [league.rows[0].id, req.session.userId, teamName]
      );
      await client.query('COMMIT');
      res.json(league.rows[0]);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/leagues/:id', requireAuth, async (req, res) => {
  try {
    const league = await pool.query(`
      SELECT fl.*, u.name as commissioner_name
      FROM fantasy_leagues fl
      LEFT JOIN users u ON fl.commissioner_id = u.id
      WHERE fl.id = $1
    `, [req.params.id]);
    if (league.rows.length === 0) return res.status(404).json({ error: 'League not found' });

    const membership = await pool.query(
      'SELECT 1 FROM fantasy_teams WHERE league_id = $1 AND user_id = $2 UNION SELECT 1 WHERE $2 = $3',
      [req.params.id, req.session.userId, league.rows[0].commissioner_id]
    );
    if (membership.rows.length === 0) return res.status(403).json({ error: 'You are not a member of this league' });

    const teams = await pool.query(`
      SELECT ft.*, u.name as owner_name, u.profile_picture
      FROM fantasy_teams ft
      LEFT JOIN users u ON ft.user_id = u.id
      WHERE ft.league_id = $1
      ORDER BY ft.points DESC, ft.wins DESC
    `, [req.params.id]);

    const teamIds = teams.rows.map(t => t.id);
    let players = [];
    if (teamIds.length > 0) {
      const playersResult = await pool.query(`
        SELECT * FROM fantasy_players WHERE team_id = ANY($1) ORDER BY is_starter DESC, points DESC
      `, [teamIds]);
      players = playersResult.rows;
    }

    res.json({
      ...league.rows[0],
      teams: teams.rows.map(t => ({
        ...t,
        players: players.filter(p => p.team_id === t.id)
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/leagues/:id', requireAuth, async (req, res) => {
  try {
    const league = await pool.query('SELECT * FROM fantasy_leagues WHERE id = $1', [req.params.id]);
    if (league.rows.length === 0) return res.status(404).json({ error: 'League not found' });
    if (league.rows[0].commissioner_id !== req.session.userId) {
      return res.status(403).json({ error: 'Only the commissioner can delete the league' });
    }
    await pool.query('DELETE FROM fantasy_leagues WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/leagues/:id/join', requireAuth, async (req, res) => {
  try {
    const { teamName, inviteCode } = req.body;
    if (!teamName) return res.status(400).json({ error: 'Team name is required' });

    const league = await pool.query('SELECT * FROM fantasy_leagues WHERE id = $1', [req.params.id]);
    if (league.rows.length === 0) return res.status(404).json({ error: 'League not found' });

    if (inviteCode && league.rows[0].invite_code !== inviteCode) {
      return res.status(403).json({ error: 'Invalid invite code' });
    }

    const existing = await pool.query('SELECT * FROM fantasy_teams WHERE league_id = $1 AND user_id = $2', [req.params.id, req.session.userId]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'You already have a team in this league' });

    const team = await pool.query(
      `INSERT INTO fantasy_teams (league_id, user_id, team_name) VALUES ($1, $2, $3) RETURNING *`,
      [req.params.id, req.session.userId, teamName]
    );
    res.json(team.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/leagues/join-by-code', requireAuth, async (req, res) => {
  try {
    const { inviteCode, teamName } = req.body;
    if (!inviteCode || !teamName) return res.status(400).json({ error: 'Invite code and team name are required' });

    const league = await pool.query('SELECT * FROM fantasy_leagues WHERE invite_code = $1', [inviteCode]);
    if (league.rows.length === 0) return res.status(404).json({ error: 'League not found with that invite code' });

    const existing = await pool.query('SELECT * FROM fantasy_teams WHERE league_id = $1 AND user_id = $2', [league.rows[0].id, req.session.userId]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'You already have a team in this league' });

    const team = await pool.query(
      `INSERT INTO fantasy_teams (league_id, user_id, team_name) VALUES ($1, $2, $3) RETURNING *`,
      [league.rows[0].id, req.session.userId, teamName]
    );
    res.json({ team: team.rows[0], league: league.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/teams/:id', requireAuth, async (req, res) => {
  try {
    const team = await pool.query('SELECT * FROM fantasy_teams WHERE id = $1 AND user_id = $2', [req.params.id, req.session.userId]);
    if (team.rows.length === 0) return res.status(404).json({ error: 'Team not found or not yours' });

    const { teamName, wins, losses, points } = req.body;
    const result = await pool.query(
      `UPDATE fantasy_teams SET
        team_name = COALESCE($1, team_name),
        wins = COALESCE($2, wins),
        losses = COALESCE($3, losses),
        points = COALESCE($4, points)
       WHERE id = $5 RETURNING *`,
      [teamName, wins, losses, points, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/teams/:id/players', requireAuth, async (req, res) => {
  try {
    const team = await pool.query('SELECT * FROM fantasy_teams WHERE id = $1 AND user_id = $2', [req.params.id, req.session.userId]);
    if (team.rows.length === 0) return res.status(404).json({ error: 'Team not found or not yours' });

    const { playerName, position, nflTeam, isStarter } = req.body;
    if (!playerName) return res.status(400).json({ error: 'Player name is required' });

    const result = await pool.query(
      `INSERT INTO fantasy_players (team_id, player_name, position, nfl_team, is_starter)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.params.id, playerName, position, nflTeam, isStarter !== false]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/players/:id', requireAuth, async (req, res) => {
  try {
    const player = await pool.query(`
      SELECT fp.* FROM fantasy_players fp
      JOIN fantasy_teams ft ON fp.team_id = ft.id
      WHERE fp.id = $1 AND ft.user_id = $2
    `, [req.params.id, req.session.userId]);
    if (player.rows.length === 0) return res.status(404).json({ error: 'Player not found or not on your team' });

    await pool.query('DELETE FROM fantasy_players WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/parties/:partyId/leagues', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT fl.*, pfl.linked_by, u.name as linked_by_name,
        (SELECT COUNT(*) FROM fantasy_teams ft WHERE ft.league_id = fl.id) as team_count
      FROM party_fantasy_links pfl
      JOIN fantasy_leagues fl ON pfl.league_id = fl.id
      LEFT JOIN users u ON pfl.linked_by = u.id
      WHERE pfl.party_id = $1
      ORDER BY pfl.created_at DESC
    `, [req.params.partyId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/parties/:partyId/leagues', requireAuth, async (req, res) => {
  try {
    const { leagueId } = req.body;
    if (!leagueId) return res.status(400).json({ error: 'League ID required' });

    const memberCheck = await pool.query(
      `SELECT 1 FROM party_attendees WHERE party_id = $1 AND user_id = $2
       UNION SELECT 1 FROM parties WHERE id = $1 AND host_id = $2`,
      [req.params.partyId, req.session.userId]
    );
    if (memberCheck.rows.length === 0) return res.status(403).json({ error: 'You must be in this party' });

    await pool.query(
      `INSERT INTO party_fantasy_links (party_id, league_id, linked_by) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [req.params.partyId, leagueId, req.session.userId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/parties/:partyId/leagues/:leagueId', requireAuth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM party_fantasy_links WHERE party_id = $1 AND league_id = $2',
      [req.params.partyId, req.params.leagueId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/parties/:partyId/leaderboard', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ft.*, u.name as owner_name, u.profile_picture, fl.name as league_name
      FROM fantasy_teams ft
      JOIN fantasy_leagues fl ON ft.league_id = fl.id
      JOIN users u ON ft.user_id = u.id
      WHERE ft.league_id IN (SELECT league_id FROM party_fantasy_links WHERE party_id = $1)
        AND ft.user_id IN (
          SELECT user_id FROM party_attendees WHERE party_id = $1
          UNION SELECT host_id FROM parties WHERE id = $1
        )
      ORDER BY ft.points DESC, ft.wins DESC
    `, [req.params.partyId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/parties/:partyId/shared-players', requireAuth, async (req, res) => {
  try {
    const myTeams = await pool.query(`
      SELECT ft.id FROM fantasy_teams ft
      WHERE ft.user_id = $1
        AND ft.league_id IN (SELECT league_id FROM party_fantasy_links WHERE party_id = $2)
    `, [req.session.userId, req.params.partyId]);

    if (myTeams.rows.length === 0) return res.json([]);

    const teamIds = myTeams.rows.map(t => t.id);
    const myPlayers = await pool.query(
      'SELECT player_name FROM fantasy_players WHERE team_id = ANY($1)',
      [teamIds]
    );
    const myPlayerNames = myPlayers.rows.map(p => p.player_name.toLowerCase());
    if (myPlayerNames.length === 0) return res.json([]);

    const sharedResult = await pool.query(`
      SELECT fp.player_name, fp.position, fp.nfl_team, fp.points,
        ft.team_name, u.name as owner_name, u.id as owner_id, u.profile_picture
      FROM fantasy_players fp
      JOIN fantasy_teams ft ON fp.team_id = ft.id
      JOIN users u ON ft.user_id = u.id
      WHERE ft.league_id IN (SELECT league_id FROM party_fantasy_links WHERE party_id = $1)
        AND ft.user_id != $2
        AND ft.user_id IN (
          SELECT user_id FROM party_attendees WHERE party_id = $1
          UNION SELECT host_id FROM parties WHERE id = $1
        )
        AND LOWER(fp.player_name) = ANY($3)
    `, [req.params.partyId, req.session.userId, myPlayerNames]);

    res.json(sharedResult.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
