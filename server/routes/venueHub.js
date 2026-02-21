import express from 'express';
import pool from '../db.js';

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
  next();
}

async function requireVenueOwner(req, res, next) {
  try {
    const result = await pool.query('SELECT id FROM venues WHERE claimed_by = $1', [req.session.userId]);
    if (result.rows.length === 0) return res.status(403).json({ error: 'Not a venue owner' });
    req.venueId = result.rows[0].id;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

router.get('/promotions', requireAuth, requireVenueOwner, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM venue_promotions WHERE venue_id = $1 ORDER BY created_at DESC',
      [req.venueId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get promotions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/promotions', requireAuth, requireVenueOwner, async (req, res) => {
  try {
    const { title, description, sport, gameDate, homeTeam, awayTeam, specials, expiresAt } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const result = await pool.query(
      `INSERT INTO venue_promotions (venue_id, title, description, sport, game_date, home_team, away_team, specials, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [req.venueId, title, description, sport, gameDate || null, homeTeam, awayTeam, specials, expiresAt || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Create promotion error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/promotions/:id', requireAuth, requireVenueOwner, async (req, res) => {
  try {
    const { title, description, sport, gameDate, homeTeam, awayTeam, specials, status, expiresAt } = req.body;
    const result = await pool.query(
      `UPDATE venue_promotions SET title = COALESCE($1, title), description = COALESCE($2, description),
       sport = COALESCE($3, sport), game_date = $4, home_team = COALESCE($5, home_team),
       away_team = COALESCE($6, away_team), specials = COALESCE($7, specials),
       status = COALESCE($8, status), expires_at = $9
       WHERE id = $10 AND venue_id = $11 RETURNING *`,
      [title, description, sport, gameDate || null, homeTeam, awayTeam, specials, status, expiresAt || null, req.params.id, req.venueId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Promotion not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update promotion error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/promotions/:id', requireAuth, requireVenueOwner, async (req, res) => {
  try {
    await pool.query('DELETE FROM venue_promotions WHERE id = $1 AND venue_id = $2', [req.params.id, req.venueId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete promotion error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/deals', requireAuth, requireVenueOwner, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM venue_deals WHERE venue_id = $1 ORDER BY created_at DESC',
      [req.venueId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get deals error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/deals', requireAuth, requireVenueOwner, async (req, res) => {
  try {
    const { title, description, dealType, validFrom, validUntil, terms, recurring, recurringDays } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'Title and description are required' });
    const result = await pool.query(
      `INSERT INTO venue_deals (venue_id, title, description, deal_type, valid_from, valid_until, terms, recurring, recurring_days)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [req.venueId, title, description, dealType || 'special', validFrom || new Date(), validUntil || null, terms, recurring || false, recurringDays || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Create deal error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/deals/:id', requireAuth, requireVenueOwner, async (req, res) => {
  try {
    const { title, description, dealType, validFrom, validUntil, terms, recurring, recurringDays, active } = req.body;
    const result = await pool.query(
      `UPDATE venue_deals SET title = COALESCE($1, title), description = COALESCE($2, description),
       deal_type = COALESCE($3, deal_type), valid_from = COALESCE($4, valid_from),
       valid_until = $5, terms = COALESCE($6, terms), recurring = COALESCE($7, recurring),
       recurring_days = COALESCE($8, recurring_days), active = COALESCE($9, active)
       WHERE id = $10 AND venue_id = $11 RETURNING *`,
      [title, description, dealType, validFrom, validUntil || null, terms, recurring, recurringDays, active, req.params.id, req.venueId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Deal not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update deal error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/deals/:id', requireAuth, requireVenueOwner, async (req, res) => {
  try {
    await pool.query('DELETE FROM venue_deals WHERE id = $1 AND venue_id = $2', [req.params.id, req.venueId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete deal error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/venue/:venueId/promotions', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM venue_promotions WHERE venue_id = $1 AND status = 'active'
       AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY game_date ASC NULLS LAST`,
      [req.params.venueId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get public promotions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/venue/:venueId/deals', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM venue_deals WHERE venue_id = $1 AND active = TRUE
       AND (valid_until IS NULL OR valid_until > NOW()) ORDER BY created_at DESC`,
      [req.params.venueId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get public deals error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
