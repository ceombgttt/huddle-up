import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import pool from '../db.js';

const router = Router();

router.get('/overview', requireAdmin, async (req, res) => {
  try {
    const [
      usersResult,
      partiesResult,
      venuesResult,
      attendeesResult,
      messagesResult,
      friendshipsResult,
      invitationsResult,
      claimsResult,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as total FROM users'),
      pool.query('SELECT COUNT(*) as total FROM parties'),
      pool.query('SELECT COUNT(*) as total FROM venues WHERE verified = true'),
      pool.query('SELECT COUNT(*) as total FROM party_attendees'),
      pool.query('SELECT COUNT(*) as total FROM party_messages'),
      pool.query("SELECT COUNT(*) as total FROM friendships WHERE status = 'accepted'"),
      pool.query('SELECT COUNT(*) as total FROM party_invitations'),
      pool.query("SELECT COUNT(*) as total FROM venue_claims WHERE status = 'pending'"),
    ]);

    const today = new Date();
    const sevenDaysAgo = new Date(today - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(today - 30 * 24 * 60 * 60 * 1000);

    const [
      newUsersWeek,
      newUsersMonth,
      newPartiesWeek,
      newPartiesMonth,
      newMessagesWeek,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as total FROM users WHERE joined_at >= $1', [sevenDaysAgo]),
      pool.query('SELECT COUNT(*) as total FROM users WHERE joined_at >= $1', [thirtyDaysAgo]),
      pool.query('SELECT COUNT(*) as total FROM parties WHERE created_at >= $1', [sevenDaysAgo]),
      pool.query('SELECT COUNT(*) as total FROM parties WHERE created_at >= $1', [thirtyDaysAgo]),
      pool.query('SELECT COUNT(*) as total FROM party_messages WHERE created_at >= $1', [sevenDaysAgo]),
    ]);

    res.json({
      totalUsers: parseInt(usersResult.rows[0].total),
      totalParties: parseInt(partiesResult.rows[0].total),
      totalVenues: parseInt(venuesResult.rows[0].total),
      totalAttendees: parseInt(attendeesResult.rows[0].total),
      totalMessages: parseInt(messagesResult.rows[0].total),
      totalFriendships: parseInt(friendshipsResult.rows[0].total),
      totalInvitations: parseInt(invitationsResult.rows[0].total),
      pendingClaims: parseInt(claimsResult.rows[0].total),
      newUsersWeek: parseInt(newUsersWeek.rows[0].total),
      newUsersMonth: parseInt(newUsersMonth.rows[0].total),
      newPartiesWeek: parseInt(newPartiesWeek.rows[0].total),
      newPartiesMonth: parseInt(newPartiesMonth.rows[0].total),
      newMessagesWeek: parseInt(newMessagesWeek.rows[0].total),
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

router.get('/user-growth', requireAdmin, async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days) || 30, 1), 365);
    const result = await pool.query(`
      SELECT 
        DATE(joined_at) as date,
        COUNT(*) as signups,
        SUM(COUNT(*)) OVER (ORDER BY DATE(joined_at)) as cumulative
      FROM users
      WHERE joined_at >= NOW() - make_interval(days => $1)
      GROUP BY DATE(joined_at)
      ORDER BY date
    `, [days]);
    res.json(result.rows);
  } catch (error) {
    console.error('User growth error:', error);
    res.status(500).json({ error: 'Failed to fetch user growth' });
  }
});

router.get('/party-trends', requireAdmin, async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days) || 30, 1), 365);
    const result = await pool.query(`
      SELECT 
        DATE(p.created_at) as date,
        COUNT(DISTINCT p.id) as parties_created,
        COUNT(DISTINCT pa.user_id) as unique_attendees
      FROM parties p
      LEFT JOIN party_attendees pa ON pa.party_id = p.id
      WHERE p.created_at >= NOW() - make_interval(days => $1)
      GROUP BY DATE(p.created_at)
      ORDER BY date
    `, [days]);
    res.json(result.rows);
  } catch (error) {
    console.error('Party trends error:', error);
    res.status(500).json({ error: 'Failed to fetch party trends' });
  }
});

