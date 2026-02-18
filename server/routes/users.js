import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.put('/me/favorites', requireAuth, async (req, res) => {
  try {
    const { sport, team } = req.body;
    await pool.query(
      `INSERT INTO user_favorite_teams (user_id, sport, team) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, sport) DO UPDATE SET team = $3`,
      [req.session.userId, sport, team]
    );

    const favResult = await pool.query('SELECT sport, team FROM user_favorite_teams WHERE user_id = $1', [req.session.userId]);
    const favoriteTeams = {};
    favResult.rows.forEach(row => { favoriteTeams[row.sport] = row.team; });

    res.json({ favoriteTeams });
  } catch (error) {
    console.error('Update favorites error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/me/favorites/:sport', requireAuth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM user_favorite_teams WHERE user_id = $1 AND sport = $2',
      [req.session.userId, req.params.sport]
    );

    const favResult = await pool.query('SELECT sport, team FROM user_favorite_teams WHERE user_id = $1', [req.session.userId]);
    const favoriteTeams = {};
    favResult.rows.forEach(row => { favoriteTeams[row.sport] = row.team; });

    res.json({ favoriteTeams });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/me/country', requireAuth, async (req, res) => {
  try {
    const { country } = req.body;
    await pool.query('UPDATE users SET country = $1 WHERE id = $2', [country || null, req.session.userId]);
    res.json({ country: country || null });
  } catch (error) {
    console.error('Update country error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/me/profile', requireAuth, async (req, res) => {
  try {
    const { dateOfBirth, ageConfirmed, name, email, phoneNumber, userCity } = req.body;

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      if (!name || name.trim().length < 1) {
        return res.status(400).json({ error: 'Name is required' });
      }
      updates.push(`name = $${paramIndex++}`);
      values.push(name.trim());
    }

    if (email !== undefined) {
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email is required' });
      }
      const currentUser = await pool.query('SELECT email, password_hash FROM users WHERE id = $1', [req.session.userId]);
      if (email.toLowerCase().trim() !== currentUser.rows[0].email) {
        if (!req.body.currentPassword) {
          return res.status(400).json({ error: 'Current password is required to change email' });
        }
        const valid = await bcrypt.compare(req.body.currentPassword, currentUser.rows[0].password_hash);
        if (!valid) {
          return res.status(400).json({ error: 'Incorrect password' });
        }
        const existing = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email.toLowerCase().trim(), req.session.userId]);
        if (existing.rows.length > 0) {
          return res.status(400).json({ error: 'This email is already in use' });
        }
        updates.push(`email = $${paramIndex++}`);
        values.push(email.toLowerCase().trim());
      }
    }

    if (phoneNumber !== undefined) {
      const phone = phoneNumber ? phoneNumber.replace(/[^\d+]/g, '') : null;
      if (phone && phone.length < 10) {
        return res.status(400).json({ error: 'Please enter a valid phone number' });
      }
      updates.push(`phone_number = $${paramIndex++}`);
      values.push(phone || null);
    }

    if (userCity !== undefined) {
      updates.push(`user_city = $${paramIndex++}`);
      values.push(userCity ? userCity.trim() : null);
    }

    if (dateOfBirth !== undefined) {
      if (!dateOfBirth) {
        return res.status(400).json({ error: 'Date of birth is required' });
      }
      if (!ageConfirmed) {
        return res.status(400).json({ error: 'You must confirm you are 21 years of age or older' });
      }
      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime())) {
        return res.status(400).json({ error: 'Invalid date of birth' });
      }
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      if (age < 21) {
        return res.status(400).json({ error: 'You must be 21 years of age or older to use this app' });
      }
      updates.push(`date_of_birth = $${paramIndex++}`);
      values.push(dateOfBirth);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.session.userId);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`, values);

    const result = await pool.query(
      'SELECT id, email, name, gender, is_admin, country, profile_picture, date_of_birth, phone_number, user_city, sms_notifications, notifications_enabled, subscription_tier, referral_code, referred_by FROM users WHERE id = $1',
      [req.session.userId]
    );
    const u = result.rows[0];
    res.json({
      id: u.id, email: u.email, name: u.name, gender: u.gender,
      isAdmin: u.is_admin, country: u.country, profilePicture: u.profile_picture,
      dateOfBirth: u.date_of_birth, phoneNumber: u.phone_number, userCity: u.user_city,
      smsNotifications: u.sms_notifications, notificationsEnabled: u.notifications_enabled,
      subscriptionTier: u.subscription_tier, referralCode: u.referral_code, referred_by: u.referred_by
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/me/sms-settings', requireAuth, async (req, res) => {
  try {
    const { phoneNumber, userCity, smsNotifications } = req.body;
    const phone = phoneNumber ? phoneNumber.replace(/[^\d+]/g, '') : null;
    if (phone && phone.length < 10) {
      return res.status(400).json({ error: 'Please enter a valid phone number' });
    }
    await pool.query(
      'UPDATE users SET phone_number = $1, user_city = $2, sms_notifications = $3 WHERE id = $4',
      [phone || null, userCity || null, !!smsNotifications, req.session.userId]
    );
    res.json({ phoneNumber: phone, userCity: userCity || null, smsNotifications: !!smsNotifications });
  } catch (error) {
    console.error('Update SMS settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me/badge', requireAuth, async (req, res) => {
  try {
    const hosted = await pool.query(
      'SELECT COUNT(*) FROM parties WHERE host_id = $1',
      [req.session.userId]
    );
    const attended = await pool.query(
      'SELECT COUNT(*) FROM party_attendees WHERE user_id = $1',
      [req.session.userId]
    );
    const partiesHosted = parseInt(hosted.rows[0].count);
    const partiesAttended = parseInt(attended.rows[0].count);
    res.json({ partiesHosted, partiesAttended });
  } catch (error) {
    console.error('Badge stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const partyCount = await pool.query('SELECT COUNT(*) FROM parties');
    const venueCount = await pool.query('SELECT COUNT(*) FROM venues WHERE verified = TRUE');
    res.json({
      totalUsers: parseInt(userCount.rows[0].count),
      totalParties: parseInt(partyCount.rows[0].count),
      totalVenues: parseInt(venueCount.rows[0].count)
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
