import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

async function getVenueForUser(userId) {
  const result = await pool.query('SELECT id FROM venues WHERE claimed_by = $1', [userId]);
  return result.rows[0] || null;
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const venue = await getVenueForUser(req.session.userId);
    if (!venue) return res.status(403).json({ error: 'You must own a venue to manage sponsors' });

    const result = await pool.query(
      `SELECT * FROM sponsors WHERE venue_id = $1 ORDER BY created_at DESC`,
      [venue.id]
    );

    const sponsors = result.rows.map(s => ({
      id: s.id,
      name: s.name,
      contactName: s.contact_name,
      contactEmail: s.contact_email,
      contactPhone: s.contact_phone,
      logo: s.logo,
      website: s.website,
      notes: s.notes,
      amountPaid: parseFloat(s.amount_paid || 0),
      paymentFrequency: s.payment_frequency,
      startDate: s.start_date,
      endDate: s.end_date,
      status: s.status,
      createdAt: s.created_at
    }));

    res.json(sponsors);
  } catch (error) {
    console.error('Get sponsors error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const venue = await getVenueForUser(req.session.userId);
    if (!venue) return res.status(403).json({ error: 'You must own a venue to add sponsors' });

    const { name, contactName, contactEmail, contactPhone, logo, website, notes, amountPaid, paymentFrequency, startDate, endDate, status } = req.body;

    if (!name) return res.status(400).json({ error: 'Sponsor name is required' });

    const validFrequencies = ['one-time', 'monthly', 'quarterly', 'yearly'];
    const freq = validFrequencies.includes(paymentFrequency) ? paymentFrequency : 'one-time';
    const validStatuses = ['active', 'paused', 'ended'];
    const stat = validStatuses.includes(status) ? status : 'active';
    const amount = parseFloat(amountPaid) || 0;

    const result = await pool.query(
      `INSERT INTO sponsors (venue_id, name, contact_name, contact_email, contact_phone, logo, website, notes, amount_paid, payment_frequency, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
      [venue.id, name, contactName || null, contactEmail || null, contactPhone || null, logo || null, website || null, notes || null, amount, freq, startDate || null, endDate || null, stat]
    );

    res.json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Create sponsor error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const venue = await getVenueForUser(req.session.userId);
    if (!venue) return res.status(403).json({ error: 'You must own a venue to edit sponsors' });

    const sponsor = await pool.query('SELECT * FROM sponsors WHERE id = $1 AND venue_id = $2', [req.params.id, venue.id]);
    if (sponsor.rows.length === 0) return res.status(404).json({ error: 'Sponsor not found' });

    const { name, contactName, contactEmail, contactPhone, logo, website, notes, amountPaid, paymentFrequency, startDate, endDate, status } = req.body;

    if (!name) return res.status(400).json({ error: 'Sponsor name is required' });

    const validFrequencies = ['one-time', 'monthly', 'quarterly', 'yearly'];
    const freq = validFrequencies.includes(paymentFrequency) ? paymentFrequency : 'one-time';
    const validStatuses = ['active', 'paused', 'ended'];
    const stat = validStatuses.includes(status) ? status : 'active';
    const amount = parseFloat(amountPaid) || 0;

    await pool.query(
      `UPDATE sponsors SET
        name = $1, contact_name = $2, contact_email = $3, contact_phone = $4,
        logo = $5, website = $6, notes = $7, amount_paid = $8,
        payment_frequency = $9, start_date = $10, end_date = $11, status = $12
       WHERE id = $13 AND venue_id = $14`,
      [name, contactName || null, contactEmail || null, contactPhone || null, logo || null, website || null, notes || null, amount, freq, startDate || null, endDate || null, stat, req.params.id, venue.id]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('Update sponsor error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const venue = await getVenueForUser(req.session.userId);
    if (!venue) return res.status(403).json({ error: 'You must own a venue to delete sponsors' });

    const result = await pool.query('DELETE FROM sponsors WHERE id = $1 AND venue_id = $2', [req.params.id, venue.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Sponsor not found' });

    res.json({ ok: true });
  } catch (error) {
    console.error('Delete sponsor error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
