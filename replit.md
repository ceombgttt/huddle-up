# Huddle Up - Find Watch Parties

## Overview
A full-stack web application for finding and organizing sports watch parties. Users can discover venues, create/join parties, and connect with other sports fans. Features real authentication, PostgreSQL database, venue claiming, and admin controls.

## Tech Stack
- **Frontend**: React 18 + Vite 4 (dev middleware mode)
- **Backend**: Express 4 (single server serves both API + frontend)
- **Database**: PostgreSQL (Replit built-in)
- **Auth**: Custom email/password with bcrypt + express-session (PG-backed sessions)
- **Styling**: Tailwind CSS 3 + custom CSS
- **Icons**: Lucide React

## Architecture
Single Express server on port 5000 hosts both the API (`/api/*`) and the Vite dev server (middleware mode). In production, Express serves built static files from `dist/`.

## Project Structure
```
/
├── index.html              # HTML entry point
├── server/
│   ├── index.js            # Express + Vite combined server (port 5000)
│   ├── db.js               # PostgreSQL pool + schema initialization
│   └── routes/
│       ├── auth.js          # Signup, login, logout, session check
│       ├── parties.js       # CRUD for watch parties + join/leave
│       ├── venues.js        # Venue listing, claiming, admin approval
│       └── users.js         # User profile, favorite teams, stats
├── src/
│   ├── App.jsx              # Main application component (all views)
│   ├── api.js               # Frontend API client module
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles + Tailwind imports
├── public/                  # Static assets (logos, icons)
├── vite.config.js           # Vite config (middleware mode, no proxy needed)
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
└── package.json             # Dependencies and scripts
```

## API Routes
- `POST /api/auth/signup` - Register (email, password, name, gender)
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user session (includes notificationsEnabled)
- `POST /api/auth/verify-email` - Verify email exists for password reset (rate limited)
- `POST /api/auth/reset-password` - Reset password with verification code
- `GET /api/parties` - List parties (optional ?gameId, ?city filters)
- `POST /api/parties` - Create party (auto-notifies fellow fans with same team)
- `POST /api/parties/:id/join` - Join party
- `POST /api/parties/:id/leave` - Leave party
- `GET /api/venues` - List venues
- `POST /api/venues/claims` - Submit venue claim
- `GET /api/venues/claims` - List claims (admin)
- `POST /api/venues/claims/:id/approve` - Approve claim (admin)
- `POST /api/venues/claims/:id/reject` - Reject claim (admin)
- `PUT /api/users/me/favorites` - Update favorite team
- `DELETE /api/users/me/favorites/:sport` - Remove favorite team
- `GET /api/fans/by-team?sport=X&team=Y` - Find fans by favorite team
- `POST /api/fans/invite` - Invite a fan to a party
- `GET /api/fans/invitations` - List incoming party invitations
- `POST /api/fans/invitations/:id/accept` - Accept an invitation (auto-joins party)
- `POST /api/fans/invitations/:id/decline` - Decline an invitation
- `GET /api/notifications` - List user notifications (up to 50)
- `POST /api/notifications/read/:id` - Mark a notification as read
- `POST /api/notifications/read-all` - Mark all notifications as read
- `PUT /api/notifications/settings` - Toggle notification preference

## Database Tables
- `users` - User accounts with bcrypt password hashes + notifications_enabled flag
- `parties` - Watch party events with venue/game info
- `party_attendees` - Many-to-many party membership
- `party_invitations` - Party invitation tracking (pending/accepted/declined)
- `notifications` - In-app notifications (fan_party type, tracks read/unread)
- `venues` - Bar/restaurant venues
- `venue_claims` - Venue ownership claims for approval
- `user_favorite_teams` - User sport/team preferences
- `user_sessions` - Server-side session storage (connect-pg-simple)

## Admin Account
- Email: admin@huddleup.com / Password: admin123
- Can approve/reject venue claims

## Running
- Dev server: `npm run dev` (port 5000, single process)
- Build: `npm run build`
- Production: `NODE_ENV=production node server/index.js`

## Recent Changes
- 2026-02-16: Added password reset flow - "Forgot Password" link on login, two-step reset (email verification → code + new password), rate-limited, codes expire in 10 minutes
- 2026-02-16: Added share/invite feature - share button in header, invite friends card on profile, welcome share modal after signup; uses Web Share API with clipboard fallback
- 2026-02-16: Added badge/ranking system for fans (6 tiers: New Fan→Rookie→Starter→All-Star→MVP→Legend) and venues, with badges shown on profile, fan finder results, and venue leaderboard; profile shows progress bar to next rank
- 2026-02-16: Added notification system - auto-alerts fellow fans when parties created for their team, toggle on/off in profile, bell badge shows combined invitations + unread notifications
- 2026-02-16: Added Fan Finder feature - search for fans by team, invite them to parties, accept/decline invitations
- 2026-02-16: Combined Express + Vite into single server process (eliminates race conditions)
- 2026-02-16: Full backend with PostgreSQL, authentication, all CRUD routes
- 2026-02-16: Migrated frontend from localStorage to real API calls
