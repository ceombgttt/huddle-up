import { Router } from 'express';
import crypto from 'crypto';
import QRCode from 'qrcode';
import pool from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { awardPoints } from './rewards.js';

const router = Router();

router.post('/venue/generate', requireAuth, async (req, res) => {
  try {
    const venue = await pool.query(
      'SELECT id, name, claimed_by FROM venues WHERE claimed_by = $1',
      [req.session.userId]
    );
    if (venue.rows.length === 0) {
      return res.status(403).json({ error: 'You must own a venue to generate a QR code' });
    }

    const venueId = venue.rows[0].id;
    const venueName = venue.rows[0].name;

    await pool.query(
      'UPDATE venue_qr_codes SET active = FALSE WHERE venue_id = $1',
      [venueId]
    );

    const token = crypto.randomBytes(32).toString('hex');

    await pool.query(
      'INSERT INTO venue_qr_codes (venue_id, token) VALUES ($1, $2)',
      [venueId, token]
    );

    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const checkinUrl = `${protocol}://${host}/checkin/${token}`;

    const qrDataUrl = await QRCode.toDataURL(checkinUrl, {
      width: 400,
      margin: 2,
      color: { dark: '#1e293b', light: '#ffffff' },
      errorCorrectionLevel: 'H'
    });

    res.json({
      qrDataUrl,
      checkinUrl,
      venueName,
      venueId,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Generate QR error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/venue/qr', requireAuth, async (req, res) => {
  try {
    const venue = await pool.query(
      'SELECT id, name FROM venues WHERE claimed_by = $1',
      [req.session.userId]
    );
    if (venue.rows.length === 0) {
      return res.status(404).json({ error: 'No venue found' });
    }

    const venueId = venue.rows[0].id;
    const qr = await pool.query(
      'SELECT token, created_at, last_rotated_at FROM venue_qr_codes WHERE venue_id = $1 AND active = TRUE ORDER BY created_at DESC LIMIT 1',
      [venueId]
    );

    if (qr.rows.length === 0) {
      return res.json({ hasQr: false, venueName: venue.rows[0].name, venueId });
    }

    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const checkinUrl = `${protocol}://${host}/checkin/${qr.rows[0].token}`;

    const qrDataUrl = await QRCode.toDataURL(checkinUrl, {
      width: 400,
      margin: 2,
      color: { dark: '#1e293b', light: '#ffffff' },
      errorCorrectionLevel: 'H'
    });

    res.json({
      hasQr: true,
      qrDataUrl,
      checkinUrl,
      venueName: venue.rows[0].name,
      venueId,
      createdAt: qr.rows[0].created_at,
      lastRotatedAt: qr.rows[0].last_rotated_at
    });
  } catch (error) {
    console.error('Get QR error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/venue/stats', requireAuth, async (req, res) => {
  try {
    const venue = await pool.query(
      'SELECT id, name FROM venues WHERE claimed_by = $1',
      [req.session.userId]
    );
    if (venue.rows.length === 0) {
      return res.status(404).json({ error: 'No venue found' });
    }

    const venueName = venue.rows[0].name;

    const totalCheckins = await pool.query(
      'SELECT COUNT(*) as count FROM venue_checkins WHERE venue_name = $1',
      [venueName]
    );

    const verifiedCheckins = await pool.query(
      'SELECT COUNT(*) as count FROM venue_checkins WHERE venue_name = $1 AND qr_verified = TRUE',
      [venueName]
    );

    const recentCheckins = await pool.query(
      `SELECT vc.created_at, vc.qr_verified, u.name as user_name, p.game_title
       FROM venue_checkins vc
       JOIN users u ON vc.user_id = u.id
       LEFT JOIN parties p ON vc.party_id = p.id
       WHERE vc.venue_name = $1
       ORDER BY vc.created_at DESC LIMIT 20`,
      [venueName]
    );

    const partyCount = await pool.query(
      'SELECT COUNT(*) as count FROM parties WHERE venue_name = $1',
      [venueName]
    );

    const uniqueVisitors = await pool.query(
      'SELECT COUNT(DISTINCT user_id) as count FROM venue_checkins WHERE venue_name = $1',
      [venueName]
    );

    res.json({
      venueName,
      totalCheckins: parseInt(totalCheckins.rows[0].count),
      verifiedCheckins: parseInt(verifiedCheckins.rows[0].count),
      totalParties: parseInt(partyCount.rows[0].count),
      uniqueVisitors: parseInt(uniqueVisitors.rows[0].count),
      recentCheckins: recentCheckins.rows.map(r => ({
        userName: r.user_name,
        gameTitle: r.game_title,
        qrVerified: r.qr_verified,
        checkedInAt: r.created_at
      }))
    });
  } catch (error) {
    console.error('Get venue stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const qr = await pool.query(
      `SELECT qr.venue_id, v.name as venue_name
       FROM venue_qr_codes qr
       JOIN venues v ON qr.venue_id = v.id
       WHERE qr.token = $1 AND qr.active = TRUE`,
      [token]
    );

    if (qr.rows.length === 0) {
      return res.json({ valid: false, error: 'Invalid or expired QR code' });
    }

    res.json({
      valid: true,
      venueId: qr.rows[0].venue_id,
      venueName: qr.rows[0].venue_name
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/scan', requireAuth, async (req, res) => {
  try {
    const { token, partyId } = req.body;
    if (!token) return res.status(400).json({ error: 'QR token is required' });

    const qr = await pool.query(
      `SELECT qr.venue_id, v.name as venue_name
       FROM venue_qr_codes qr
       JOIN venues v ON qr.venue_id = v.id
       WHERE qr.token = $1 AND qr.active = TRUE`,
      [token]
    );

    if (qr.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired QR code' });
    }

    const venueName = qr.rows[0].venue_name;
    const venueId = qr.rows[0].venue_id;

    let targetPartyId = partyId;

    if (!targetPartyId) {
      const activeParty = await pool.query(
        `SELECT p.id FROM parties p
         JOIN party_attendees pa ON pa.party_id = p.id
         WHERE p.venue_name = $1 AND pa.user_id = $2
         AND p.game_date >= NOW() - INTERVAL '6 hours'
         AND p.game_date <= NOW() + INTERVAL '6 hours'
         ORDER BY ABS(EXTRACT(EPOCH FROM (p.game_date - NOW()))) ASC
         LIMIT 1`,
        [venueName, req.session.userId]
      );

      if (activeParty.rows.length > 0) {
        targetPartyId = activeParty.rows[0].id;
      }
    }

    if (targetPartyId) {
      const membership = await pool.query(
        'SELECT 1 FROM party_attendees WHERE party_id = $1 AND user_id = $2',
        [targetPartyId, req.session.userId]
      );
      if (membership.rows.length === 0) {
        return res.status(403).json({ error: 'You must be a party member to check in' });
      }

      const existing = await pool.query(
        'SELECT 1 FROM venue_checkins WHERE user_id = $1 AND party_id = $2',
        [req.session.userId, targetPartyId]
      );

      if (existing.rows.length > 0) {
        await pool.query(
          'UPDATE venue_checkins SET qr_verified = TRUE WHERE user_id = $1 AND party_id = $2',
          [req.session.userId, targetPartyId]
        );
        return res.json({
          ok: true,
          alreadyCheckedIn: true,
          qrVerified: true,
          venueName,
          message: `Attendance verified at ${venueName}!`
        });
      }

      await pool.query(
        'INSERT INTO venue_checkins (user_id, party_id, venue_name, qr_verified) VALUES ($1, $2, $3, TRUE)',
        [req.session.userId, targetPartyId, venueName]
      );

      const points = await awardPoints(
        req.session.userId,
        'venue_checkin',
        `QR verified check-in at ${venueName}`,
        targetPartyId
      );

      return res.json({
        ok: true,
        qrVerified: true,
        venueName,
        pointsEarned: points,
        message: `Checked in at ${venueName}! +${points} points`
      });
    }

    const existingVenueCheckin = await pool.query(
      `SELECT 1 FROM venue_checkins WHERE user_id = $1 AND venue_name = $2
       AND created_at > NOW() - INTERVAL '12 hours' AND party_id IS NULL`,
      [req.session.userId, venueName]
    );

    if (existingVenueCheckin.rows.length > 0) {
      return res.json({
        ok: true,
        alreadyCheckedIn: true,
        qrVerified: true,
        venueName,
        message: `You already checked in at ${venueName} today!`
      });
    }

    await pool.query(
      'INSERT INTO venue_checkins (user_id, party_id, venue_name, qr_verified) VALUES ($1, NULL, $2, TRUE)',
      [req.session.userId, venueName]
    );

    res.json({
      ok: true,
      qrVerified: true,
      venueName,
      noParty: true,
      message: `Checked in at ${venueName}! No active party found, but your visit is recorded.`
    });
  } catch (error) {
    console.error('QR scan error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/admin/stats', requireAdmin, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT v.name as venue_name,
        COUNT(vc.id) as total_checkins,
        COUNT(CASE WHEN vc.qr_verified THEN 1 END) as verified_checkins,
        COUNT(DISTINCT vc.user_id) as unique_visitors
      FROM venues v
      LEFT JOIN venue_checkins vc ON vc.venue_name = v.name
      GROUP BY v.name
      ORDER BY total_checkins DESC
    `);

    res.json(stats.rows.map(r => ({
      venueName: r.venue_name,
      totalCheckins: parseInt(r.total_checkins),
      verifiedCheckins: parseInt(r.verified_checkins),
      uniqueVisitors: parseInt(r.unique_visitors)
    })));
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
