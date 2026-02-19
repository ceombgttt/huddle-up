# Huddle Up - Find Watch Parties

## Overview
Huddle Up is a full-stack web application designed to connect sports fans by facilitating the discovery and organization of sports watch parties. It enables users to find local venues hosting games, create their own watch parties, and interact with a community of fellow enthusiasts. The platform aims to enhance the sports-watching experience by making it easier for fans to gather, socialize, and cheer for their favorite teams together. Key capabilities include user authentication, party creation and management, venue claiming, and administrative controls.

## User Preferences
I prefer detailed explanations and iterative development. Ask before making major changes. Do not make changes to the `public/` folder.

## System Architecture
The application employs a single Express server to serve both the API and the React frontend. In development, it uses Vite in middleware mode, while in production, Express serves static built files. The backend utilizes a PostgreSQL database for data persistence and a custom email/password authentication system secured with bcrypt and express-session. Tailwind CSS is used for styling, complemented by custom CSS and Lucide React for icons. The project structure is organized into `server/` for backend logic (routes, DB) and `src/` for frontend components and API client. Object storage, specifically Replit's built-in GCS-backed storage, is used for managing user-uploaded content like profile pictures and venue images via presigned URLs.

The UI/UX focuses on intuitive navigation and a visually engaging experience for sports fans, featuring team logos, color schemes, and interactive elements like maps and chat. Key features include real-time game scores from the ESPN API, a comprehensive notification system for party updates and score alerts, a fan-finder mechanism for social interaction, and robust administrative analytics for monitoring platform activity. The system also supports SMS notifications via Twilio for personalized party alerts and a rewards system to incentivize user engagement.

