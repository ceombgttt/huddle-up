# Huddle Up - Find Watch Parties

## Overview
Huddle Up is a full-stack web application designed to connect sports fans by facilitating the discovery and organization of sports watch parties. It enables users to find local venues, create parties, and engage with a community of enthusiasts, ultimately enhancing the sports-watching experience. Key features include user authentication, comprehensive party management, venue claiming, and administrative controls. The project aims to cultivate a vibrant community around live sports viewing, providing a complete solution for fans to connect and enjoy games together.

## User Preferences
I prefer detailed explanations and iterative development. Ask before making major changes. Do not make changes to the `public/` folder.

## System Architecture
The application features a single Express server handling both API services and serving a React frontend. It uses PostgreSQL as its primary database and implements a custom email/password authentication system secured with bcrypt and express-session. Styling is managed using Tailwind CSS, custom CSS, and Lucide React icons. The project is organized into `server/` for backend logic and `src/` for frontend components. User-uploaded images are stored using Replit's GCS-backed object storage with presigned URLs.

The UI/UX prioritizes intuitive navigation and visual engagement, incorporating team logos, specific color schemes, and interactive elements. Core functionalities include real-time game scores, a notification system, and administrative analytics. The platform supports a reward and points system for user engagement, a PWA for installability, and a sponsor system with different tiers. It distinguishes between Fan and Venue accounts, each with tailored features. Noteworthy features include:

-   **Venue QR Code Check-in**: For attendance verification and point accumulation.
-   **Pricing Model**: Core features are free, with an optional "Pro" tier offering premium perks and a 3x points multiplier. Ads are displayed to all users.
-   **Seed Data System**: Admin-controlled seeding for realistic demo data, including users, parties, venues, chat messages, and social interactions.
-   **Compact Header & Brand Gradient Background**: Consistent visual branding and navigation elements.
-   **Ad Carousel**: Swipeable home screen carousel for sponsor visibility.
-   **Fantasy League Integration**: Allows users to create, join, and manage fantasy leagues with integrated party features and a "Trash Talk" chat.
-   **Community & Engagement**: Features like party reviews, team chat rooms, user profiles, trending feeds, and customizable alerts.
-   **Affiliate Program**: Influencer-based marketing with unique codes and recurring commissions.
-   **Featured Venue System**: Tiered system for venues offering enhanced visibility and trial periods.
-   **Interactive Spotlight Tour & Welcome Modal**: Onboarding tools for new users, highlighting key features and soft launch benefits.
-   **Game Prediction System**: Users predict game outcomes with confidence levels, earning points and streak bonuses.
-   **Push Notifications**: Web Push API for timely reminders and updates.
-   **Calendar Integration**: "Add to Calendar" functionality for parties.
-   **Friend System & Invites**: Social features including friend requests, activity feeds, and referral sharing.
-   **Browse All Parties**: Dedicated screen with advanced filters, time-based grouping, and smart defaults.
-   **Dedicated Venue Pages**: Comprehensive detail screens for venues, including reviews, photos, and follow functionality.
-   **Hot Parties Algorithm**: Dynamically identifies trending parties based on engagement metrics.
-   **Last Chance Section**: Highlights parties starting soon with live countdowns.
-   **Check-in Fireworks Animation**: Visual feedback for successful check-ins.
-   **Nearby Parties Map**: Interactive map using Leaflet for discovering local parties.
-   **Soft Launch Banner**: Displays soft launch status and founder perks, including a "Founding Member" badge.
-   **Bottom Navigation Bar**: Fixed navigation for logged-in users with key sections.
-   **Profile Page Menu**: Consolidated settings and personal information hub.
-   **Home Screen Primary Actions & Quick Actions**: Streamlined user entry points and contextual shortcuts.
-   **Empty States**: User-friendly design for screens with no content.
-   **Improved Join Buttons**: Enhanced visual styling for party join actions.
-   **Live Score Celebrations**: When a user's favorite team scores during a live game, the app fires team-colored confetti, shows a popup with score details (THREE!/TOUCHDOWN!/SCORED!), and triggers haptic vibration. Detects score changes via the 60-second ESPN polling cycle. Toggle and test button in Notification Settings. Respects prefers-reduced-motion.
-   **Manual Celebration Button**: Floating button on game detail screen with 15-second crowd cheer audio, confetti, and haptic feedback. Uses `/public/crowd-cheer.mp3` (15s audio file).
-   **Intro Splash Screen**: Cinematic 5-second animated intro on login/signup. Shield logo rises with glow trail, "FIND YOUR CREW." and "WATCH THE GAME." appear letter-by-letter with gradient text, dramatic glow pulse, smooth fade-out. Skip button and "Don't show again" option (uses `skipIntros` localStorage key). z-index: 200.
-   **Find Parties Page**: Party-focused map page (`findParties` screen) with Leaflet dark map showing party locations with sport-specific pins, "FIND YOUR CREW" banner, Near Me/Enter City buttons, live parties section (red borders, LIVE badge), and upcoming parties list. Map pins are red for live games, blue with sport emoji for upcoming. Accessible from home screen "Find Parties" button. Clicking a party navigates to `gameDetail`.
-   **Find Venues Page**: Venue-focused discovery page (`findVenues` screen) with Leaflet dark map, venue pins (color-coded by party status), "THE BEST PLACE TO WATCH THE GAME" banner, Near Me/Enter City search buttons, and scrollable venue list with category icons, star ratings, party info, and stats. Accessible from hamburger menu and home screen "Venues" quick action.
-   **Venue Database**: 207 total venues across Boca Raton (83), Delray Beach (68), Boynton Beach (52), Fort Lauderdale (4). Bulk venue SQL in `server/seed_venues.sql` (idempotent with WHERE NOT EXISTS). All venues have coordinates, city, phone, capacity, type, and verified=true.
-   **Venue Signup QR / Contact System**: Venues generate a permanent signup QR code (distinct from check-in QR). Customers scan → land on `/?venueSignup=CODE` → if logged in, auto-linked; if not, shown a venue banner on login/signup. Connected users appear in venue's "Contacts" tab in Venue Hub. Venue can invite selected contacts to any of their parties. New DB tables: `venue_contacts`. New columns: `venues.signup_qr_code`, `venues.qr_code_enabled`, `venues.total_signups_via_qr`, `users.referred_by_venue_id`, `users.signup_qr_code`. API routes: `server/routes/venueContacts.js` mounted at `/api/venue-contacts`.

