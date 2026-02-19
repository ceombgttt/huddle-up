import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Helper function to compute badges
const computeBadges = (stats) => {
  const badges = [];
  
  if (stats.parties_hosted >= 1) {
    badges.push({ name: 'Party Starter', icon: '🎉', earned: true });
  }
  if (stats.parties_attended >= 5) {
    badges.push({ name: 'Social Butterfly', icon: '🦋', earned: true });
  }
  if (stats.parties_attended >= 10) {
    badges.push({ name: 'Regular', icon: '🔥', earned: true });
  }
  if (stats.parties_attended >= 25) {
    badges.push({ name: 'Superfan', icon: '⭐', earned: true });
  }
  if (stats.reviews_given >= 5) {
    badges.push({ name: 'Critic', icon: '📝', earned: true });
  }
  if (stats.friends_count >= 10) {
    badges.push({ name: 'Popular', icon: '👥', earned: true });
  }
  if (stats.total_points >= 1000) {
    badges.push({ name: 'VIP', icon: '💎', earned: true });
  }
  if (stats.is_pioneer) {
    badges.push({ name: 'Pioneer', icon: '🚀', earned: true });
  }
  
  return badges;
};

// Helper function to calculate fan score
const calculateFanScore = (stats) => {
  return (stats.parties_hosted * 10) + 
         (stats.parties_attended * 5) + 
         (stats.reviews_given * 3) + 
         (stats.friends_count * 2) + 
         (stats.total_points / 10);
};

// Helper function to get user stats
const getUserStats = async (userId) => {
  const statsQuery = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM parties WHERE host_id = $1) as parties_hosted,
      (SELECT COUNT(*) FROM party_attendees WHERE user_id = $1) as parties_attended,
      (SELECT COUNT(*) FROM party_reviews WHERE user_id = $1) as reviews_given,
      (SELECT COUNT(*) FROM friendships 
       WHERE ((user_id = $1 OR friend_id = $1) AND status = 'accepted')) as friends_count,
      COALESCE((SELECT total_points FROM user_points WHERE user_id = $1), 0) as total_points,
      (SELECT joined_at FROM users WHERE id = $1) as created_at,
      (EXTRACT(DAY FROM (NOW() - (SELECT joined_at FROM users WHERE id = $1)))) > 180 as is_pioneer
  `, [userId]);
  
  return statsQuery.rows[0];
};

// Helper function to get favorite teams
const getFavoriteTeams = async (userId) => {
  const teamsQuery = await pool.query(
    'SELECT sport, team FROM user_favorite_teams WHERE user_id = $1',
    [userId]
  );
  
  const favoriteTeams = {};
  teamsQuery.rows.forEach(row => {
    favoriteTeams[row.sport] = row.team;
  });
  return favoriteTeams;
};

// GET /users/:userId - Get public profile
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user profile
    const userQuery = await pool.query(
      'SELECT id, name, profile_picture, joined_at, bio FROM users WHERE id = $1',
      [userId]
    );
    
    if (userQuery.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userQuery.rows[0];
    
    // Get stats
    const stats = await getUserStats(userId);
    
    // Get favorite teams
    const favoriteTeams = await getFavoriteTeams(userId);
    
    // Calculate fan score
    const fanScore = calculateFanScore(stats);
    
    // Compute badges
    const badges = computeBadges(stats);
    
    res.json({
      id: user.id,
      name: user.name,
      profilePicture: user.profile_picture,
      createdAt: user.joined_at,
      bio: user.bio || null,
      favoriteTeams: favoriteTeams,
      partiesHosted: parseInt(stats.parties_hosted),
      partiesAttended: parseInt(stats.parties_attended),
      reviewsGiven: parseInt(stats.reviews_given),
      friendsCount: parseInt(stats.friends_count),
      totalPoints: parseInt(stats.total_points),
      fanScore: Math.round(fanScore * 100) / 100,
      badges
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

// GET /users/:userId/activity - Get recent activity
router.get('/users/:userId/activity', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user exists
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get recent activity - last 20 items from various activities
    const activityQuery = await pool.query(`
      SELECT * FROM (
        -- Parties hosted
        SELECT 
          p.id,
          'party_hosted' as type,
          'Hosted a party: ' || p.title as description,
          p.created_at as date
        FROM parties p
        WHERE p.host_id = $1
        
        UNION ALL
        
        -- Parties attended
        SELECT 
          pa.party_id as id,
          'party_attended' as type,
          'Attended a party: ' || p.title as description,
          pa.joined_at as date
        FROM party_attendees pa
        JOIN parties p ON pa.party_id = p.id
        WHERE pa.user_id = $1
        
        UNION ALL
        
        -- Reviews given
        SELECT 
          pr.id,
          'review_given' as type,
          'Gave a review for a party: ' || p.title as description,
          pr.created_at as date
        FROM party_reviews pr
        JOIN parties p ON pr.party_id = p.id
        WHERE pr.user_id = $1
      ) activity
      ORDER BY date DESC
      LIMIT 20
    `, [userId]);
    
    res.json({ activity: activityQuery.rows.map(row => ({
      id: row.id,
      type: row.type,
      description: row.description,
      date: row.date
    })) });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to load activity' });
  }
});

// GET /me/stats - Get own detailed stats
router.get('/me/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Get user profile with additional private info
    const userQuery = await pool.query(
      'SELECT id, name, profile_picture, joined_at, bio, email, subscription_tier FROM users WHERE id = $1',
      [userId]
    );
    
    if (userQuery.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userQuery.rows[0];
    
    // Get stats
    const stats = await getUserStats(userId);
    
    // Get favorite teams
    const favoriteTeams = await getFavoriteTeams(userId);
    
    // Calculate fan score
    const fanScore = calculateFanScore(stats);
    
    // Compute badges
    const badges = computeBadges(stats);
    
    res.json({
      id: user.id,
      name: user.name,
      profile_picture: user.profile_picture,
      created_at: user.joined_at,
      bio: user.bio || null,
      favorite_teams: favoriteTeams,
      stats: {
        parties_hosted: parseInt(stats.parties_hosted),
        parties_attended: parseInt(stats.parties_attended),
        reviews_given: parseInt(stats.reviews_given),
        friends_count: parseInt(stats.friends_count),
        total_points: parseInt(stats.total_points)
      },
      fan_score: Math.round(fanScore * 100) / 100,
      badges,
      // Additional private info
      email: user.email,
      subscription_tier: user.subscription_tier
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

export default router;
