import { Router } from 'express';
import crypto from 'crypto';
import pool from '../db.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*,
        (SELECT COUNT(*) FROM affiliate_referrals WHERE affiliate_id = a.id) as total_referrals,
        (SELECT COUNT(*) FROM affiliate_referrals WHERE affiliate_id = a.id AND converted_to_paid = true AND subscription_active = true) as active_paying_users,
        (SELECT COUNT(*) FROM affiliate_referrals WHERE affiliate_id = a.id AND converted_to_paid = false AND trial_end_date > NOW()) as active_trials,
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
    const { name, email, code, commissionRate, maxRedemptions, expirationDate, paymentMethod, paymentDetails, notes } = req.body;
    if (!name || !email || !code) {
      return res.status(400).json({ error: 'Name, email, and code are required' });
    }

    const rate = parseFloat(commissionRate) || 0.30;
    if (rate < 0.10 || rate > 0.50) {
      return res.status(400).json({ error: 'Commission rate must be between 10% and 50%' });
    }

    const existing = await pool.query('SELECT id FROM affiliates WHERE email = $1 OR code = $2', [email, code.toUpperCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Influencer with this email or code already exists' });
    }

    const dashboardToken = crypto.randomBytes(32).toString('hex');
    const commissionCents = Math.round(299 * rate);

    const result = await pool.query(
      `INSERT INTO affiliates (name, email, code, commission_type, commission_amount_cents, commission_rate, max_redemptions, expiration_date, dashboard_token, payment_method, payment_details, notes)
       VALUES ($1, $2, $3, 'percentage', $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [name, email, code.toUpperCase(), commissionCents, rate, maxRedemptions || null, expirationDate || null, dashboardToken, paymentMethod || 'paypal', paymentDetails || '', notes || '']
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
    const { name, email, code, commissionRate, maxRedemptions, expirationDate, paymentMethod, paymentDetails, notes, status } = req.body;

    const rate = commissionRate ? parseFloat(commissionRate) : null;
    const commissionCents = rate ? Math.round(299 * rate) : null;

    const result = await pool.query(
      `UPDATE affiliates SET name = COALESCE($1, name), email = COALESCE($2, email), code = COALESCE($3, code),
       commission_rate = COALESCE($4, commission_rate), commission_amount_cents = COALESCE($5, commission_amount_cents),
       max_redemptions = COALESCE($6, max_redemptions), expiration_date = COALESCE($7, expiration_date),
       payment_method = COALESCE($8, payment_method), payment_details = COALESCE($9, payment_details),
       notes = COALESCE($10, notes), status = COALESCE($11, status)
       WHERE id = $12 RETURNING *`,
      [name, email, code ? code.toUpperCase() : null, rate, commissionCents, maxRedemptions, expirationDate, paymentMethod, paymentDetails, notes, status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Influencer not found' });
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
      `SELECT ar.*, u.name as user_name, u.subscription_tier, u.subscription_status
       FROM affiliate_referrals ar
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
      if (aff.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Influencer not found' }); }

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

router.post('/validate-code', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ valid: false, error: 'Code is required' });
    }

    const result = await pool.query(
      'SELECT id, name, code, status, max_redemptions, expiration_date FROM affiliates WHERE code = $1',
      [code.trim().toUpperCase()]
    );

    if (result.rows.length === 0) {
      return res.json({ valid: false, error: 'Invalid code' });
    }

    const affiliate = result.rows[0];

    if (affiliate.status !== 'active') {
      return res.json({ valid: false, error: 'This code is no longer active' });
    }

    if (affiliate.expiration_date && new Date(affiliate.expiration_date) < new Date()) {
      return res.json({ valid: false, error: 'This code has expired' });
    }

    if (affiliate.max_redemptions) {
      const usageCount = await pool.query(
        'SELECT COUNT(*) as count FROM affiliate_referrals WHERE affiliate_id = $1',
        [affiliate.id]
      );
      if (parseInt(usageCount.rows[0].count) >= affiliate.max_redemptions) {
        return res.json({ valid: false, error: 'This code has reached its maximum redemptions' });
      }
    }

    res.json({ valid: true, influencerName: affiliate.name, code: affiliate.code });
  } catch (error) {
    console.error('Validate code error:', error);
    res.status(500).json({ valid: false, error: 'Server error' });
  }
});

router.get('/check-user-code', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT affiliate_code FROM users WHERE id = $1', [req.session.userId]);
    const code = result.rows[0]?.affiliate_code || null;
    res.json({ hasCode: !!code, code });
  } catch (error) {
    console.error('Check user code error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/influencer-dashboard/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const affResult = await pool.query(
      'SELECT id, name, email, code, commission_rate, status, total_earned_cents, total_paid_cents, created_at FROM affiliates WHERE dashboard_token = $1',
      [token]
    );
    if (affResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    const affiliate = affResult.rows[0];

    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_redemptions,
        COUNT(*) FILTER (WHERE converted_to_paid = true AND subscription_active = true) as active_paying,
        COUNT(*) FILTER (WHERE converted_to_paid = false AND trial_end_date > NOW()) as active_trials,
        COUNT(*) FILTER (WHERE trial_end_date <= NOW() AND converted_to_paid = false) as churned_trials,
        COALESCE(SUM(CASE WHEN converted_to_paid = true AND subscription_active = true THEN monthly_commission_cents ELSE 0 END), 0) as monthly_recurring_cents
      FROM affiliate_referrals WHERE affiliate_id = $1
    `, [affiliate.id]);

    const recentRefs = await pool.query(
      `SELECT ar.created_at, ar.trial_start_date, ar.trial_end_date, ar.converted_to_paid, ar.subscription_active, ar.monthly_commission_cents,
       u.name as user_name
       FROM affiliate_referrals ar LEFT JOIN users u ON ar.user_id = u.id
       WHERE ar.affiliate_id = $1 ORDER BY ar.created_at DESC LIMIT 50`,
      [affiliate.id]
    );

    const payouts = await pool.query(
      'SELECT amount_cents, status, created_at FROM affiliate_payouts WHERE affiliate_id = $1 ORDER BY created_at DESC LIMIT 20',
      [affiliate.id]
    );

    res.json({
      influencer: {
        name: affiliate.name,
        code: affiliate.code,
        commissionRate: parseFloat(affiliate.commission_rate),
        status: affiliate.status,
        totalEarnedCents: affiliate.total_earned_cents,
        totalPaidCents: affiliate.total_paid_cents,
        pendingPayoutCents: affiliate.total_earned_cents - affiliate.total_paid_cents,
        createdAt: affiliate.created_at
      },
      stats: statsResult.rows[0],
      recentRedemptions: recentRefs.rows,
      payouts: payouts.rows
    });
  } catch (error) {
    console.error('Influencer dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/admin/export/:id', requireAdmin, async (req, res) => {
  try {
    const refs = await pool.query(
      `SELECT ar.*, u.name as user_name, u.email as user_email_actual
       FROM affiliate_referrals ar LEFT JOIN users u ON ar.user_id = u.id
       WHERE ar.affiliate_id = $1 ORDER BY ar.created_at DESC`,
      [req.params.id]
    );

    let csv = 'User,Email,Signup Date,Trial Start,Trial End,Converted,Active,Monthly Commission\n';
    for (const r of refs.rows) {
      csv += `"${r.user_name || ''}","${r.user_email || r.user_email_actual || ''}","${r.created_at}","${r.trial_start_date || ''}","${r.trial_end_date || ''}",${r.converted_to_paid},${r.subscription_active},$${((r.monthly_commission_cents || 0) / 100).toFixed(2)}\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=affiliate-report-${req.params.id}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