## Performance
-   **Gzip compression**: `compression` middleware compresses all responses (~70-88% size reduction for API/JS/CSS).
-   **Bundle splitting**: Vite splits vendor chunks (react, leaflet, html5-qrcode, canvas-confetti) for better caching.
-   **Static asset caching**: Production serves `/assets` with 1-year immutable cache headers (hashed filenames). `index.html`, `sw.js`, `manifest.json` use `no-cache`.
-   **Loading spinner**: Inline HTML spinner in index.html shows instantly while JS bundle loads.
-   **Loading skeletons**: Home screen shows animated skeleton cards while initial data loads (`initialDataLoaded` state).
-   **Parallel initial load**: All startup API calls (games, parties, venues, user data, hot parties, banners, etc.) fire in parallel via single `Promise.allSettled`.
-   **N+1 query fix**: Party attendees fetched in one batched query (`ANY($1::uuid[])`) instead of per-party loop.
-   **Background geocoding**: Venue geocoding runs on startup + every 10 minutes via `startBackgroundGeocoding()`, not in request path.
-   **Toast notifications**: In-app toast system (`showToast(message, type)`) replaced all 150 browser `alert()` calls. Types: `'success'` (green), `'error'` (red), `'info'` (blue). Auto-dismiss after 3.5s. Passed as prop to `VenueQrSection`, `SubscriptionSection`, `SmsFieldsSection`.
-   **QR security**: Venue QR routes (`/venue/generate`, `/venue/qr`, `/venue/stats`) verify venue ownership via `verifyVenueOwnership()`.
-   **Calendar auth**: `GET /parties/:id/calendar` requires authentication.

## External Dependencies
-   **PostgreSQL**: Database.
-   **Express**: Backend web framework.
-   **compression**: Gzip/deflate compression middleware.
-   **React**: Frontend library.
-   **Vite**: Frontend build tool.
-   **Tailwind CSS**: Styling framework.
-   **Lucide React**: Icons.
-   **bcrypt**: Password hashing.
-   **express-session** & **connect-pg-simple**: Session management.
-   **ESPN API**: Sports data.
-   **Replit Object Storage (GCS-backed)**: Image storage.
-   **web-push**: Web Push API for notifications.
-   **canvas-confetti**: For celebratory animations.
-   **react-leaflet** & **leaflet**: Interactive map components.