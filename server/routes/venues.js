import { Router } from 'express';
import pool from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.*, u.email as claimed_by_email, u.subscription_tier as owner_tier,
        (SELECT COUNT(*) FROM parties WHERE venue_name = v.name) as total_parties,
        (SELECT COUNT(DISTINCT pa.user_id) FROM party_attendees pa JOIN parties p ON pa.party_id = p.id WHERE p.venue_name = v.name) as total_fans
      FROM venues v
      LEFT JOIN users u ON v.claimed_by = u.id
      ORDER BY
        CASE WHEN v.featured = true AND (v.featured_until IS NULL OR v.featured_until > NOW()) THEN 0 ELSE 1 END,
        CASE WHEN u.subscription_tier IN ('venue', 'featured_venue', 'sponsor') THEN 0 ELSE 1 END,
        v.featured DESC, v.name
    `);

    const venues = result.rows.map(v => ({
      id: v.id,
      name: v.name,
      address: v.address,
      type: v.type,
      verified: v.verified,
      featured: v.featured && (v.featured_until === null || new Date(v.featured_until) > new Date()),
      featuredTier: v.featured_tier,
      claimedBy: v.claimed_by_email,
      subscribed: v.owner_tier === 'venue' || v.owner_tier === 'featured_venue' || v.owner_tier === 'sponsor',
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

router.get('/:id/detail', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session?.userId || null;

    const result = await pool.query(`
      SELECT v.*,
        (SELECT COUNT(*) FROM parties WHERE venue_name = v.name) as total_parties,
        (SELECT COUNT(DISTINCT pa.user_id) FROM party_attendees pa JOIN parties p ON pa.party_id = p.id WHERE p.venue_name = v.name) as total_fans,
        (SELECT COUNT(*) FROM venue_follows WHERE venue_id = v.id) as follower_count,
        (SELECT ROUND(AVG(rating)::numeric, 2) FROM venue_reviews WHERE venue_id = v.id) as avg_rating,
        (SELECT COUNT(*) FROM venue_reviews WHERE venue_id = v.id) as review_count
      FROM venues v WHERE v.id = $1
    `, [id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Venue not found' });
    const v = result.rows[0];

    let isFollowing = false;
    if (userId) {
      const followCheck = await pool.query('SELECT 1 FROM venue_follows WHERE venue_id = $1 AND user_id = $2', [id, userId]);
      isFollowing = followCheck.rows.length > 0;
    }

    const sportResult = await pool.query(`
      SELECT sport, COUNT(*) as cnt FROM parties WHERE venue_name = $1
      GROUP BY sport ORDER BY cnt DESC LIMIT 1
    `, [v.name]);

    const avgAttResult = await pool.query(`
      SELECT ROUND(AVG(att_count)::numeric, 1) as avg_attendance FROM (
        SELECT p.id, COUNT(pa.id) as att_count FROM parties p
        LEFT JOIN party_attendees pa ON pa.party_id = p.id
        WHERE p.venue_name = $1 GROUP BY p.id
      ) sub
    `, [v.name]);

    res.json({
      id: v.id,
      name: v.name,
      address: v.address,
      type: v.type,
      verified: v.verified,
      featured: v.featured,
      phone: v.phone,
      website: v.website,
      city: v.city,
      capacity: v.capacity,
      description: v.description,
      logo: v.logo,
      picture: v.picture,
      totalParties: parseInt(v.total_parties),
      totalFans: parseInt(v.total_fans),
      followerCount: parseInt(v.follower_count),
      avgRating: v.avg_rating ? parseFloat(v.avg_rating) : null,
      reviewCount: parseInt(v.review_count),
      isFollowing,
      popularSport: sportResult.rows[0]?.sport || null,
      avgAttendance: avgAttResult.rows[0]?.avg_attendance ? parseFloat(avgAttResult.rows[0].avg_attendance) : 0,
    });
  } catch (error) {
    console.error('Get venue detail error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id/parties', async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    const venue = await pool.query('SELECT name FROM venues WHERE id = $1', [id]);
    if (venue.rows.length === 0) return res.status(404).json({ error: 'Venue not found' });
    const venueName = venue.rows[0].name;

    let query;
    if (type === 'past') {
      query = `
        SELECT p.*, u.name as host_name, u.profile_picture as host_picture,
          (SELECT COUNT(*) FROM party_attendees WHERE party_id = p.id) as attendee_count
        FROM parties p
        JOIN users u ON p.host_id = u.id
        WHERE p.venue_name = $1 AND p.game_time::timestamptz < NOW()
        ORDER BY p.game_time DESC LIMIT 50
      `;
    } else {
      query = `
        SELECT p.*, u.name as host_name, u.profile_picture as host_picture,
          (SELECT COUNT(*) FROM party_attendees WHERE party_id = p.id) as attendee_count
        FROM parties p
        JOIN users u ON p.host_id = u.id
        WHERE p.venue_name = $1 AND p.game_time::timestamptz >= NOW()
        ORDER BY p.game_time ASC LIMIT 50
      `;
    }

    const result = await pool.query(query, [venueName]);
    const parties = result.rows.map(p => ({
      id: p.id,
      gameId: p.game_id,
      sport: p.sport,
      homeTeam: p.home_team,
      awayTeam: p.away_team,
      gameTime: p.game_time,
      venueName: p.venue_name,
      venueAddress: p.venue_address,
      city: p.city,
      title: p.title,
      notes: p.notes,
      maxSize: p.max_size,
      hostName: p.host_name,
      hostPicture: p.host_picture,
      attendeeCount: parseInt(p.attendee_count),
      createdAt: p.created_at,
    }));

    res.json(parties);
  } catch (error) {
    console.error('Get venue parties error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/follow', requireAuth, async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO venue_follows (venue_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.params.id, req.session.userId]
    );
    const count = await pool.query('SELECT COUNT(*) as cnt FROM venue_follows WHERE venue_id = $1', [req.params.id]);
    res.json({ following: true, followerCount: parseInt(count.rows[0].cnt) });
  } catch (error) {
    console.error('Follow venue error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id/follow', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM venue_follows WHERE venue_id = $1 AND user_id = $2', [req.params.id, req.session.userId]);
    const count = await pool.query('SELECT COUNT(*) as cnt FROM venue_follows WHERE venue_id = $1', [req.params.id]);
    res.json({ following: false, followerCount: parseInt(count.rows[0].cnt) });
  } catch (error) {
    console.error('Unfollow venue error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id/reviews', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT vr.*, u.name as user_name, u.profile_picture
      FROM venue_reviews vr
      JOIN users u ON vr.user_id = u.id
      WHERE vr.venue_id = $1
      ORDER BY vr.created_at DESC
    `, [req.params.id]);

    const summary = await pool.query(`
      SELECT COUNT(*) as total,
        ROUND(AVG(rating)::numeric, 2) as avg_rating,
        ROUND(AVG(atmosphere)::numeric, 2) as avg_atmosphere,
        ROUND(AVG(service)::numeric, 2) as avg_service,
        ROUND(AVG(value)::numeric, 2) as avg_value,
        COUNT(*) FILTER (WHERE rating = 5) as five_star,
        COUNT(*) FILTER (WHERE rating = 4) as four_star,
        COUNT(*) FILTER (WHERE rating = 3) as three_star,
        COUNT(*) FILTER (WHERE rating = 2) as two_star,
        COUNT(*) FILTER (WHERE rating = 1) as one_star
      FROM venue_reviews WHERE venue_id = $1
    `, [req.params.id]);

    const s = summary.rows[0];
    res.json({
      reviews: result.rows.map(r => ({
        id: r.id,
        userId: r.user_id,
        userName: r.user_name,
        profilePicture: r.profile_picture,
        rating: r.rating,
        atmosphere: r.atmosphere,
        service: r.service,
        value: r.value,
        comment: r.comment,
        createdAt: r.created_at,
      })),
      summary: {
        total: parseInt(s.total),
        avgRating: s.avg_rating ? parseFloat(s.avg_rating) : null,
        avgAtmosphere: s.avg_atmosphere ? parseFloat(s.avg_atmosphere) : null,
        avgService: s.avg_service ? parseFloat(s.avg_service) : null,
        avgValue: s.avg_value ? parseFloat(s.avg_value) : null,
        breakdown: {
          5: parseInt(s.five_star),
          4: parseInt(s.four_star),
          3: parseInt(s.three_star),
          2: parseInt(s.two_star),
          1: parseInt(s.one_star),
        }
      }
    });
  } catch (error) {
    console.error('Get venue reviews error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/reviews', requireAuth, async (req, res) => {
  try {
    const { rating, atmosphere, service, value, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });

    const venue = await pool.query('SELECT id FROM venues WHERE id = $1', [req.params.id]);
    if (venue.rows.length === 0) return res.status(404).json({ error: 'Venue not found' });

    const result = await pool.query(`
      INSERT INTO venue_reviews (venue_id, user_id, rating, atmosphere, service, value, comment)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (venue_id, user_id) DO UPDATE SET
        rating = $3, atmosphere = $4, service = $5, value = $6, comment = $7, created_at = NOW()
      RETURNING *
    `, [req.params.id, req.session.userId, rating, atmosphere || null, service || null, value || null, comment || null]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Submit venue review error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id/photos', async (req, res) => {
  try {
    const venue = await pool.query('SELECT name FROM venues WHERE id = $1', [req.params.id]);
    if (venue.rows.length === 0) return res.status(404).json({ error: 'Venue not found' });

    const result = await pool.query(`
      SELECT pp.*, u.name as user_name, u.profile_picture as user_profile_picture, p.title as party_title
      FROM party_photos pp
      JOIN users u ON u.id = pp.user_id
      JOIN parties p ON p.id = pp.party_id
      WHERE p.venue_name = $1
      ORDER BY pp.created_at DESC LIMIT 100
    `, [venue.rows[0].name]);

    res.json(result.rows.map(r => ({
      id: r.id,
      objectPath: r.object_path,
      caption: r.caption,
      userName: r.user_name,
      userProfilePicture: r.user_profile_picture,
      partyTitle: r.party_title,
      createdAt: r.created_at,
    })));
  } catch (error) {
    console.error('Get venue photos error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
