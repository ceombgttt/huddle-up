# Huddle Up - Find Watch Parties

## Overview
Huddle Up is a full-stack web application connecting sports fans by facilitating the discovery and organization of sports watch parties. It enables users to find local venues, create parties, and engage with a community of enthusiasts. The platform aims to enhance the sports-watching experience by making it easier for fans to gather and socialize. Key capabilities include user authentication, party management, venue claiming, and administrative controls. The project seeks to create a vibrant community around live sports viewing, offering a comprehensive solution for fans to connect and enjoy games together.

## User Preferences
I prefer detailed explanations and iterative development. Ask before making major changes. Do not make changes to the `public/` folder.

## System Architecture
The application uses a single Express server for both API and React frontend, serving static built files in production and utilizing Vite in development. PostgreSQL is the primary database. Authentication is handled by a custom email/password system secured with bcrypt and express-session. Styling uses Tailwind CSS, custom CSS, and Lucide React icons. The project is structured with `server/` for backend logic and `src/` for frontend components. Object storage via Replit's GCS-backed storage manages user-uploaded images using presigned URLs.

The UI/UX emphasizes intuitive navigation and visual engagement, incorporating team logos, color schemes, and interactive elements. Features include real-time game scores (ESPN API), a notification system, fan-finder, and administrative analytics. Additional functionalities include:
- **Venue QR Code Check-in**: Unique QR codes for attendance verification, earning users points and badges.
- **Pricing Model**: Core features are free; an optional "Pro" tier ($2.99/month or $29.99/year) offers premium perks like an ad-free experience, VIP badge, 2x points multiplier, priority party placement (Pro parties sorted to top of city listings), custom themes, advanced analytics, and priority support.
- **Rewards & Points System**: Users earn points for engagement (creating/attending parties, invites, check-ins), with Pro users receiving a 2x multiplier. Points are used for raffle entries for grand prizes.
- **Sponsor System**: Features 5 sponsor slots per sport league (Standard and Premium tiers) with dedicated banner display.
- **Main Sponsor Banner**: A prominent, fixed banner at the top of all pages for the most premium advertising placement.
- **Fantasy League Integration**: Allows users to create and join fantasy leagues for various sports and platforms, with team management, standings, commissioner controls, and party integration. Includes a "Trash Talk" chat mode.
- **Community & Engagement**:
    - **Party Reviews & Ratings**: Users can rate parties on atmosphere, food/drinks, and crowd energy.
    - **Team Chat Rooms**: Sport-specific chat rooms for fans to connect.
    - **User Profiles**: Public profiles displaying fan scores, badges, stats, and activity timelines.
    - **Trending Feed**: Shows hot parties, venues, and popular sports.
    - **Game & Rivalry Alerts**: Customizable notifications for team games and classic rivalries.
    - **Event Tickets & Promoted Parties**: Hosts can set up ticketing and promote parties.
    - **Party Highlights/Recaps**: Hosts can create textual and photo highlights for past parties.
- **Affiliate Program**: A paid program for partners to earn commissions for user signups, managed via an admin panel.
- **Featured Venue System**: Two venue tiers (Regular and Featured) with Featured venues receiving priority placement, badges, and enhanced visibility.
- **Fan vs. Venue Account System**: Distinct signup flows and dashboards for Fan and Venue users, with specific features tailored to each role.
- **Interactive Spotlight Tour**: A step-by-step walkthrough of key app features for new users.

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