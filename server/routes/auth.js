import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';

const router = Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, gender } = req.body;
    if (!email || !password || !name || !gender) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, gender) VALUES ($1, $2, $3, $4) RETURNING id, email, name, gender, is_admin, joined_at, notifications_enabled',
      [email, passwordHash, name, gender]
    );

    const user = result.rows[0];
    req.session.userId = user.id;
    req.session.isAdmin = user.is_admin;

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      gender: user.gender,
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
    const { email, password } = req.body;
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

    const favResult = await pool.query('SELECT sport, team FROM user_favorite_teams WHERE user_id = $1', [user.id]);
    const favoriteTeams = {};
    favResult.rows.forEach(row => { favoriteTeams[row.sport] = row.team; });

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      gender: user.gender,
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
    const result = await pool.query('SELECT id, email, name, gender, is_admin, joined_at, notifications_enabled FROM users WHERE id = $1', [req.session.userId]);
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
