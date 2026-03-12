import { Router } from 'express';
import crypto from 'crypto';
import QRCode from 'qrcode';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

async function getOwnedVenue(userId) {
  const result = await pool.query(
    'SELECT id, name, signup_qr_code, qr_code_enabled, total_signups_via_qr FROM venues WHERE claimed_by = $1 LIMIT 1',
    [userId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

async function requireVenueOwner(req, res, next) {
  const venue = await getOwnedVenue(req.session.userId).catch(() => null);
  if (!venue) return res.status(403).json({ error: 'You must own a venue' });
  req.ownedVenue = venue;
  next();
}

router.post('/signup-qr/generate', requireAuth, requireVenueOwner, async (req, res) => {
  try {
    const venue = req.ownedVenue;
    let code = venue.signup_qr_code;
    if (!code) {
      code = crypto.randomBytes(16).toString('hex');
      await pool.query('UPDATE venues SET signup_qr_code = $1, qr_code_enabled = TRUE WHERE id = $2', [code, venue.id]);
    }
    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const signupUrl = `${protocol}://${host}/?venueSignup=${code}`;
    const qrDataUrl = await QRCode.toDataURL(signupUrl, {
      width: 400, margin: 2,
      color: { dark: '#1e293b', light: '#ffffff' },
      errorCorrectionLevel: 'H'
    });
    res.json({ code, signupUrl, qrDataUrl, venueName: venue.name, totalSignups: venue.total_signups_via_qr || 0 });
  } catch (err) {
    console.error('Generate signup QR error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/signup-qr', requireAuth, requireVenueOwner, async (req, res) => {
  try {
    const venue = req.ownedVenue;
    if (!venue.signup_qr_code || !venue.qr_code_enabled) {
      return res.json({ hasQr: false, venueName: venue.name });
    }
    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const signupUrl = `${protocol}://${host}/?venueSignup=${venue.signup_qr_code}`;
    const qrDataUrl = await QRCode.toDataURL(signupUrl, {
      width: 400, margin: 2,
      color: { dark: '#1e293b', light: '#ffffff' },
      errorCorrectionLevel: 'H'
    });
    res.json({
      hasQr: true, code: venue.signup_qr_code,
      signupUrl, qrDataUrl, venueName: venue.name,
      totalSignups: venue.total_signups_via_qr || 0
    });
  } catch (err) {
    console.error('Get signup QR error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/verify/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const result = await pool.query(
      'SELECT id, name, address, city, type, logo, picture FROM venues WHERE signup_qr_code = $1 AND qr_code_enabled = TRUE',
      [code]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Invalid or disabled QR code' });
    const v = result.rows[0];
    res.json({
      venue: { id: v.id, name: v.name, address: v.address, city: v.city, type: v.type, logo: v.logo, picture: v.picture }
    });
  } catch (err) {
    console.error('Verify signup QR error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/link', requireAuth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'QR code is required' });
    const venueResult = await pool.query(
      'SELECT id, name, address, city FROM venues WHERE signup_qr_code = $1 AND qr_code_enabled = TRUE',
      [code]
    );
    if (venueResult.rows.length === 0) return res.status(404).json({ error: 'Invalid or disabled QR code' });
    const venue = venueResult.rows[0];
    const existing = await pool.query(
      'SELECT 1 FROM venue_contacts WHERE venue_id = $1 AND user_id = $2',
      [venue.id, req.session.userId]
    );
    if (existing.rows.length > 0) {
      return res.json({ alreadyConnected: true, venueName: venue.name });
    }
    await pool.query(
      'INSERT INTO venue_contacts (venue_id, user_id, signup_source) VALUES ($1, $2, $3)',
      [venue.id, req.session.userId, 'qr_code']
    );
    await pool.query(
      'UPDATE venues SET total_signups_via_qr = COALESCE(total_signups_via_qr, 0) + 1 WHERE id = $1',
      [venue.id]
    );
    await pool.query(
      'UPDATE users SET referred_by_venue_id = COALESCE(referred_by_venue_id, $1), signup_qr_code = COALESCE(signup_qr_code, $2) WHERE id = $3',
      [venue.id, code, req.session.userId]
    );
    res.json({ connected: true, venueName: venue.name, venueCity: venue.city });
  } catch (err) {
    console.error('Link to venue error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/contacts', requireAuth, requireVenueOwner, async (req, res) => {
  try {
    const { search, sort = 'recent' } = req.query;
    const orderBy = sort === 'visits' ? 'vc.total_visits DESC' : 'vc.connected_at DESC';
    const result = await pool.query(
      `SELECT vc.id, vc.connected_at, vc.signup_source, vc.last_visit, vc.total_visits, vc.favorite, vc.notes,
              u.id as user_id, u.name as user_name, u.email as user_email, u.profile_picture, u.user_city
       FROM venue_contacts vc
       JOIN users u ON vc.user_id = u.id
       WHERE vc.venue_id = $1
       ORDER BY ${orderBy}`,
      [req.ownedVenue.id]
    );
    let rows = result.rows;
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter(r => r.user_name.toLowerCase().includes(s) || r.user_email.toLowerCase().includes(s));
    }
    res.json({
      total: rows.length,
      contacts: rows.map(r => ({
        id: r.id,
        connectedAt: r.connected_at,
        signupSource: r.signup_source,
        lastVisit: r.last_visit,
        totalVisits: r.total_visits,
        favorite: r.favorite,
        notes: r.notes,
        user: {
          id: r.user_id,
          name: r.user_name,
          email: r.user_email,
          photo: r.profile_picture,
          city: r.user_city
        }
      }))
    });
  } catch (err) {
    console.error('Get venue contacts error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/invite', requireAuth, requireVenueOwner, async (req, res) => {
  try {
    const { contactIds, partyId, message } = req.body;
    if (!contactIds?.length || !partyId) return res.status(400).json({ error: 'contactIds and partyId required' });
    const partyResult = await pool.query('SELECT id, title, venue_name FROM parties WHERE id = $1', [partyId]);
    if (partyResult.rows.length === 0) return res.status(404).json({ error: 'Party not found' });
    const party = partyResult.rows[0];
    const contacts = await pool.query(
      'SELECT vc.user_id FROM venue_contacts vc WHERE vc.id = ANY($1::uuid[]) AND vc.venue_id = $2',
      [contactIds, req.ownedVenue.id]
    );
    const inviteText = message || `${req.ownedVenue.name} invited you to a watch party: ${party.title || party.venue_name}!`;
    const inserted = [];
    for (const c of contacts.rows) {
      try {
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, message, data)
           VALUES ($1, 'party_invite', 'Party Invitation', $2, $3)`,
          [c.user_id, inviteText, JSON.stringify({ partyId, venueId: req.ownedVenue.id })]
        );
        inserted.push(c.user_id);
      } catch (e) { }
    }
    res.json({ sent: inserted.length, message: `Invites sent to ${inserted.length} contact${inserted.length !== 1 ? 's' : ''}` });
  } catch (err) {
    console.error('Invite contacts error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/contacts/:id/favorite', requireAuth, requireVenueOwner, async (req, res) => {
  try {
    const { favorite } = req.body;
    await pool.query(
      'UPDATE venue_contacts SET favorite = $1 WHERE id = $2 AND venue_id = $3',
      [!!favorite, req.params.id, req.ownedVenue.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Toggle favorite contact error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