router.get('/top-sports', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        sport,
        COUNT(*) as party_count,
        COUNT(DISTINCT host_id) as unique_hosts
      FROM parties
      GROUP BY sport
      ORDER BY party_count DESC
    `);

    const attendeeResult = await pool.query(`
      SELECT 
        p.sport,
        COUNT(pa.id) as attendee_count
      FROM parties p
      JOIN party_attendees pa ON pa.party_id = p.id
      GROUP BY p.sport
    `);

    const attendeeMap = {};
    attendeeResult.rows.forEach(r => { attendeeMap[r.sport] = parseInt(r.attendee_count); });

    const sports = result.rows.map(r => ({
      sport: r.sport,
      partyCount: parseInt(r.party_count),
      uniqueHosts: parseInt(r.unique_hosts),
      attendeeCount: attendeeMap[r.sport] || 0,
    }));

    res.json(sports);
  } catch (error) {
    console.error('Top sports error:', error);
    res.status(500).json({ error: 'Failed to fetch top sports' });
  }
});

router.get('/top-cities', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(city, 'Unknown') as city,
        COUNT(*) as party_count,
        COUNT(DISTINCT host_id) as unique_hosts
      FROM parties
      WHERE city IS NOT NULL AND city != ''
      GROUP BY city
      ORDER BY party_count DESC
      LIMIT 20
    `);

    const attendeeResult = await pool.query(`
      SELECT 
        p.city,
        COUNT(pa.id) as attendee_count
      FROM parties p
      JOIN party_attendees pa ON pa.party_id = p.id
      WHERE p.city IS NOT NULL AND p.city != ''
      GROUP BY p.city
    `);

    const attendeeMap = {};
    attendeeResult.rows.forEach(r => { attendeeMap[r.city] = parseInt(r.attendee_count); });

    const cities = result.rows.map(r => ({
      city: r.city,
      partyCount: parseInt(r.party_count),
      uniqueHosts: parseInt(r.unique_hosts),
      attendeeCount: attendeeMap[r.city] || 0,
    }));

    res.json(cities);
  } catch (error) {
    console.error('Top cities error:', error);
    res.status(500).json({ error: 'Failed to fetch top cities' });
  }
});

router.get('/top-teams', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        sport,
        team,
        COUNT(*) as fan_count
      FROM user_favorite_teams
      GROUP BY sport, team
      ORDER BY fan_count DESC
      LIMIT 25
    `);

    res.json(result.rows.map(r => ({
      sport: r.sport,
      team: r.team,
      fanCount: parseInt(r.fan_count),
    })));
  } catch (error) {
    console.error('Top teams error:', error);
    res.status(500).json({ error: 'Failed to fetch top teams' });
  }
});

router.get('/venue-performance', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        v.id, v.name, v.city, v.type, v.featured, v.logo, v.picture,
        COUNT(DISTINCT p.id) as parties_hosted,
        COUNT(DISTINCT pa.user_id) as total_attendees,
        COUNT(DISTINCT pm.id) as total_messages
      FROM venues v
      LEFT JOIN parties p ON LOWER(p.venue_name) = LOWER(v.name)
      LEFT JOIN party_attendees pa ON pa.party_id = p.id
      LEFT JOIN party_messages pm ON pm.party_id = p.id
      WHERE v.verified = true
      GROUP BY v.id, v.name, v.city, v.type, v.featured, v.logo, v.picture
      ORDER BY total_attendees DESC
      LIMIT 20
    `);

    res.json(result.rows.map(r => ({
      id: r.id,
      name: r.name,
      city: r.city,
      type: r.type,
      featured: r.featured,
      logo: r.logo,
      picture: r.picture,
      partiesHosted: parseInt(r.parties_hosted),
      totalAttendees: parseInt(r.total_attendees),
      totalMessages: parseInt(r.total_messages),
    })));
  } catch (error) {
    console.error('Venue performance error:', error);
    res.status(500).json({ error: 'Failed to fetch venue performance' });
  }
});

