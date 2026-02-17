import { Router } from 'express';
import pool from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.*, u.email as claimed_by_email,
        (SELECT COUNT(*) FROM parties WHERE venue_name = v.name) as total_parties,
        (SELECT COUNT(DISTINCT pa.user_id) FROM party_attendees pa JOIN parties p ON pa.party_id = p.id WHERE p.venue_name = v.name) as total_fans
      FROM venues v
      LEFT JOIN users u ON v.claimed_by = u.id
      ORDER BY v.featured DESC, v.name
    `);

    const venues = result.rows.map(v => ({
      id: v.id,
      name: v.name,
      address: v.address,
      type: v.type,
      verified: v.verified,
      featured: v.featured,
      claimedBy: v.claimed_by_email,
      phone: v.phone,
      website: v.website,
      city: v.city,
      capacity: v.capacity,
      description: v.description,
      logo: v.logo,
      picture: v.picture,
      totalParties: parseInt(v.total_parties),
      totalFans: parseInt(v.total_fans)
    }));

    res.json(venues);
  } catch (error) {
    console.error('Get venues error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/claims', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT vc.*, u.name as submitted_by_name, u.email as submitted_by_email
      FROM venue_claims vc
      JOIN users u ON vc.submitted_by = u.id
      ORDER BY vc.submitted_at DESC
    `);

    const claims = result.rows.map(c => ({
      id: c.id,
      venueName: c.venue_name,
      address: c.address,
      venueType: c.venue_type,
      phone: c.phone,
      website: c.website,
      proofDocument: c.proof_document,
      submittedBy: c.submitted_by_email,
      submittedByName: c.submitted_by_name,
      status: c.status,
      submittedAt: c.submitted_at
    }));

    res.json(claims);
  } catch (error) {
    console.error('Get claims error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/claims', requireAuth, async (req, res) => {
  try {
    const { venueName, address, venueType, phone, website, proofDocument } = req.body;

    const result = await pool.query(
      `INSERT INTO venue_claims (venue_name, address, venue_type, phone, website, proof_document, submitted_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [venueName, address, venueType || 'Sports Bar', phone, website, proofDocument, req.session.userId]
    );

    res.json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Submit claim error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/claims/:id/approve', requireAdmin, async (req, res) => {
  try {
    const claim = await pool.query('SELECT * FROM venue_claims WHERE id = $1', [req.params.id]);
    if (claim.rows.length === 0) return res.status(404).json({ error: 'Claim not found' });

    const c = claim.rows[0];
    await pool.query(
      `INSERT INTO venues (name, address, type, verified, featured, claimed_by, phone, website)
       VALUES ($1, $2, $3, TRUE, FALSE, $4, $5, $6)`,
      [c.venue_name, c.address, c.venue_type, c.submitted_by, c.phone, c.website]
    );

    await pool.query(
      "UPDATE venue_claims SET status = 'approved', decided_at = NOW() WHERE id = $1",
      [req.params.id]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('Approve claim error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/me', requireAuth, async (req, res) => {
  try {
    const venue = await pool.query('SELECT * FROM venues WHERE claimed_by = $1', [req.session.userId]);
    if (venue.rows.length === 0) return res.status(404).json({ error: 'No venue found for this user' });

    const { name, address, city, type, phone, website, capacity, description, logo, picture } = req.body;
    const v = venue.rows[0];

    if (!name || !address) return res.status(400).json({ error: 'Business name and address are required' });

    await pool.query(
      `UPDATE venues SET
        name = $1, address = $2, city = $3, type = $4,
        phone = $5, website = $6, capacity = $7, description = $8,
        logo = $9, picture = $10
       WHERE id = $11`,
      [
        name,
        address,
        city !== undefined ? city : v.city,
        type || v.type,
        phone !== undefined ? phone : v.phone,
        website !== undefined ? website : v.website,
        capacity !== undefined ? capacity : v.capacity,
        description !== undefined ? description : v.description,
        logo !== undefined ? logo : v.logo,
        picture !== undefined ? picture : v.picture,
        v.id
      ]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('Update venue error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const venue = await pool.query('SELECT * FROM venues WHERE id = $1', [req.params.id]);
    if (venue.rows.length === 0) return res.status(404).json({ error: 'Venue not found' });

    const { name, address, city, type, phone, website, capacity, description, featured, logo, picture } = req.body;
    const v = venue.rows[0];

    if (!name || !address) return res.status(400).json({ error: 'Business name and address are required' });

    await pool.query(
      `UPDATE venues SET
        name = $1, address = $2, city = $3, type = $4,
        phone = $5, website = $6, capacity = $7, description = $8, featured = $9,
        logo = $10, picture = $11
       WHERE id = $12`,
      [
        name,
        address,
        city !== undefined ? city : v.city,
        type || v.type,
        phone !== undefined ? phone : v.phone,
        website !== undefined ? website : v.website,
        capacity !== undefined ? capacity : v.capacity,
        description !== undefined ? description : v.description,
        featured !== undefined ? featured : v.featured,
        logo !== undefined ? logo : v.logo,
        picture !== undefined ? picture : v.picture,
        v.id
      ]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('Admin update venue error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/claims/:id/reject', requireAdmin, async (req, res) => {
  try {
    await pool.query(
      "UPDATE venue_claims SET status = 'rejected', decided_at = NOW() WHERE id = $1",
      [req.params.id]
    );
    res.json({ ok: true });
  } catch (error) {
    console.error('Reject claim error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