## Venue QR Code Check-in System
Venues get unique QR codes for attendance verification. Venue owners generate/manage QR codes from their dashboard. Users scan the QR code URL with their phone camera to check in, earning 75 points and a "Verified Attendee" badge. The system auto-detects active parties at the venue for the user. Venue owners see real turnout stats including total/verified check-ins and unique visitors. Tables: venue_qr_codes (venue_id, token, active). Routes at /api/qr/*. Frontend: VenueQrSection component (outside App), QrCheckinScreen (inside App). URL pattern: /checkin/:token.

## Rewards & Points System
Users earn points for engagement: creating parties (50 pts), attending parties (25 pts), inviting friends (100 pts), and checking in at venues (75 pts). Points can be redeemed for rewards like free drinks, subscription months, merch discounts, VIP badges, and more. Backend uses transactional point deduction with SELECT FOR UPDATE for concurrency safety. Points are awarded automatically in existing party/invite flows. Check-in is available on party cards for attending members. Tables: user_points, points_history, rewards, reward_redemptions, venue_checkins. Routes at /api/rewards/*.

## Sponsor System (Per-Sport Slots)
5 sponsor slots per sport league. Slots 1-4 are Standard tier ($99.99/mo, single-sport placement). Slot 5 is Premium Multi-Sport tier ($299.99/mo, can target multiple sports). Sponsors subscribe via Stripe, auto-get a sponsor record, and manage their banner (name, tagline, logo, website, target sports) from the Sponsor Dashboard. Demo example sponsors with generated logos are shown for NFL and NBA to visualize the system. Empty slots show "Available". Real sponsors replace demo/empty slots. Banner design: large format with sponsor image covering ~45% left side, big bold text (2xl-3xl) on the right, rotating through all 5 slots with dot indicators. No pricing shown on banners. Backend: server/routes/sponsors.js. DB columns: sponsor_tier (standard/premium), slot_number, target_sports[]. Frontend: DEMO_SPONSORS array (5 per NFL, 5 per NBA), getSponsorsForSport() function, SLOT_STYLES array with 5 color themes. Admin manages all sponsors from admin panel. public/demo-sponsors/ contains example logo images.

## Main Sponsor (Top Banner)
The Main Sponsor is the most premium placement - a fixed orange/amber banner at the very top of all pages (above navigation) for logged-in users. Shows sponsor logo (w-10 h-10), name, tagline, and "MAIN SPONSOR" label. Only one Main Sponsor at a time across the entire platform. When no real main sponsor is active, a demo example (Victory Sports Drink) is shown with an "Advertise" button. The MainSponsorBanner component is defined at the top level and rendered via fixed positioning (z-60). Banner height is h-14 (56px). All screen containers have pt-14 and sticky headers use top-14 to account for the banner height. Demo logo: public/demo-sponsors/victory-sports-main.png.

## Fantasy League Integration
Manual fantasy league tracking system integrated into the platform. Users can create and join fantasy leagues for any sport (NFL, NBA, MLB, NHL, Soccer) across platforms (ESPN, Yahoo, Sleeper, Other). Features include: league creation with auto-generated invite codes, team management, player roster tracking (name, position, NFL team, starter status), standings/leaderboard with W-L records and points, commissioner controls (delete league), and party integration via party_fantasy_links table. Chat includes "Trash Talk" mode (message_type='fantasy') with special orange/red gradient styling and trophy icon toggle. Fantasy Hub accessible via orange Trophy button in main nav bar. Tables: fantasy_leagues, fantasy_teams, fantasy_players, party_fantasy_links. Routes at /api/fantasy/*. Frontend: renderFantasyScreen function in App.jsx. Platform badge colors: ESPN=red, Yahoo=purple, Sleeper=green, Other=gray. Access control enforces league membership for viewing details.

## Community & Engagement Features (New)
Several new community features have been added:

### Party Reviews & Ratings
Users can rate parties on atmosphere, food/drinks, and crowd energy (1-5 stars). Reviews include text comments. Backend: server/routes/reviews.js. Routes at /api/reviews/*. Tables: party_reviews (party_id, user_id, atmosphere, food_drinks, crowd_energy, comment).

### Team Chat Rooms
Team-specific chat rooms grouped by sport. Users can join rooms for their favorite teams and chat with other fans. Backend: server/routes/teamchat.js. Routes at /api/team-chats/*. Tables: team_chat_rooms, team_chat_messages. Frontend: renderTeamChatsScreen in App.jsx. Accessible via teal "Team Chat" button in nav bar.

### User Profiles with Stats
Public user profiles showing fan score, badges, stats (parties hosted/attended, reviews given, friends count), and activity timeline. Fan score = (parties_hosted*10) + (parties_attended*5) + (reviews_given*3) + (friends_count*2) + (total_points/10). 8 badge types: Party Starter, Social Butterfly, Regular, Superfan, Critic, Popular, VIP, Pioneer. Backend: server/routes/profile.js. Routes at /api/profile/*.

### Trending Feed
Shows hot parties (most attendees in next 7 days), hot venues (most parties in last 30 days), and popular sports. Promoted parties appear at top. Backend: server/routes/trending.js. Routes at /api/trending/*. Frontend: renderTrendingScreen in App.jsx. Accessible via pink "Trending" button in nav bar.

### Game Alerts & Rivalry Alerts
Notification preferences for team alerts, rivalry alerts, suggested parties, and game reminders. Team alerts notify when favorite teams play soon. Rivalry alerts for classic matchups (e.g., Yankees vs Red Sox, Lakers vs Celtics). Seeded with 11 default rivalry pairs. Backend: server/routes/alerts.js. Routes at /api/alerts/*. Tables: notification_preferences, rivalry_pairs.

### Event Tickets & Promoted Parties
Hosts can set up ticketing (price, capacity) and promote parties. Users can purchase tickets (simplified MVP without Stripe). My Tickets screen shows purchased tickets. Backend: server/routes/tickets.js. Routes at /api/tickets/*. Tables: party_tickets, ticket_purchases, promoted_parties.

### Party Highlights/Recaps
Hosts can create highlights/recaps for past parties with text and photos. Recent highlights appear in the trending feed. Backend: server/routes/trending.js (highlights endpoints). Table: party_highlights.

## External Dependencies
- **PostgreSQL**: Primary database for all application data.
- **Express**: Backend web framework.
- **React**: Frontend library.
- **Vite**: Frontend build tool.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.
- **bcrypt**: Password hashing.
- **express-session** & **connect-pg-simple**: Session management.
- **ESPN API**: For live game scores, team data, and sports information.
- **Twilio**: For SMS text notifications.
- **Google Maps API**: For interactive venue maps and directions.
- **Replit Object Storage (GCS-backed)**: For storing user and venue images.