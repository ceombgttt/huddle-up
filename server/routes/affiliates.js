import { Router } from 'express';
import pool from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*,
        (SELECT COUNT(*) FROM affiliate_referrals WHERE affiliate_id = a.id) as total_referrals,
        (SELECT COUNT(*) FROM affiliate_referrals WHERE affiliate_id = a.id AND status = 'approved') as approved_referrals,
        (SELECT COUNT(*) FROM affiliate_referrals WHERE affiliate_id = a.id AND status = 'pending') as pending_referrals,
        (SELECT COALESCE(SUM(amount_cents), 0) FROM affiliate_payouts WHERE affiliate_id = a.id AND status = 'completed') as total_payouts_cents
      FROM affiliates a ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get affiliates error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/admin/create', requireAdmin, async (req, res) => {
  try {
    const { name, email, code, commissionType, commissionAmountCents, paymentMethod, paymentDetails, notes } = req.body;
    if (!name || !email || !code) {
      return res.status(400).json({ error: 'Name, email, and code are required' });
    }

    const existing = await pool.query('SELECT id FROM affiliates WHERE email = $1 OR code = $2', [email, code.toUpperCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Affiliate with this email or code already exists' });
    }

    const result = await pool.query(
      `INSERT INTO affiliates (name, email, code, commission_type, commission_amount_cents, payment_method, payment_details, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, email, code.toUpperCase(), commissionType || 'per_signup', commissionAmountCents || 500, paymentMethod || 'paypal', paymentDetails || '', notes || '']
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create affiliate error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/admin/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, code, commissionType, commissionAmountCents, paymentMethod, paymentDetails, notes, status } = req.body;

    const result = await pool.query(
      `UPDATE affiliates SET name = COALESCE($1, name), email = COALESCE($2, email), code = COALESCE($3, code),
       commission_type = COALESCE($4, commission_type), commission_amount_cents = COALESCE($5, commission_amount_cents),
       payment_method = COALESCE($6, payment_method), payment_details = COALESCE($7, payment_details),
       notes = COALESCE($8, notes), status = COALESCE($9, status)
       WHERE id = $10 RETURNING *`,
      [name, email, code ? code.toUpperCase() : null, commissionType, commissionAmountCents, paymentMethod, paymentDetails, notes, status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Affiliate not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update affiliate error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/admin/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM affiliates WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (error) {
    console.error('Delete affiliate error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/admin/:id/referrals', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ar.*, u.name as user_name FROM affiliate_referrals ar
       LEFT JOIN users u ON ar.user_id = u.id
       WHERE ar.affiliate_id = $1 ORDER BY ar.created_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get affiliate referrals error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/admin/referral/:id/approve', requireAdmin, async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const ref = await client.query('SELECT * FROM affiliate_referrals WHERE id = $1', [req.params.id]);
      if (ref.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Referral not found' }); }
      const referral = ref.rows[0];
      if (referral.status === 'approved') { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Already approved' }); }

      await client.query('UPDATE affiliate_referrals SET status = $1 WHERE id = $2', ['approved', req.params.id]);
      await client.query(
        'UPDATE affiliates SET total_earned_cents = total_earned_cents + $1 WHERE id = $2',
        [referral.commission_cents, referral.affiliate_id]
      );
      await client.query('COMMIT');
      res.json({ ok: true });
    } catch (e) { await client.query('ROLLBACK'); throw e; }
    finally { client.release(); }
  } catch (error) {
    console.error('Approve referral error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/admin/referral/:id/reject', requireAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE affiliate_referrals SET status = $1 WHERE id = $2', ['rejected', req.params.id]);
    res.json({ ok: true });
  } catch (error) {
    console.error('Reject referral error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/admin/:id/payout', requireAdmin, async (req, res) => {
  try {
    const { amountCents, paymentMethod, paymentReference, notes } = req.body;
    if (!amountCents || amountCents <= 0) return res.status(400).json({ error: 'Invalid payout amount' });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const aff = await client.query('SELECT * FROM affiliates WHERE id = $1', [req.params.id]);
      if (aff.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Affiliate not found' }); }

      const unpaid = aff.rows[0].total_earned_cents - aff.rows[0].total_paid_cents;
      if (amountCents > unpaid) { await client.query('ROLLBACK'); return res.status(400).json({ error: `Payout exceeds unpaid balance ($${(unpaid / 100).toFixed(2)})` }); }

      await client.query(
        `INSERT INTO affiliate_payouts (affiliate_id, amount_cents, payment_method, payment_reference, notes)
         VALUES ($1, $2, $3, $4, $5)`,
        [req.params.id, amountCents, paymentMethod || aff.rows[0].payment_method, paymentReference || '', notes || '']
      );
      await client.query('UPDATE affiliates SET total_paid_cents = total_paid_cents + $1 WHERE id = $2', [amountCents, req.params.id]);
      await client.query('COMMIT');
      res.json({ ok: true });
    } catch (e) { await client.query('ROLLBACK'); throw e; }
    finally { client.release(); }
  } catch (error) {
    console.error('Process payout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/admin/:id/payouts', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM affiliate_payouts WHERE affiliate_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get payouts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
