import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import crypto from 'crypto';

const router = Router();

function generateReferralCode() {
  return 'HU-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

router.get('/my-code', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    let result = await pool.query('SELECT referral_code FROM users WHERE id = $1', [userId]);
    let code = result.rows[0]?.referral_code;

    if (!code) {
      code = generateReferralCode();
      await pool.query('UPDATE users SET referral_code = $1 WHERE id = $2', [code, userId]);
    }

    res.json({ referralCode: code });
  } catch (error) {
    console.error('Get referral code error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/apply', requireAuth, async (req, res) => {
  try {
    const { referralCode } = req.body;
    const userId = req.session.userId;

    if (!referralCode) {
      return res.status(400).json({ error: 'Referral code required' });
    }

    const userResult = await pool.query('SELECT referred_by FROM users WHERE id = $1', [userId]);
    if (userResult.rows[0]?.referred_by) {
      return res.status(400).json({ error: 'You already have a referral code applied' });
    }

    const referrerResult = await pool.query(
      'SELECT id FROM users WHERE referral_code = $1 AND id != $2',
      [referralCode.toUpperCase(), userId]
    );
    if (referrerResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid referral code' });
    }

    await pool.query('UPDATE users SET referred_by = $1 WHERE id = $2', [referralCode.toUpperCase(), userId]);
    res.json({ success: true, message: 'Referral code applied!' });
  } catch (error) {
    console.error('Apply referral error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;

    const codeResult = await pool.query('SELECT referral_code FROM users WHERE id = $1', [userId]);
    const code = codeResult.rows[0]?.referral_code;

    if (!code) {
      return res.json({ referralCode: null, totalReferrals: 0, conversions: 0, totalEarnings: 0, pendingEarnings: 0 });
    }

    const referralsResult = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE referred_by = $1',
      [code]
    );

    const conversionsResult = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN commission_amount ELSE 0 END), 0) as pending,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN commission_amount ELSE 0 END), 0) as paid
       FROM referral_conversions WHERE referral_code = $1`,
      [code]
    );

    const conv = conversionsResult.rows[0];

    res.json({
      referralCode: code,
      totalReferrals: parseInt(referralsResult.rows[0].count),
      conversions: parseInt(conv.total),
      pendingEarnings: parseFloat(conv.pending),
      totalEarnings: parseFloat(conv.paid) + parseFloat(conv.pending),
    });
  } catch (error) {
    console.error('Referral stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/validate/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const result = await pool.query(
      'SELECT u.name FROM users u WHERE u.referral_code = $1',
      [code.toUpperCase()]
    );
    if (result.rows.length === 0) {
      return res.json({ valid: false });
    }
    res.json({ valid: true, referrerName: result.rows[0].name });
  } catch (error) {
    console.error('Validate referral error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
