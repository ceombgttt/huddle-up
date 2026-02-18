import { Router } from 'express';
import pool from '../db.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

const MAX_SPONSOR_SLOTS = 20;

const mapSponsor = (s) => ({
  id: s.id,
  name: s.name,
  contactName: s.contact_name,
  contactEmail: s.contact_email,
  contactPhone: s.contact_phone,
  logo: s.logo,
  website: s.website,
  notes: s.notes,
  tagline: s.tagline,
  targetSports: s.target_sports || [],
  userId: s.user_id,
  amountPaid: parseFloat(s.amount_paid || 0),
  paymentFrequency: s.payment_frequency,
  startDate: s.start_date,
  endDate: s.end_date,
  status: s.status,
  createdAt: s.created_at
});

router.get('/', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM sponsors ORDER BY created_at DESC`
    );
    res.json(result.rows.map(mapSponsor));
  } catch (error) {
    console.error('Get sponsors error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, contactName, contactEmail, contactPhone, logo, website, notes, amountPaid, paymentFrequency, startDate, endDate, status } = req.body;

    if (!name) return res.status(400).json({ error: 'Sponsor name is required' });

    const validFrequencies = ['one-time', 'monthly', 'quarterly', 'yearly'];
    const freq = validFrequencies.includes(paymentFrequency) ? paymentFrequency : 'one-time';
    const validStatuses = ['active', 'paused', 'ended'];
    const stat = validStatuses.includes(status) ? status : 'active';
    const amount = parseFloat(amountPaid) || 0;

    const result = await pool.query(
      `INSERT INTO sponsors (name, contact_name, contact_email, contact_phone, logo, website, notes, amount_paid, payment_frequency, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
      [name, contactName || null, contactEmail || null, contactPhone || null, logo || null, website || null, notes || null, amount, freq, startDate || null, endDate || null, stat]
    );

    res.json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Create sponsor error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const sponsor = await pool.query('SELECT * FROM sponsors WHERE id = $1', [req.params.id]);
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
       WHERE id = $13`,
      [name, contactName || null, contactEmail || null, contactPhone || null, logo || null, website || null, notes || null, amount, freq, startDate || null, endDate || null, stat, req.params.id]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('Update sponsor error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM sponsors WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Sponsor not found' });

    res.json({ ok: true });
  } catch (error) {
    console.error('Delete sponsor error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sponsors WHERE user_id = $1', [req.session.userId]);
    if (result.rows.length === 0) return res.json(null);
    res.json(mapSponsor(result.rows[0]));
  } catch (error) {
    console.error('Get my sponsor error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/me', requireAuth, async (req, res) => {
  try {
    const userCheck = await pool.query('SELECT subscription_tier FROM users WHERE id = $1', [req.session.userId]);
    if (userCheck.rows[0]?.subscription_tier !== 'sponsor') {
      return res.status(403).json({ error: 'Sponsor subscription required' });
    }

    const sponsor = await pool.query('SELECT * FROM sponsors WHERE user_id = $1', [req.session.userId]);
    if (sponsor.rows.length === 0) return res.status(404).json({ error: 'No sponsor record found' });

    const { name, tagline, logo, website, targetSports } = req.body;
    if (!name) return res.status(400).json({ error: 'Sponsor name is required' });

    const sports = Array.isArray(targetSports) ? targetSports : [];

    await pool.query(
      `UPDATE sponsors SET name = $1, tagline = $2, logo = $3, website = $4, target_sports = $5 WHERE user_id = $6`,
      [name, tagline || null, logo || null, website || null, sports, req.session.userId]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('Update my sponsor error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/banners', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT name, tagline, logo, website, target_sports FROM sponsors WHERE status = 'active' ORDER BY created_at DESC`
    );
    res.json(result.rows.map(s => ({
      name: s.name,
      tagline: s.tagline || '',
      logo: s.logo,
      url: s.website,
      targetSports: s.target_sports || []
    })));
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/slots', async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM sponsors WHERE status = 'active'");
    const activeCount = parseInt(result.rows[0].count);
    res.json({ total: MAX_SPONSOR_SLOTS, active: activeCount, available: MAX_SPONSOR_SLOTS - activeCount });
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