router.get('/engagement', requireAdmin, async (req, res) => {
  try {
    const [
      usersWithFavorites,
      usersWithProfilePic,
      usersWithFriends,
      usersWithParties,
      chatActiveUsers,
      genderBreakdown,
      ageBreakdown,
    ] = await Promise.all([
      pool.query('SELECT COUNT(DISTINCT user_id) as total FROM user_favorite_teams'),
      pool.query("SELECT COUNT(*) as total FROM users WHERE profile_picture IS NOT NULL AND profile_picture != ''"),
      pool.query("SELECT COUNT(DISTINCT user_id) as total FROM friendships WHERE status = 'accepted'"),
      pool.query('SELECT COUNT(DISTINCT user_id) as total FROM party_attendees'),
      pool.query('SELECT COUNT(DISTINCT user_id) as total FROM party_messages'),
      pool.query(`
        SELECT 
          COALESCE(gender, 'not-specified') as gender,
          COUNT(*) as count
        FROM users
        GROUP BY gender
        ORDER BY count DESC
      `),
      pool.query(`
        SELECT 
          CASE 
            WHEN date_of_birth IS NULL THEN 'Unknown'
            WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) < 25 THEN '21-24'
            WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) < 30 THEN '25-29'
            WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) < 35 THEN '30-34'
            WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) < 40 THEN '35-39'
            WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) < 50 THEN '40-49'
            ELSE '50+'
          END as age_group,
          COUNT(*) as count
        FROM users
        GROUP BY age_group
        ORDER BY age_group
      `),
    ]);

    const totalUsersResult = await pool.query('SELECT COUNT(*) as total FROM users');
    const totalUsers = parseInt(totalUsersResult.rows[0].total);

    res.json({
      totalUsers,
      usersWithFavorites: parseInt(usersWithFavorites.rows[0].total),
      usersWithProfilePic: parseInt(usersWithProfilePic.rows[0].total),
      usersWithFriends: parseInt(usersWithFriends.rows[0].total),
      usersWithParties: parseInt(usersWithParties.rows[0].total),
      chatActiveUsers: parseInt(chatActiveUsers.rows[0].total),
      genderBreakdown: genderBreakdown.rows.map(r => ({ gender: r.gender, count: parseInt(r.count) })),
      ageBreakdown: ageBreakdown.rows.map(r => ({ ageGroup: r.age_group, count: parseInt(r.count) })),
    });
  } catch (error) {
    console.error('Engagement error:', error);
    res.status(500).json({ error: 'Failed to fetch engagement data' });
  }
});

router.get('/recent-activity', requireAdmin, async (req, res) => {
  try {
    const [recentUsers, recentParties, recentMessages] = await Promise.all([
      pool.query(`
        SELECT id, name, email, joined_at, profile_picture, gender
        FROM users
        ORDER BY joined_at DESC
        LIMIT 10
      `),
      pool.query(`
        SELECT p.id, p.title, p.sport, p.city, p.created_at, u.name as host_name,
          (SELECT COUNT(*) FROM party_attendees WHERE party_id = p.id) as attendee_count
        FROM parties p
        JOIN users u ON u.id = p.host_id
        ORDER BY p.created_at DESC
        LIMIT 10
      `),
      pool.query(`
        SELECT pm.message, pm.created_at, u.name as user_name, p.title as party_title
        FROM party_messages pm
        JOIN users u ON u.id = pm.user_id
        JOIN parties p ON p.id = pm.party_id
        ORDER BY pm.created_at DESC
        LIMIT 10
      `),
    ]);

    res.json({
      recentUsers: recentUsers.rows,
      recentParties: recentParties.rows,
      recentMessages: recentMessages.rows,
    });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

router.get('/user-cities', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(user_city, 'Not Set') as city,
        COUNT(*) as user_count
      FROM users
      WHERE user_city IS NOT NULL AND user_city != ''
      GROUP BY user_city
      ORDER BY user_count DESC
      LIMIT 20
    `);
    res.json(result.rows.map(r => ({ city: r.city, userCount: parseInt(r.user_count) })));
  } catch (error) {
    console.error('User cities error:', error);
    res.status(500).json({ error: 'Failed to fetch user cities' });
  }
});

router.get('/hourly-activity', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count
      FROM party_messages
      GROUP BY hour
      ORDER BY hour
    `);
    res.json(result.rows.map(r => ({ hour: parseInt(r.hour), count: parseInt(r.count) })));
  } catch (error) {
    console.error('Hourly activity error:', error);
    res.status(500).json({ error: 'Failed to fetch hourly activity' });
  }
});

export default router;
