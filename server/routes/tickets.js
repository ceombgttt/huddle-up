import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const requireAuth_middleware = (req, res, next) => {
  if (!req.session?.userId) return res.status(401).json({ error: 'Not authenticated' });
  next();
};

// POST /parties/:partyId/tickets/setup - Set up ticketing for a party
router.post('/:partyId/tickets/setup', requireAuth_middleware, async (req, res) => {
  try {
    const { partyId } = req.params;
    const { priceCents, capacity } = req.body;

    // Verify the user is the host of this party
    const partyResult = await pool.query(
      'SELECT host_id FROM parties WHERE id = $1',
      [partyId]
    );

    if (partyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Party not found' });
    }

    if (partyResult.rows[0].host_id !== req.session.userId) {
      return res.status(403).json({ error: 'Only the host can set up ticketing' });
    }

    // Create or update party_tickets record
    const ticketResult = await pool.query(
      `INSERT INTO party_tickets (party_id, price_cents, capacity, enabled)
       VALUES ($1, $2, $3, TRUE)
       ON CONFLICT (party_id) DO UPDATE SET
         price_cents = EXCLUDED.price_cents,
         capacity = EXCLUDED.capacity,
         enabled = TRUE
       RETURNING *`,
      [partyId, priceCents, capacity]
    );

    // Update party's ticket_price_cents
    await pool.query(
      'UPDATE parties SET ticket_price_cents = $1 WHERE id = $2',
      [priceCents, partyId]
    );

    res.json(ticketResult.rows[0]);
  } catch (error) {
    console.error('Setup ticketing error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /parties/:partyId/tickets - Get ticket info for a party
router.get('/:partyId/tickets', async (req, res) => {
  try {
    const { partyId } = req.params;

    // Get party ticket info
    const ticketResult = await pool.query(
      `SELECT pt.price_cents, pt.capacity
       FROM party_tickets pt
       WHERE pt.party_id = $1`,
      [partyId]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticketing not set up for this party' });
    }

    const ticketInfo = ticketResult.rows[0];

    // Count tickets sold
    const soldResult = await pool.query(
      `SELECT COUNT(*) as tickets_sold
       FROM ticket_purchases
       WHERE party_id = $1 AND status = 'completed'`,
      [partyId]
    );

    const ticketsSold = parseInt(soldResult.rows[0].tickets_sold || 0);

    // Check if current user has purchased a ticket
    let hasUserPurchased = false;
    if (req.session?.userId) {
      const purchaseResult = await pool.query(
        `SELECT id FROM ticket_purchases
         WHERE party_id = $1 AND user_id = $2 AND status = 'completed'`,
        [partyId, req.session.userId]
      );
      hasUserPurchased = purchaseResult.rows.length > 0;
    }

    res.json({
      price: ticketInfo.price_cents,
      capacity: ticketInfo.capacity,
      ticketsSold,
      hasUserPurchased,
      available: ticketInfo.capacity - ticketsSold
    });
  } catch (error) {
    console.error('Get ticket info error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /parties/:partyId/tickets/purchase - Purchase a ticket
router.post('/:partyId/tickets/purchase', requireAuth_middleware, async (req, res) => {
  try {
    const { partyId } = req.params;
    const userId = req.session.userId;

    // Get ticket info
    const ticketResult = await pool.query(
      `SELECT price_cents, capacity FROM party_tickets WHERE party_id = $1`,
      [partyId]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticketing not set up for this party' });
    }

    const ticketInfo = ticketResult.rows[0];

    // Check if user already has a ticket
    const existingPurchase = await pool.query(
      `SELECT id FROM ticket_purchases
       WHERE party_id = $1 AND user_id = $2 AND status = 'completed'`,
      [partyId, userId]
    );

    if (existingPurchase.rows.length > 0) {
      return res.status(400).json({ error: 'User already has a ticket for this party' });
    }

    // Check capacity
    const soldResult = await pool.query(
      `SELECT COUNT(*) as tickets_sold FROM ticket_purchases
       WHERE party_id = $1 AND status = 'completed'`,
      [partyId]
    );

    const ticketsSold = parseInt(soldResult.rows[0].tickets_sold || 0);

    if (ticketsSold >= ticketInfo.capacity) {
      return res.status(400).json({ error: 'Party is at capacity' });
    }

    // Create ticket purchase (simplified, no actual Stripe for MVP)
    const purchaseResult = await pool.query(
      `INSERT INTO ticket_purchases (party_id, user_id, amount_cents, status)
       VALUES ($1, $2, $3, 'completed')
       RETURNING *`,
      [partyId, userId, ticketInfo.price_cents]
    );

    res.json(purchaseResult.rows[0]);
  } catch (error) {
    console.error('Purchase ticket error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /my-tickets - List all tickets purchased by the current user
router.get('/my-tickets', requireAuth_middleware, async (req, res) => {
  try {
    const userId = req.session.userId;

    const ticketsResult = await pool.query(
      `SELECT 
        tp.id, tp.party_id, tp.amount_cents, tp.status, tp.created_at,
        p.title, p.game_id, p.sport, p.home_team, p.away_team, p.game_time,
        p.venue_name, p.venue_address, p.city, p.host_id,
        u.name as host_name, u.email as host_email
       FROM ticket_purchases tp
       JOIN parties p ON tp.party_id = p.id
       JOIN users u ON p.host_id = u.id
       WHERE tp.user_id = $1 AND tp.status = 'completed'
       ORDER BY tp.created_at DESC`,
      [userId]
    );

    const tickets = ticketsResult.rows.map(t => ({
      id: t.id,
      partyId: t.party_id,
      amountCents: t.amount_cents,
      status: t.status,
      createdAt: t.created_at,
      party: {
        id: t.party_id,
        title: t.title,
        gameId: t.game_id,
        sport: t.sport,
        homeTeam: t.home_team,
        awayTeam: t.away_team,
        gameTime: t.game_time,
        venueName: t.venue_name,
        venueAddress: t.venue_address,
        city: t.city,
        hostId: t.host_id,
        hostName: t.host_name,
        hostEmail: t.host_email
      }
    }));

    res.json({ tickets });
  } catch (error) {
    console.error('Get my tickets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /parties/:partyId/promote - Create a promoted party listing
router.post('/:partyId/promote', requireAuth_middleware, async (req, res) => {
  try {
    const { partyId } = req.params;
    const { tier, durationDays } = req.body;
    const userId = req.session.userId;

    // Get party to check host and get venue info
    const partyResult = await pool.query(
      `SELECT p.host_id, p.venue_name, p.city
       FROM parties p
       WHERE p.id = $1`,
      [partyId]
    );

    if (partyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Party not found' });
    }

    const party = partyResult.rows[0];

    // Check if user is host
    if (party.host_id !== userId) {
      // Check if user is venue owner
      const venueResult = await pool.query(
        `SELECT id FROM venues WHERE claimed_by = $1 AND LOWER(name) = LOWER($2)`,
        [userId, party.venue_name]
      );

      if (venueResult.rows.length === 0) {
        return res.status(403).json({ error: 'Only the host or venue owner can create a promotion' });
      }
    }

    // Get or create venue_id
    let venueId = null;
    const venueCheckResult = await pool.query(
      `SELECT id FROM venues WHERE LOWER(name) = LOWER($1) AND LOWER(city) = LOWER($2)`,
      [party.venue_name, party.city]
    );

    if (venueCheckResult.rows.length > 0) {
      venueId = venueCheckResult.rows[0].id;
    }

    // Calculate end_at
    const endAt = new Date();
    endAt.setDate(endAt.getDate() + durationDays);

    // Create promoted_parties record
    const promoteResult = await pool.query(
      `INSERT INTO promoted_parties (party_id, venue_id, tier, end_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (party_id) DO UPDATE SET
         tier = EXCLUDED.tier,
         end_at = EXCLUDED.end_at
       RETURNING *`,
      [partyId, venueId, tier || 'standard', endAt]
    );

    // Set is_promoted on the party
    await pool.query(
      'UPDATE parties SET is_promoted = TRUE WHERE id = $1',
      [partyId]
    );

    res.json(promoteResult.rows[0]);
  } catch (error) {
    console.error('Create promotion error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /promoted - List all currently active promoted parties
router.get('/promoted', async (req, res) => {
  try {
    const promotedResult = await pool.query(
      `SELECT 
        pp.id, pp.party_id, pp.tier, pp.start_at, pp.end_at,
        p.title, p.game_id, p.sport, p.home_team, p.away_team, p.game_time,
        p.venue_name, p.venue_address, p.city, p.host_id,
        u.name as host_name, u.email as host_email
       FROM promoted_parties pp
       JOIN parties p ON pp.party_id = p.id
       JOIN users u ON p.host_id = u.id
       WHERE pp.end_at > NOW()
       ORDER BY pp.start_at DESC`,
      []
    );

    const promoted = promotedResult.rows.map(p => ({
      id: p.id,
      partyId: p.party_id,
      tier: p.tier,
      startAt: p.start_at,
      endAt: p.end_at,
      party: {
        id: p.party_id,
        title: p.title,
        gameId: p.game_id,
        sport: p.sport,
        homeTeam: p.home_team,
        awayTeam: p.away_team,
        gameTime: p.game_time,
        venueName: p.venue_name,
        venueAddress: p.venue_address,
        city: p.city,
        hostId: p.host_id,
        hostName: p.host_name,
        hostEmail: p.host_email
      }
    }));

    res.json(promoted);
  } catch (error) {
    console.error('Get promoted parties error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /parties/:partyId/promote - Cancel a promotion
router.delete('/:partyId/promote', requireAuth_middleware, async (req, res) => {
  try {
    const { partyId } = req.params;
    const userId = req.session.userId;

    // Check if user is the host
    const partyResult = await pool.query(
      'SELECT host_id FROM parties WHERE id = $1',
      [partyId]
    );

    if (partyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Party not found' });
    }

    if (partyResult.rows[0].host_id !== userId) {
      return res.status(403).json({ error: 'Only the host can cancel a promotion' });
    }

    // Check if promotion exists
    const promoteResult = await pool.query(
      'SELECT id FROM promoted_parties WHERE party_id = $1',
      [partyId]
    );

    if (promoteResult.rows.length === 0) {
      return res.status(404).json({ error: 'No active promotion for this party' });
    }

    // Delete the promotion
    await pool.query(
      'DELETE FROM promoted_parties WHERE party_id = $1',
      [partyId]
    );

    // Set is_promoted to false on the party
    await pool.query(
      'UPDATE parties SET is_promoted = FALSE WHERE id = $1',
      [partyId]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('Delete promotion error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
