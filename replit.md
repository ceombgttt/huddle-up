# Huddle Up - Find Watch Parties

## Overview
Huddle Up is a full-stack web application connecting sports fans by facilitating the discovery and organization of sports watch parties. It enables users to find local venues, create parties, and engage with a community of enthusiasts. The platform aims to enhance the sports-watching experience by making it easier for fans to gather and socialize. Key capabilities include user authentication, party management, venue claiming, and administrative controls. The project seeks to create a vibrant community around live sports viewing, offering a comprehensive solution for fans to connect and enjoy games together.

## User Preferences
I prefer detailed explanations and iterative development. Ask before making major changes. Do not make changes to the `public/` folder.

## System Architecture
The application uses a single Express server for both API and React frontend, serving static built files in production and utilizing Vite in development. PostgreSQL is the primary database. Authentication is handled by a custom email/password system secured with bcrypt and express-session. Styling uses Tailwind CSS, custom CSS, and Lucide React icons. The project is structured with `server/` for backend logic and `src/` for frontend components. Object storage via Replit's GCS-backed storage manages user-uploaded images using presigned URLs.

The UI/UX emphasizes intuitive navigation and visual engagement, incorporating team logos, color schemes, and interactive elements. Features include real-time game scores (ESPN API), a notification system, fan-finder, and administrative analytics. Additional functionalities include:
- **Venue QR Code Check-in**: Unique QR codes for attendance verification, earning users points and badges.
- **Pricing Model**: Core features are free; an optional "Pro" tier ($2.99/month or $29.99/year) offers premium perks like VIP badge, 3x points multiplier, priority party placement (Pro parties sorted to top of city listings), custom themes, advanced analytics, and priority support. Ads are shown to all users (display-only, non-clickable).
- **Rewards & Points System**: Users earn points for engagement (creating/attending parties, invites, check-ins), with Pro users receiving a 3x multiplier. Points are used for raffle entries for grand prizes.
- **Seed Data System**: Admin-controlled demo data seeding via `server/seed.js`. Creates 77 realistic users (First L. name format, pravatar photos, realistic bios), 46 watch parties (30 future, 13 past, 3 today/tomorrow), 17 real venues (Boca Raton/Delray Beach/Boynton Beach/Fort Lauderdale), ~200 chat messages (coordination/game talk/social/new people), predictions, friendships, venue follows/reviews, party reviews, and check-ins. Managed via Admin Panel > Seed Data tab. Seed users use `@huddleup-seed.demo` emails for safe cleanup. Users have realistic points spread (25-990), founder badges for 10 users, hotstreak badges for 5 users, and join dates spread over 30 days.
- **PWA Install**: Full Progressive Web App support with install banner, iOS instructions modal, hamburger menu install option, service worker (`public/sw.js`), and manifest (`public/manifest.json`).
- **Sponsor System**: Features 5 sponsor slots per sport league (Standard and Premium tiers) with dedicated banner display.
- **Main Brand Banner**: A fixed "HUDDLE UP | FIND YOUR CREW. WATCH THE GAME." banner at the top of all pages (replaces sponsor banner).
- **Fantasy League Integration**: Allows users to create and join fantasy leagues for various sports and platforms, with team management, standings, commissioner controls, and party integration. Includes a "Trash Talk" chat mode.
- **Community & Engagement**:
    - **Party Reviews & Ratings**: Users can rate parties on atmosphere, food/drinks, and crowd energy.
    - **Team Chat Rooms**: Sport-specific chat rooms for fans to connect.
    - **User Profiles**: Public profiles displaying fan scores, badges, stats, and activity timelines.
    - **Trending Feed**: Shows hot parties, venues, and popular sports.
    - **Game & Rivalry Alerts**: Customizable notifications for team games and classic rivalries.
    - **Event Tickets & Promoted Parties**: Hosts can set up ticketing and promote parties.
    - **Party Highlights/Recaps**: Hosts can create textual and photo highlights for past parties.
