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
import notificationRoutes from './routes/notifications.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

const app = express();
const PgSession = connectPgSimple(session);

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
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

async function start() {
  await initDB();

  if (isProduction) {
    const distPath = path.resolve(__dirname, '..', 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(5000, '0.0.0.0', () => {
    console.log('Huddle Up running on http://0.0.0.0:5000');
  });
}

start().catch(console.error);
