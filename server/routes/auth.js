import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';

const router = Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, gender, rememberMe = true } = req.body;
    if (!email || !password || !name || !gender) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, gender) VALUES ($1, $2, $3, $4) RETURNING id, email, name, gender, country, profile_picture, is_admin, joined_at, notifications_enabled',
      [email, passwordHash, name, gender]
    );

    const user = result.rows[0];
    req.session.userId = user.id;
    req.session.isAdmin = user.is_admin;

    if (rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
    } else {
      req.session.cookie.maxAge = null;
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      gender: user.gender,
      country: user.country,
      profilePicture: user.profile_picture,
      isAdmin: user.is_admin,
      joinedDate: user.joined_at,
      notificationsEnabled: user.notifications_enabled,
      favoriteTeams: {}
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
      isAdmin: user.is_admin,
      joinedDate: user.joined_at,
      notificationsEnabled: user.notifications_enabled,
      favoriteTeams
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
    const result = await pool.query('SELECT id, email, name, gender, country, profile_picture, is_admin, joined_at, notifications_enabled FROM users WHERE id = $1', [req.session.userId]);
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
      isAdmin: user.is_admin,
      joinedDate: user.joined_at,
      notificationsEnabled: user.notifications_enabled,
      favoriteTeams
    });
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
