import { Router } from 'express';
import pool from '../db.js';

const router = Router();

const requireAuth = (req, res, next) => {
  if (!req.session?.userId) return res.status(401).json({ error: 'Not authenticated' });
  next();
};

// POST /parties/:partyId/reviews - Create or update a review
router.post('/parties/:partyId/reviews', requireAuth, async (req, res) => {
  try {
    const { partyId } = req.params;
    const { atmosphere, food, crowdEnergy, overall, comment } = req.body;
    const userId = req.session.userId;

    // Validate ratings are 1-5
    const ratings = { atmosphere, food, crowdEnergy, overall };
    for (const [key, value] of Object.entries(ratings)) {
      if (typeof value !== 'number' || value < 1 || value > 5) {
        return res.status(400).json({ error: `${key} must be a number between 1 and 5` });
      }
    }

    // Check party membership (must be attendee or host)
    const memberCheck = await pool.query(
      'SELECT 1 FROM party_attendees WHERE party_id = $1 AND user_id = $2 UNION SELECT 1 FROM parties WHERE id = $1 AND host_id = $2',
      [partyId, userId]
    );
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You must be an attendee or host of this party to leave a review' });
    }

    // Check if party exists
    const partyCheck = await pool.query('SELECT id FROM parties WHERE id = $1', [partyId]);
    if (partyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Party not found' });
    }

    // Use UPSERT (INSERT ... ON CONFLICT) to create or update
    const result = await pool.query(
      `INSERT INTO party_reviews (party_id, user_id, atmosphere, food, crowd_energy, overall, comment)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (party_id, user_id) DO UPDATE SET
         atmosphere = $3,
         food = $4,
         crowd_energy = $5,
         overall = $6,
         comment = $7,
         created_at = NOW()
       RETURNING id, party_id, user_id, atmosphere, food, crowd_energy, overall, comment, created_at`,
      [partyId, userId, atmosphere, food, crowdEnergy, overall, comment || null]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Post review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// GET /parties/:partyId/reviews - List all reviews with user info
router.get('/parties/:partyId/reviews', async (req, res) => {
  try {
    const { partyId } = req.params;

    // Check if party exists
    const partyCheck = await pool.query('SELECT id FROM parties WHERE id = $1', [partyId]);
    if (partyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Party not found' });
    }

    const result = await pool.query(
      `SELECT 
         pr.id, pr.party_id, pr.user_id, 
         pr.atmosphere, pr.food, pr.crowd_energy, pr.overall,
         pr.comment, pr.created_at,
         u.name as user_name, u.profile_picture
       FROM party_reviews pr
       JOIN users u ON pr.user_id = u.id
       WHERE pr.party_id = $1
       ORDER BY pr.created_at DESC`,
      [partyId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to load reviews' });
  }
});

// GET /parties/:partyId/reviews/summary - Get average ratings and count
router.get('/parties/:partyId/reviews/summary', async (req, res) => {
  try {
    const { partyId } = req.params;

    // Check if party exists
    const partyCheck = await pool.query('SELECT id FROM parties WHERE id = $1', [partyId]);
    if (partyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Party not found' });
    }

    const result = await pool.query(
      `SELECT 
         COUNT(*) as total_reviews,
         ROUND(AVG(atmosphere)::numeric, 2) as avg_atmosphere,
         ROUND(AVG(food)::numeric, 2) as avg_food,
         ROUND(AVG(crowd_energy)::numeric, 2) as avg_crowd_energy,
         ROUND(AVG(overall)::numeric, 2) as avg_overall
       FROM party_reviews
       WHERE party_id = $1`,
      [partyId]
    );

    const summary = result.rows[0];
    res.json({
      total_reviews: parseInt(summary.total_reviews),
      avg_atmosphere: summary.avg_atmosphere ? parseFloat(summary.avg_atmosphere) : null,
      avg_food: summary.avg_food ? parseFloat(summary.avg_food) : null,
      avg_crowd_energy: summary.avg_crowd_energy ? parseFloat(summary.avg_crowd_energy) : null,
      avg_overall: summary.avg_overall ? parseFloat(summary.avg_overall) : null
    });
  } catch (error) {
    console.error('Get review summary error:', error);
    res.status(500).json({ error: 'Failed to load review summary' });
  }
});

// DELETE /parties/:partyId/reviews - Delete own review
router.delete('/parties/:partyId/reviews', requireAuth, async (req, res) => {
  try {
    const { partyId } = req.params;
    const userId = req.session.userId;

    // Check if review exists and belongs to user
    const reviewCheck = await pool.query(
      'SELECT id FROM party_reviews WHERE party_id = $1 AND user_id = $2',
      [partyId, userId]
    );
    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Delete the review
    await pool.query(
      'DELETE FROM party_reviews WHERE party_id = $1 AND user_id = $2',
      [partyId, userId]
    );

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

export default router;
