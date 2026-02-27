import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import pool, { initDB } from './db.js';
import authRoutes from './routes/auth.js';
import partyRoutes from './routes/parties.js';
import venueRoutes from './routes/venues.js';
import userRoutes from './routes/users.js';
import fanRoutes from './routes/fans.js';
import friendRoutes from './routes/friends.js';
import notificationRoutes from './routes/notifications.js';
import gameRoutes from './routes/games.js';
import uploadRoutes from './routes/uploads.js';
import sponsorRoutes from './routes/sponsors.js';
import pushRoutes from './routes/push.js';
import chatRoutes from './routes/chat.js';
import analyticsRoutes from './routes/analytics.js';
import stripeRoutes from './routes/stripe.js';
import referralRoutes from './routes/referrals.js';
import photoRoutes from './routes/photos.js';
import rewardsRoutes from './routes/rewards.js';
import qrCheckinRoutes from './routes/qrcheckin.js';
import fantasyRoutes from './routes/fantasy.js';
import profileRoutes from './routes/profile.js';
import reviewRoutes from './routes/reviews.js';
import teamchatRoutes from './routes/teamchat.js';
import trendingRoutes from './routes/trending.js';
import ticketRoutes from './routes/tickets.js';
import alertRoutes from './routes/alerts.js';
import raffleRoutes from './routes/raffles.js';
import affiliateRoutes from './routes/affiliates.js';
import venueHubRoutes from './routes/venueHub.js';
import dmRoutes from './routes/dm.js';
import predictionRoutes from './routes/predictions.js';
import { startScoreChecker } from './scoreChecker.js';
import { WebhookHandlers } from './stripe/webhookHandlers.js';
import { initStripe } from './stripe/init.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

const app = express();
const PgSession = connectPgSimple(session);

app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature' });
    }
    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;
      await WebhookHandlers.processWebhook(req.body, sig);
      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error.message);
      res.status(400).json({ error: 'Webhook processing error' });
    }
  }
);

app.use('/api/uploads/venue-image/upload', express.raw({ type: 'image/*', limit: '5mb' }));
app.use('/api/uploads/profile-picture/upload', express.raw({ type: 'image/*', limit: '5mb' }));
app.use('/api/photos/parties/:partyId/upload', express.raw({ type: 'image/*', limit: '10mb' }));
app.use(express.json());

app.use(session({
  store: new PgSession({
    pool,
    tableName: 'user_sessions',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'huddle-up-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
  },
  name: 'sid',
}));

app.use('/api/auth', authRoutes);
app.use('/api/parties', partyRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/users', userRoutes);
app.use('/api/fans', fanRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/qr', qrCheckinRoutes);
app.use('/api/fantasy', fantasyRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/team-chats', teamchatRoutes);
app.use('/api/trending', trendingRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/raffles', raffleRoutes);
app.use('/api/affiliates', affiliateRoutes);
app.use('/api/venue-hub', venueHubRoutes);
app.use('/api/dm', dmRoutes);
app.use('/api/predictions', predictionRoutes);

import { seedDemoData, clearDemoData, getSeedStats } from './seed.js';

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/seed/create', async (req, res) => {
  try {
    if (!req.session?.userId) return res.status(401).json({ error: 'Unauthorized' });
    const userCheck = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.session.userId]);
    if (!userCheck.rows[0]?.is_admin) return res.status(403).json({ error: 'Admin only' });
    const result = await seedDemoData();
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/seed/clear', async (req, res) => {
  try {
    if (!req.session?.userId) return res.status(401).json({ error: 'Unauthorized' });
    const userCheck = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.session.userId]);
    if (!userCheck.rows[0]?.is_admin) return res.status(403).json({ error: 'Admin only' });
    const result = await clearDemoData();
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Clear seed error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/seed/stats', async (req, res) => {
  try {
    if (!req.session?.userId) return res.status(401).json({ error: 'Unauthorized' });
    const userCheck = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.session.userId]);
    if (!userCheck.rows[0]?.is_admin) return res.status(403).json({ error: 'Admin only' });
    const stats = await getSeedStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function start() {
  if (isProduction) {
    const distPath = path.resolve(__dirname, '..', 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Not found' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(5000, '0.0.0.0', async () => {
    console.log('Huddle Up running on http://0.0.0.0:5000');

    await initDB();

    try {
      await initStripe();
      console.log('Stripe initialized successfully');
    } catch (error) {
      console.error('Stripe initialization failed (payments will be unavailable):', error.message);
    }

    if (!isProduction) {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    }

    startScoreChecker();
  });
}

start().catch(console.error);
