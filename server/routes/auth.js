import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';

const router = Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, gender, dateOfBirth, rememberMe = true, referralCode = '', affiliateCode = '', userType = 'fan', venueName = '', venueAddress = '' } = req.body;
    const validUserType = ['fan', 'venue'].includes(userType) ? userType : 'fan';
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (validUserType === 'fan' && (!gender || !dateOfBirth)) {
      return res.status(400).json({ error: 'All fields are required for fan accounts' });
    }
    if (validUserType === 'venue' && !venueName?.trim()) {
      return res.status(400).json({ error: 'Venue name is required for venue accounts' });
    }

    if (validUserType === 'fan' && dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      if (age < 21) {
        return res.status(400).json({ error: 'You must be 21 or older to join Huddle Up' });
      }
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    let validReferral = null;
    if (referralCode && referralCode.trim()) {
      const refCheck = await pool.query('SELECT id FROM users WHERE referral_code = $1', [referralCode.trim().toUpperCase()]);
      if (refCheck.rows.length > 0) {
        validReferral = referralCode.trim().toUpperCase();
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, gender, date_of_birth, referred_by, subscription_tier, subscription_status, user_type) 
       VALUES ($1, $2, $3, $4, $5, $6, 'free', 'active', $7) 
       RETURNING id, email, name, gender, country, profile_picture, date_of_birth, is_admin, joined_at, notifications_enabled, phone_number, user_city, sms_notifications, subscription_tier, subscription_status, trial_ends_at, user_type`,
      [email, passwordHash, name, gender || null, dateOfBirth || null, validReferral, validUserType]
    );

    const user = result.rows[0];

    const affCode = affiliateCode?.trim().toUpperCase() || '';
    if (affCode) {
      try {
        const affCheck = await pool.query(
          'SELECT id, commission_rate, max_redemptions, expiration_date, status FROM affiliates WHERE code = $1',
          [affCode]
        );
        if (affCheck.rows.length > 0) {
          const aff = affCheck.rows[0];
          let isValid = aff.status === 'active';
          if (isValid && aff.expiration_date && new Date(aff.expiration_date) < new Date()) isValid = false;
          if (isValid && aff.max_redemptions) {
            const usage = await pool.query('SELECT COUNT(*) as count FROM affiliate_referrals WHERE affiliate_id = $1', [aff.id]);
            if (parseInt(usage.rows[0].count) >= aff.max_redemptions) isValid = false;
          }
          if (isValid) {
            await pool.query('UPDATE users SET affiliate_code = $1 WHERE id = $2', [affCode, user.id]);
          }
        }
      } catch (affErr) {
        console.error('Affiliate tracking error (non-fatal):', affErr);
      }
    }

    req.session.userId = user.id;
    req.session.isAdmin = user.is_admin;

    if (rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
    } else {
      req.session.cookie.maxAge = null;
    }

    if (validUserType === 'venue' && venueName) {
      try {
        const existingVenue = await pool.query('SELECT id FROM venues WHERE LOWER(name) = LOWER($1)', [venueName.trim()]);
        if (existingVenue.rows.length === 0) {
          await pool.query(
            'INSERT INTO venues (name, address, claimed_by) VALUES ($1, $2, $3)',
            [venueName.trim(), venueAddress?.trim() || '', user.id]
          );
        }
      } catch (venueErr) {
        console.error('Auto venue creation error (non-fatal):', venueErr);
      }
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      gender: user.gender,
      country: user.country,
      profilePicture: user.profile_picture,
      dateOfBirth: user.date_of_birth,
      isAdmin: user.is_admin,
      joinedDate: user.joined_at,
      notificationsEnabled: user.notifications_enabled,
      phoneNumber: user.phone_number,
      userCity: user.user_city,
      smsNotifications: user.sms_notifications,
      favoriteTeams: {},
      userType: user.user_type || 'fan',
      subscriptionTier: user.subscription_tier || 'free',
      subscriptionStatus: user.subscription_status || 'active',
      isFounder: user.is_founder || false
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe = true } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.session.userId = user.id;
    req.session.isAdmin = user.is_admin;

    if (rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
    } else {
      req.session.cookie.maxAge = null;
    }

    const favResult = await pool.query('SELECT sport, team FROM user_favorite_teams WHERE user_id = $1', [user.id]);
    const favoriteTeams = {};
    favResult.rows.forEach(row => { favoriteTeams[row.sport] = row.team; });

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      gender: user.gender,
      country: user.country,
      profilePicture: user.profile_picture,
      dateOfBirth: user.date_of_birth,
      isAdmin: user.is_admin,
      joinedDate: user.joined_at,
      notificationsEnabled: user.notifications_enabled,
      phoneNumber: user.phone_number,
      userCity: user.user_city,
      smsNotifications: user.sms_notifications,
      favoriteTeams,
      userType: user.user_type || 'fan',
      subscriptionTier: user.subscription_tier || 'free',
      subscriptionStatus: user.subscription_status || 'active',
      isFounder: user.is_founder || false
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

const resetAttempts = new Map();

router.post('/verify-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const ip = req.ip || 'unknown';
    const now = Date.now();
    const attempts = resetAttempts.get(ip) || [];
    const recentAttempts = attempts.filter(t => now - t < 60000);
    if (recentAttempts.length >= 5) {
      return res.status(429).json({ error: 'Too many attempts. Please try again in a minute.' });
    }
    recentAttempts.push(now);
    resetAttempts.set(ip, recentAttempts);

    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No account found with that email address' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    resetAttempts.set(`code:${email}`, { code, expiresAt });

    console.log(`[Password Reset] Code for ${email}: ${code}`);
    res.json({ ok: true });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const stored = resetAttempts.get(`code:${email}`);
    if (!stored || stored.code !== code || Date.now() > stored.expiresAt) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [passwordHash, email]);
    resetAttempts.delete(`code:${email}`);

    res.json({ ok: true });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sid');
    res.json({ ok: true });
  });
});

router.get('/me', async (req, res) => {
  if (!req.session.userId) {
    return res.json(null);
  }
  try {
    const result = await pool.query('SELECT id, email, name, gender, country, profile_picture, date_of_birth, is_admin, joined_at, notifications_enabled, phone_number, user_city, sms_notifications, subscription_tier, subscription_status, trial_ends_at, user_type, is_founder FROM users WHERE id = $1', [req.session.userId]);
    if (result.rows.length === 0) {
      return res.json(null);
    }
    const user = result.rows[0];

    const favResult = await pool.query('SELECT sport, team FROM user_favorite_teams WHERE user_id = $1', [user.id]);
    const favoriteTeams = {};
    favResult.rows.forEach(row => { favoriteTeams[row.sport] = row.team; });

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      gender: user.gender,
      country: user.country,
      profilePicture: user.profile_picture,
      dateOfBirth: user.date_of_birth,
      isAdmin: user.is_admin,
      joinedDate: user.joined_at,
      notificationsEnabled: user.notifications_enabled,
      phoneNumber: user.phone_number,
      userCity: user.user_city,
      smsNotifications: user.sms_notifications,
      favoriteTeams,
      userType: user.user_type || 'fan',
      subscriptionTier: user.subscription_tier || 'free',
      subscriptionStatus: user.subscription_status || 'active',
      isFounder: user.is_founder || false
    });
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/user-count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM users');
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    res.json({ count: 0 });
  }
});

export default router;
