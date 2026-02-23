import { Router } from 'express';
import pool from '../db.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

const SLOTS_PER_SPORT = 3;
const SPONSOR_TIERS = {
  standard: { price: 99.99, label: 'Standard', maxSports: 1 },
  premium: { price: 299.99, label: 'Premium Multi-Sport', maxSports: 99 },
};

const ALL_SPORTS = [
  'NFL', 'NBA', 'MLB', 'NHL', 'College Football', 'College Basketball',
  'Premier League', 'La Liga', 'Liga MX', 'MLS', 'Champions League',
  'Formula 1', 'Tennis', 'Rugby', 'Cricket', 'UFC', 'FIFA World Cup'
];

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
  placementType: s.placement_type || 'sport_banner',
  targetSports: s.target_sports || [],
  sponsorTier: s.sponsor_tier || 'standard',
  slotNumber: s.slot_number || null,
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
    const { name, contactName, contactEmail, contactPhone, logo, website, notes, amountPaid, paymentFrequency, startDate, endDate, status, placementType, targetSports, sponsorTier, slotNumber, tagline } = req.body;

    if (!name) return res.status(400).json({ error: 'Sponsor name is required' });

    const validFrequencies = ['one-time', 'monthly', 'quarterly', 'yearly'];
    const freq = validFrequencies.includes(paymentFrequency) ? paymentFrequency : 'one-time';
    const validStatuses = ['active', 'paused', 'ended'];
    const stat = validStatuses.includes(status) ? status : 'active';
    const amount = parseFloat(amountPaid) || 0;
    const pType = ['main_banner', 'sport_banner'].includes(placementType) ? placementType : 'sport_banner';
    const tier = ['standard', 'premium'].includes(sponsorTier) ? sponsorTier : 'standard';
    const slot = parseInt(slotNumber) || null;
    const sports = Array.isArray(targetSports) ? targetSports : [];

    const result = await pool.query(
      `INSERT INTO sponsors (name, contact_name, contact_email, contact_phone, logo, website, notes, amount_paid, payment_frequency, start_date, end_date, status, placement_type, target_sports, sponsor_tier, slot_number, tagline)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING id`,
      [name, contactName || null, contactEmail || null, contactPhone || null, logo || null, website || null, notes || null, amount, freq, startDate || null, endDate || null, stat, pType, sports, tier, slot, tagline || null]
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

    const { name, contactName, contactEmail, contactPhone, logo, website, notes, amountPaid, paymentFrequency, startDate, endDate, status, placementType, targetSports, sponsorTier, slotNumber, tagline } = req.body;

    if (!name) return res.status(400).json({ error: 'Sponsor name is required' });

    const validFrequencies = ['one-time', 'monthly', 'quarterly', 'yearly'];
    const freq = validFrequencies.includes(paymentFrequency) ? paymentFrequency : 'one-time';
    const validStatuses = ['active', 'paused', 'ended'];
    const stat = validStatuses.includes(status) ? status : 'active';
    const amount = parseFloat(amountPaid) || 0;
    const pType = ['main_banner', 'sport_banner'].includes(placementType) ? placementType : 'sport_banner';
    const tier = ['standard', 'premium'].includes(sponsorTier) ? sponsorTier : 'standard';
    const slot = parseInt(slotNumber) || null;
    const sports = Array.isArray(targetSports) ? targetSports : [];

    await pool.query(
      `UPDATE sponsors SET
        name = $1, contact_name = $2, contact_email = $3, contact_phone = $4,
        logo = $5, website = $6, notes = $7, amount_paid = $8,
        payment_frequency = $9, start_date = $10, end_date = $11, status = $12,
        placement_type = $13, target_sports = $14, sponsor_tier = $15, slot_number = $16, tagline = $17
       WHERE id = $18`,
      [name, contactName || null, contactEmail || null, contactPhone || null, logo || null, website || null, notes || null, amount, freq, startDate || null, endDate || null, stat, pType, sports, tier, slot, tagline || null, req.params.id]
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

    const { name, tagline, logo, website, targetSports, sponsorTier } = req.body;
    if (!name) return res.status(400).json({ error: 'Sponsor name is required' });

    const sports = Array.isArray(targetSports) ? targetSports : [];
    const tier = sponsorTier === 'premium' ? 'premium' : 'standard';

    if (tier === 'standard' && sports.length > 1) {
      return res.status(400).json({ error: 'Standard tier sponsors can only target 1 sport. Upgrade to Premium for multi-sport placement.' });
    }

    await pool.query(
      `UPDATE sponsors SET name = $1, tagline = $2, logo = $3, website = $4, target_sports = $5, sponsor_tier = $6 WHERE user_id = $7`,
      [name, tagline || null, logo || null, website || null, sports, tier, req.session.userId]
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
      `SELECT name, tagline, logo, website, target_sports, sponsor_tier, placement_type, slot_number FROM sponsors WHERE status = 'active' ORDER BY
        CASE WHEN sponsor_tier = 'premium' THEN 0 ELSE 1 END,
        slot_number ASC NULLS LAST,
        created_at DESC`
    );
    res.json(result.rows.map(s => ({
      name: s.name,
      tagline: s.tagline || '',
      logo: s.logo,
      url: s.website,
      targetSports: s.target_sports || [],
      tier: s.sponsor_tier || 'standard',
      placementType: s.placement_type || 'sport_banner',
      slotNumber: s.slot_number || null
    })));
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/slots', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT target_sports, sponsor_tier FROM sponsors WHERE status = 'active'`
    );

    const sportSlots = {};
    ALL_SPORTS.forEach(sport => {
      sportSlots[sport] = { total: SLOTS_PER_SPORT, filled: 0, available: SLOTS_PER_SPORT };
    });

    result.rows.forEach(s => {
      const sports = s.target_sports || [];
      sports.forEach(sport => {
        if (sportSlots[sport]) {
          sportSlots[sport].filled++;
          sportSlots[sport].available = Math.max(0, sportSlots[sport].total - sportSlots[sport].filled);
        }
      });
    });

    res.json({
      slotsPerSport: SLOTS_PER_SPORT,
      tiers: SPONSOR_TIERS,
      sports: sportSlots,
      allSports: ALL_SPORTS
    });
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
