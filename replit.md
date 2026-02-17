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
│       ├── users.js         # User profile, favorite teams, stats
│       └── uploads.js       # Profile picture upload (presigned URLs + serve)
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
- `PUT /api/users/me/profile` - Update profile (dateOfBirth, ageConfirmed)
- `PUT /api/users/me/sms-settings` - Update SMS settings (phoneNumber, userCity, smsNotifications)
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
- `PUT /api/venues/:id` - Admin edit any venue (name, address, city, type, phone, website, capacity, description, featured)
- `POST /api/uploads/profile-picture/request-url` - Get presigned URL for profile picture upload
- `POST /api/uploads/profile-picture/save` - Save profile picture path after upload
- `DELETE /api/uploads/profile-picture` - Remove profile picture
- `GET /api/uploads/serve/profile-pictures/:id` - Serve profile picture images
- `GET /api/analytics/overview` - KPI summary (admin only)
- `GET /api/analytics/user-growth?days=N` - Daily signup counts (admin only)
- `GET /api/analytics/party-trends?days=N` - Daily party creation counts (admin only)
- `GET /api/analytics/top-sports` - Sports ranked by party count (admin only)
- `GET /api/analytics/top-cities` - Cities ranked by party count (admin only)
- `GET /api/analytics/top-teams` - Teams ranked by fan count (admin only)
- `GET /api/analytics/venue-performance` - Venue rankings by parties/attendees (admin only)
- `GET /api/analytics/engagement` - User engagement metrics + demographics (admin only)
- `GET /api/analytics/recent-activity` - Recent signups, parties, messages (admin only)
- `GET /api/analytics/user-cities` - User distribution by city (admin only)
- `GET /api/analytics/hourly-activity` - Chat message counts by hour (admin only)
- `GET /api/games` - Fetch live games/scores from ESPN API (9 leagues, 60s cache)
- `GET /api/chat/parties/:partyId/messages` - Get party chat messages (requires membership)
- `POST /api/chat/parties/:partyId/messages` - Send party chat message (requires membership, 500 char limit)
- `GET /api/sponsors` - List sponsors for venue owner's venue
- `POST /api/sponsors` - Add a new sponsor (venue owner only)
- `PUT /api/sponsors/:id` - Update a sponsor (venue owner only)
- `DELETE /api/sponsors/:id` - Delete a sponsor (venue owner only)

## Database Tables
- `users` - User accounts with bcrypt password hashes, date_of_birth, notifications_enabled flag
- `parties` - Watch party events with venue/game info
- `party_attendees` - Many-to-many party membership
- `party_invitations` - Party invitation tracking (pending/accepted/declined)
- `notifications` - In-app notifications (fan_party type, tracks read/unread)
- `venues` - Bar/restaurant venues (with logo and picture columns)
- `venue_claims` - Venue ownership claims for approval
- `user_favorite_teams` - User sport/team preferences
- `sponsors` - Venue sponsor tracking (name, contact, logo, revenue, frequency, dates, status)
- `friendships` - Friend/crew relationships (user_id, friend_id, status: pending/accepted/declined)
- `party_messages` - Party chat messages (party_id, user_id, message, created_at)
- `user_sessions` - Server-side session storage (connect-pg-simple)

## Admin Account
- Email: admin@huddleupusa.com / Password: admin123
- Can approve/reject venue claims

## Running
- Dev server: `npm run dev` (port 5000, single process)
- Build: `npm run build`
- Production: `NODE_ENV=production node server/index.js`

## Storage
- **Object Storage**: Replit built-in (GCS-backed) for profile pictures and venue images
- Profile pictures stored at `/objects/profile-pictures/<uuid>` paths
- Venue logos stored at `/objects/venue-logos/<uuid>` paths
- Venue photos stored at `/objects/venue-pictures/<uuid>` paths
- Presigned URL upload flow: request URL → PUT to GCS → save path in DB