- **Affiliate Program**: Influencers get unique codes that give users 50% off Pro ($1.50/mo instead of $2.99). Influencers earn recurring commissions (30% default) on each paying user. Managed via admin panel with public influencer dashboards.
- **Featured Venue System**: Two venue tiers (Base at $29.99/month and Featured at $49.99/month) with Featured venues receiving priority placement, badges, and enhanced visibility. No annual pricing option for venues. 3-month free trial for new venues (`venue_trial_ends_at TIMESTAMPTZ` on venues table, set on claim approval and venue signup). VenueHub "Plans & Pricing" tab shows trial banner with countdown, both Base and Featured tier cards with subscribe buttons, and feature comparison table.
- **Fan vs. Venue Account System**: Distinct signup flows and dashboards for Fan and Venue users, with specific features tailored to each role.
- **Interactive Spotlight Tour**: A step-by-step walkthrough of key app features for new users.
- **Welcome Modal (Soft Launch)**: Full-screen overlay shown once after first signup. Highlights founding member perks (Lifetime Pro, Founder badge, feature shaping), sets expectations for soft launch (Boca Raton, low attendance, weekly updates). "Let's Go!" button marks `onboarding_completed=true` in DB via `POST /api/users/onboarding-complete`, then triggers 4-slide tutorial (find parties, join & chat, QR check-in, predictions). Never shows on subsequent logins. DB column: `users.onboarding_completed` (BOOLEAN).
- **Game Prediction System**: Users predict game winners with a confidence slider (1-10). Points: base 50 × confidence. Streak bonuses at 5 (+100) and 10 (+250) correct. Pro users get 3x multiplier. Features: prediction interface on game detail pages, dedicated "Predictions" screen with stats/history/leaderboard, admin panel to resolve games and award points. Database tables: `predictions`, `prediction_streaks`. Routes: `server/routes/predictions.js`.
- **Push Notifications (Web Push API)**: Real push notifications via VAPID keys and `web-push`. Triggers: party reminders (1hr before), prediction reminders (30min before), prediction results, streak milestones, friend joins party. Rate limited (5/day), quiet hours (10PM-8AM), respects per-type preferences. Notification Settings screen accessible from hamburger menu. Permission banner on second visit. Backend: `server/routes/push.js`, scheduler in `server/scoreChecker.js`. DB tables: `push_subscriptions`, `notification_preferences`.
- **Calendar Integration**: "Add to Calendar" button on party cards generates .ics file download or opens Google Calendar/Outlook/Yahoo Calendar links. Server endpoint: `GET /api/parties/:id/calendar`. Client-side URL generation for Google/Outlook/Yahoo.
- **Friend System & Invites**: Friend requests, accept/decline, user search (`GET /api/users/search?q=`), friend activity feed, referral link sharing via native share API, "friends attending" indicator on party cards. Invite Friends screen in hamburger menu. DB: `friendships` table. Routes: `server/routes/friends.js`.
- **Browse All Parties**: Dedicated party discovery screen accessible from hamburger menu and home screen hero banner. Shows all upcoming parties (14-day window + live) with time-based grouping (Happening Now, Today, Tomorrow, This Weekend, This Week, Next Week, Coming Up). Filters: sport pills, city dropdown, search (teams/venues/hosts), sort (Soonest/Popular/Newest/Closest to Me). Collapsible sections, filter chips with remove, results count, empty state. Join Party buttons on cards, friends attending indicator, calendar/share actions. Filter persistence via localStorage. Smart defaults: uses current city and location-aware sort.
- **Advanced Search & Filters**: Filter panel on games screen with date filters (Today, Tomorrow, This Weekend, This Week, Next Week), sort options (Soonest, Most Popular, Newest), active filter chips with remove, results count display, empty state with filter suggestions.
- **Dedicated Venue Pages**: Full venue detail screen with 5 tabs (Upcoming Parties, Past Parties, About, Reviews, Photos). Venue header with verified badge, address, phone, website. Follow/unfollow venues. Venue reviews with star ratings (overall, atmosphere, service, value). Photo gallery. Stats (total parties, fans, avg attendance, popular sport). DB: `venue_follows`, `venue_reviews` tables. Routes: `server/routes/venues.js`.
- **Hot Parties Algorithm**: Calculates hot score based on recent check-ins, total attendees, chat activity, and time urgency. Parties with score >100 get `is_trending=true`. Updated every 5 minutes via `server/scoreChecker.js`. API: `GET /api/parties/hot`. Trending section on home screen with pulsing fire badges. DB columns: `parties.hot_score`, `parties.is_trending`.
- **Last Chance Section**: Shows parties starting within 2 hours with live countdown timers. API: `GET /api/parties/last-chance`. Displayed on home screen with red urgency styling and LIVE/countdown badges. Auto-hides when no qualifying parties exist.
- **Check-in Fireworks Animation**: Uses `canvas-confetti` library. 2-second fireworks burst (left+right sides) with brand colors (#1E90FF, #FFD700, #FF4757, #10B981) triggered on successful QR check-in. Only fires for new check-ins (not "already checked in").
- **Nearby Parties Map**: Interactive Leaflet map on Browse Parties screen using `react-leaflet` + dark CartoDB tiles. Toggle show/hide. Custom pulsing markers (red=live, blue=upcoming). Popup with matchup, venue, distance (Haversine), attendee count, View Party button. API: `GET /api/parties/nearby?lat=&lng=&radius=`. Fallback to Boca Raton coordinates. DB columns: `venues.latitude`, `venues.longitude`.
- **Soft Launch Banner**: Prominent gradient banner on home page announcing Boca Raton soft launch. Shows real-time stats (users, parties, venues). First 100 members get lifetime Pro + "Founding Member" badge. Dismiss persists 7 days via localStorage. DB columns: `users.is_founder` (BOOLEAN), `users.founder_number` (INTEGER 1-100). Endpoints: `GET /api/users/soft-launch-stats`, `POST /api/users/claim-founder`. Founder badge (gold #F5B400, 11px bold, ⭐ icon) shown on: user profile, public profiles, party attendee lists, party chat messages, team chat messages, prediction leaderboards. Auto-claimed on signup.
- **Bottom Navigation Bar**: Fixed bottom nav on all logged-in screens with 5 tabs: Home, Browse, Crew (with friend request/DM badge), Rewards, Me (with notification badge). Active tab highlighted in #1E90FF blue. z-[50], bg-[#151A22]. Grid layout (grid-cols-5). All screen containers have pb-[72px] to prevent content overlap.
- **Simplified Top Header**: Only logo (left) + profile photo with notification badge (right). Removed Crown, Bell, Users, Gift, and Hamburger icons from top bar. Clean 2-item layout.
- **Profile Page Menu**: Consolidated settings hub — Notifications (with badge), My Favorite Teams (with count), Settings, Help & FAQ, Install App. Logout button at bottom of profile page. Title "MY PROFILE" centered in sticky header.
- **First-Time Tutorial**: 3-step overlay (Welcome → How It Works → Find Parties) shown on first login via localStorage 'huddle_tutorial_done'. z-[95]. Skippable. Separate from the prelaunch modal and onboarding overlay.
- **Home Screen Primary Actions**: Dual side-by-side buttons: "Create Party" (green, links to games screen) and "Find Parties" (orange, links to browse, shows dynamic party count). Replaced single "Find Watch Parties" CTA.
- **Ad Carousel**: Swipeable carousel on home screen between primary actions and quick actions. Shows 5 sponsor slots (NFL, NBA, MLB, NHL, Main Homepage). Touch swipe navigation with CSS transitions. Pagination dots with ARIA labels. "Become a Sponsor" CTA links to mailto:sponsors@huddleupusa.com. State: `adSlideIndex`, `adTouchStartRef`.
- **Home Screen Quick Actions**: Location badge with city name and "Change" button, and 2x2 grid of quick action cards: Featured (gold highlighted, links to trending), My Teams (with count badge), My Parties (with upcoming count badge), Near Me (with party count badge).
- **Empty States**: Friendly dashed-border empty states with large icons, encouraging text, and action buttons for BrowseParties ("No Parties Found"), MyParties ("No Upcoming Parties"), and other list screens.
- **Improved Join Buttons**: Party card Join buttons use gradient styling (#1E90FF → #0066CC), larger size (py-3.5), shadow effects, and "Join This Party 🎉" text.

## External Dependencies
- **PostgreSQL**: Database.
- **Express**: Backend web framework.
- **React**: Frontend library.
- **Vite**: Frontend build tool.
- **Tailwind CSS**: Styling.
- **Lucide React**: Icons.
- **bcrypt**: Password hashing.
- **express-session** & **connect-pg-simple**: Session management.
- **ESPN API**: Live game scores and sports data.
- **Twilio**: SMS notifications.
- **Google Maps API**: Maps and directions.
- **Replit Object Storage (GCS-backed)**: Image storage.
- **web-push**: Web Push API for browser push notifications (VAPID keys in env).
- **canvas-confetti**: Check-in celebration fireworks animation.
- **react-leaflet** & **leaflet**: Interactive map for nearby party discovery.