## Recent Changes
- 2026-02-17: Added comprehensive admin analytics dashboard - tabbed interface (Analytics/Management), KPI cards (users/parties/venues/attendees/messages/friendships), user growth bar chart (90 days), engagement rings (favorites/profile pics/friends/parties/chat), gender & age demographics, top sports/cities/teams rankings, venue performance table, user locations map, hourly chat activity chart, recent signups/parties/messages feeds, refresh button
- 2026-02-17: Fixed venue edit form resetting on scroll - lifted editing state to App level so data refreshes don't unmount the edit form; added fixed scroll container to prevent mobile overscroll navigation
- 2026-02-17: Added party chat system - real-time messaging within party cards for attendees/hosts, auto-polls every 5s, message bubbles with profile pics and timestamps, 500 char limit, membership-verified access
- 2026-02-17: Added "My Crew" friend/community system - send/accept/decline friend requests from Fan Finder, "My Crew" nav button with pending request badge, crew list with invite-to-party and remove friend, friend request notifications, "In Your Crew" badge on Fan Finder results
- 2026-02-17: Added browser geolocation to auto-detect user's city - auto-populates city filter, sorts parties by proximity, "NEAR YOU" badge on matching party cards, location detect button in city input
- 2026-02-17: Added persistent main sponsor bar at top of all authenticated pages (orange gradient, "Advertise" CTA)
- 2026-02-17: Added interactive venue map to party cards - expandable Google Maps embed with "Get Directions" button
- 2026-02-17: Added team affiliation to parties - hosts select supported team during creation, party cards display team logo with team-colored gradient backgrounds (50+ team color schemes mapped)
- 2026-02-17: Added push notifications for score alerts - users tap bell icon on any game to get browser/phone notifications when scores change, even when app is closed; uses Web Push API with service worker, score checker polls ESPN every 60s
- 2026-02-17: Added team logos next to attendee names in "Who's Going" party cards (shows favorite teams)
- 2026-02-17: Added UFC sport with ESPN API integration and fighter roster
- 2026-02-17: Added SMS text notifications via Twilio - users can opt-in with phone number and city, get "HUDDLE UP" texts when watch parties created for their team in their city; logs to console when Twilio not configured
- 2026-02-17: Moved sponsor management from venue owner dashboard to admin panel exclusively
- 2026-02-17: Added sponsor management to venue owner dashboard - add/edit/delete sponsors with logo upload, contact details, revenue tracking (amount, frequency), date ranges, status (active/paused/ended), revenue summary cards
- 2026-02-17: Updated logo to new shield/fist design (huddle-up-logo-2.png) across welcome, signup, and dashboard header
- 2026-02-17: Added glowing scroll-down arrow with bounce animation to guide users to game cards below banners
- 2026-02-17: Added dynamic sponsor banner on dashboard - changes based on selected sport filter, rotates every 5s when "All" selected, placeholder spots for all 15+ sports
- 2026-02-17: Added team logos (ESPN CDN) to favorite teams on profile, sport icons on all sports labels
- 2026-02-17: Added Edit Profile button with birthday editor modal and 21+ age verification disclaimer checkbox
- 2026-02-17: Added mandatory 21+ age verification disclaimer checkbox to signup form
- 2026-02-17: Added Huddle Up logo to welcome screen and dashboard header
- 2026-02-17: Made all venue addresses clickable Google Maps links for directions
- 2026-02-17: Added venue logo and picture upload for venue owners (displayed on venue dashboard, leaderboard, party cards, admin panel)
- 2026-02-17: Added mandatory date of birth field to signup with 21+ age verification; age displayed on profile
- 2026-02-17: Added profile picture upload feature - users can upload face photos for transparency, displayed on profile, nav bar, fan finder, and party attendee lists; uses Replit object storage with presigned URLs; restricted to profile-pictures path for security
- 2026-02-16: Added live game scores from ESPN API - auto-refreshes every 60 seconds, shows scores/logos/records/broadcast info for NFL, NBA, MLB, NHL, College Football, College Basketball, Premier League, La Liga MX, MLS
- 2026-02-16: Added password reset flow - "Forgot Password" link on login, two-step reset (email verification → code + new password), rate-limited, codes expire in 10 minutes
- 2026-02-16: Added share/invite feature - share button in header, invite friends card on profile, welcome share modal after signup; uses Web Share API with clipboard fallback
- 2026-02-16: Added badge/ranking system for fans (6 tiers: New Fan→Rookie→Starter→All-Star→MVP→Legend) and venues, with badges shown on profile, fan finder results, and venue leaderboard; profile shows progress bar to next rank
- 2026-02-16: Added notification system - auto-alerts fellow fans when parties created for their team, toggle on/off in profile, bell badge shows combined invitations + unread notifications
- 2026-02-16: Added Fan Finder feature - search for fans by team, invite them to parties, accept/decline invitations
- 2026-02-16: Combined Express + Vite into single server process (eliminates race conditions)
- 2026-02-16: Full backend with PostgreSQL, authentication, all CRUD routes
- 2026-02-16: Migrated frontend from localStorage to real API calls
