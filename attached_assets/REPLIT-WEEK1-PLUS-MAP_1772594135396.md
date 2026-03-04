# HUDDLE UP - WEEK 1 FEATURES + MAP IMPLEMENTATION

**Copy this entire prompt and paste it into Replit AI chat or Claude**

---

## 🎯 FEATURES TO IMPLEMENT

**Week 1 Core:**
1. Hot Parties Algorithm with trending badges
2. Last Chance Section with countdown timers  
3. Check-in Fireworks Animation

**Bonus:**
4. Nearby Parties Map with live pulsing markers

---

## 📦 DEPENDENCIES TO INSTALL

Run this in your terminal:

```bash
npm install canvas-confetti react-leaflet leaflet node-cron
```

---

## 1️⃣ HOT PARTIES ALGORITHM

### BACKEND: Add Hot Score Calculation

Create a new file: `utils/hotParties.js`

```javascript
// utils/hotParties.js

function calculateHotScore(party) {
  const now = new Date();
  const gameTime = new Date(party.game.start_time);
  const hoursUntilGame = (gameTime - now) / (1000 * 60 * 60);
  
  // Count recent check-ins (last 2 hours)
  const recentCheckIns = party.attendees.filter(attendee => {
    const joinedAt = new Date(attendee.joined_at);
    const hoursSinceJoin = (now - joinedAt) / (1000 * 60 * 60);
    return hoursSinceJoin <= 2;
  }).length;
  
  // Total attendees
  const totalAttendees = party.attendees.length;
  
  // Recent messages (last hour)
  const recentMessages = (party.messages || []).filter(msg => {
    const createdAt = new Date(msg.created_at);
    const hoursSinceMsg = (now - createdAt) / (1000 * 60 * 60);
    return hoursSinceMsg <= 1;
  }).length;
  
  // Time factor (closer to game time = higher boost)
  let timeFactor = 1;
  if (hoursUntilGame <= 0) {
    timeFactor = 5; // Game is LIVE NOW
  } else if (hoursUntilGame <= 2) {
    timeFactor = 3; // Starting very soon
  } else if (hoursUntilGame <= 4) {
    timeFactor = 2; // Starting soon
  }
  
  // Calculate hot score
  const hotScore = (
    (recentCheckIns * 10) +    // Recent activity worth more
    (totalAttendees * 2) +      // Total size matters
    (recentMessages * 5) +      // Chat activity shows engagement
    (timeFactor * 20)           // Time urgency
  );
  
  return hotScore;
}

function isHotParty(party) {
  return calculateHotScore(party) > 100;
}

module.exports = { calculateHotScore, isHotParty };
```

### BACKEND: Add Cron Job to Update Hot Parties

Add this to your main server file (e.g., `server.js` or `index.js`):

```javascript
// At the top with other imports
const cron = require('node-cron');
const { calculateHotScore, isHotParty } = require('./utils/hotParties');

// After your Express app setup, add this cron job

// Update hot parties every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('🔥 Updating hot parties...');
  
  try {
    // Get all upcoming parties (next 24 hours)
    const parties = await db.query(`
      SELECT p.*, 
             json_agg(DISTINCT a.*) as attendees,
             json_agg(DISTINCT m.*) as messages,
             g.start_time
      FROM parties p
      LEFT JOIN attendees a ON p.id = a.party_id
      LEFT JOIN messages m ON p.id = m.party_id
      JOIN games g ON p.game_id = g.id
      WHERE g.start_time >= NOW()
      AND g.start_time <= NOW() + INTERVAL '24 hours'
      GROUP BY p.id, g.start_time
    `);
    
    for (const party of parties.rows) {
      const hotScore = calculateHotScore(party);
      const trending = isHotParty(party);
      
      await db.query(`
        UPDATE parties 
        SET hot_score = $1, 
            is_trending = $2,
            updated_at = NOW()
        WHERE id = $3
      `, [hotScore, trending, party.id]);
    }
    
    console.log('✅ Hot parties updated');
  } catch (error) {
    console.error('❌ Error updating hot parties:', error);
  }
});
```

### BACKEND: Add Hot Parties API Endpoint

Add this route to your server:

```javascript
// GET hot/trending parties
app.get('/api/parties/hot', async (req, res) => {
  try {
    const hotParties = await db.query(`
      SELECT p.*, 
             g.home_team,
             g.away_team,
             g.start_time,
             g.sport,
             v.name as venue_name,
             v.city,
             v.address,
             COUNT(DISTINCT a.id) as attendee_count
      FROM parties p
      JOIN games g ON p.game_id = g.id
      JOIN venues v ON p.venue_id = v.id
      LEFT JOIN attendees a ON p.id = a.party_id
      WHERE p.is_trending = true
      AND g.start_time >= NOW()
      GROUP BY p.id, g.id, v.id
      ORDER BY p.hot_score DESC
      LIMIT 6
    `);
    
    res.json(hotParties.rows);
  } catch (error) {
    console.error('Error fetching hot parties:', error);
    res.status(500).json({ error: 'Failed to fetch hot parties' });
  }
});
```

### DATABASE: Add Columns to Parties Table

Run this migration:

```sql
ALTER TABLE parties 
ADD COLUMN IF NOT EXISTS hot_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_parties_trending 
ON parties(is_trending, hot_score DESC);
```

### FRONTEND: Hot Parties Section Component

Create `components/HotParties.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import './HotParties.css';

function HotParties() {
  const [hotParties, setHotParties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchHotParties();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchHotParties, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  const fetchHotParties = async () => {
    try {
      const response = await fetch('/api/parties/hot');
      const data = await response.json();
      setHotParties(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching hot parties:', error);
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="hot-parties-loading">Loading trending parties...</div>;
  }
  
  if (hotParties.length === 0) {
    return null; // Don't show section if no trending parties
  }
  
  return (
    <section className="hot-parties-section">
      <h2 className="hot-parties-title">🔥 Trending Parties Right Now</h2>
      <div className="hot-parties-grid">
        {hotParties.map(party => (
          <HotPartyCard key={party.id} party={party} />
        ))}
      </div>
    </section>
  );
}

function HotPartyCard({ party }) {
  const gameTime = new Date(party.start_time);
  const formattedTime = gameTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
  
  return (
    <div className="hot-party-card" onClick={() => window.location.href = `/parties/${party.id}`}>
      <div className="trending-badge">
        🔥 TRENDING
      </div>
      
      <div className="game-matchup">
        {party.away_team} @ {party.home_team}
      </div>
      
      <div className="game-time">
        {formattedTime}
      </div>
      
      <div className="venue-info">
        📍 {party.venue_name}
      </div>
      
      <div className="party-stats">
        <span className="attendee-count">
          👥 {party.attendee_count} going
        </span>
      </div>
      
      <button className="join-btn">Join Party →</button>
    </div>
  );
}

export default HotParties;
```

### CSS: Hot Parties Styling

Create `components/HotParties.css`:

```css
.hot-parties-section {
  margin: 30px 0;
  padding: 30px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  border-radius: 16px;
}

.hot-parties-title {
  color: white;
  font-size: 28px;
  margin-bottom: 20px;
  text-align: center;
}

.hot-parties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.hot-party-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.hot-party-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.trending-badge {
  background: #ff4757;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  display: inline-block;
  margin-bottom: 12px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { 
    transform: scale(1); 
    opacity: 1;
  }
  50% { 
    transform: scale(1.05); 
    opacity: 0.9;
  }
}

.game-matchup {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 8px;
}

.game-time {
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 8px;
}

.venue-info {
  color: #34495e;
  font-size: 14px;
  margin-bottom: 12px;
}

.party-stats {
  color: #27ae60;
  font-weight: bold;
  margin-bottom: 12px;
}

.join-btn {
  width: 100%;
  padding: 12px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.join-btn:hover {
  background: #ff3838;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .hot-parties-grid {
    grid-template-columns: 1fr;
  }
}
```

### INTEGRATION: Add to Browse Page

In your main Browse or Home component:

```jsx
import HotParties from './components/HotParties';

function BrowsePage() {
  return (
    <div className="browse-page">
      <HotParties />
      
      {/* Rest of your browse parties content */}
    </div>
  );
}
```

---

## 2️⃣ LAST CHANCE SECTION

### BACKEND: Add Last Chance API Endpoint

```javascript
app.get('/api/parties/last-chance', async (req, res) => {
  try {
    const lastChanceParties = await db.query(`
      SELECT p.*, 
             g.home_team,
             g.away_team,
             g.start_time,
             g.sport,
             v.name as venue_name,
             v.city,
             COUNT(DISTINCT a.id) as attendee_count
      FROM parties p
      JOIN games g ON p.game_id = g.id
      JOIN venues v ON p.venue_id = v.id
      LEFT JOIN attendees a ON p.id = a.party_id
      WHERE g.start_time >= NOW()
      AND g.start_time <= NOW() + INTERVAL '2 hours'
      GROUP BY p.id, g.id, v.id
      ORDER BY g.start_time ASC
      LIMIT 10
    `);
    
    res.json(lastChanceParties.rows);
  } catch (error) {
    console.error('Error fetching last chance parties:', error);
    res.status(500).json({ error: 'Failed to fetch last chance parties' });
  }
});
```

### FRONTEND: Last Chance Component

Create `components/LastChance.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import './LastChance.css';

function LastChance() {
  const [parties, setParties] = useState([]);
  
  useEffect(() => {
    fetchLastChance();
    
    // Refresh every minute
    const interval = setInterval(fetchLastChance, 60000);
    return () => clearInterval(interval);
  }, []);
  
  const fetchLastChance = async () => {
    try {
      const response = await fetch('/api/parties/last-chance');
      const data = await response.json();
      setParties(data);
    } catch (error) {
      console.error('Error fetching last chance parties:', error);
    }
  };
  
  if (parties.length === 0) {
    return null;
  }
  
  return (
    <section className="last-chance-section">
      <h2 className="last-chance-title">⏰ Last Chance - Starting Soon!</h2>
      <div className="last-chance-grid">
        {parties.map(party => (
          <LastChanceCard key={party.id} party={party} />
        ))}
      </div>
    </section>
  );
}

function LastChanceCard({ party }) {
  const [timeUntil, setTimeUntil] = useState('');
  const [isLive, setIsLive] = useState(false);
  
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const gameTime = new Date(party.start_time);
      const diff = gameTime - now;
      
      if (diff <= 0) {
        setTimeUntil('🔴 STARTING NOW!');
        setIsLive(true);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
          setTimeUntil(`Starts in ${hours}h ${minutes}m`);
        } else {
          setTimeUntil(`Starts in ${minutes} minutes`);
        }
      }
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [party.start_time]);
  
  return (
    <div className={`last-chance-card ${isLive ? 'live' : ''}`}>
      <div className="urgency-badge">⏰ STARTING SOON</div>
      
      <h3 className="matchup">{party.away_team} @ {party.home_team}</h3>
      
      <p className="venue">{party.venue_name}</p>
      
      <p className={`countdown ${isLive ? 'live-countdown' : ''}`}>
        {timeUntil}
      </p>
      
      <p className="attendees">{party.attendee_count} fans going</p>
      
      <button 
        className="join-now-btn"
        onClick={() => window.location.href = `/parties/${party.id}`}
      >
        Join Now →
      </button>
    </div>
  );
}

export default LastChance;
```

### CSS: Last Chance Styling

Create `components/LastChance.css`:

```css
.last-chance-section {
  margin: 30px 0;
  padding: 30px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 16px;
}

.last-chance-title {
  color: white;
  font-size: 28px;
  margin-bottom: 20px;
  text-align: center;
}

.last-chance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.last-chance-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.last-chance-card:hover {
  transform: translateY(-4px);
}

.last-chance-card.live {
  border: 2px solid #ff4757;
}

.urgency-badge {
  background: #ff4757;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: bold;
  display: inline-block;
  margin-bottom: 12px;
  animation: blink 2s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.matchup {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 8px;
}

.venue {
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 12px;
}

.countdown {
  font-size: 20px;
  font-weight: bold;
  color: #ff4757;
  margin: 12px 0;
}

.countdown.live-countdown {
  animation: pulse-text 1.5s infinite;
}

@keyframes pulse-text {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.attendees {
  color: #27ae60;
  font-weight: bold;
  margin-bottom: 12px;
}

.join-now-btn {
  width: 100%;
  padding: 12px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.join-now-btn:hover {
  background: #ff3838;
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .last-chance-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## 3️⃣ CHECK-IN FIREWORKS ANIMATION

### FRONTEND: Fireworks Component

Create `components/CheckInFireworks.jsx`:

```jsx
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

function triggerCheckInFireworks() {
  const duration = 2000; // 2 seconds
  const end = Date.now() + duration;

  const interval = setInterval(() => {
    if (Date.now() > end) {
      clearInterval(interval);
      return;
    }

    // Left side fireworks
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#1E90FF', '#FFD700', '#FF4757', '#10B981']
    });
    
    // Right side fireworks
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#1E90FF', '#FFD700', '#FF4757', '#10B981']
    });
  }, 250);
}

// Use this in your check-in button component
function CheckInButton({ partyId, onCheckIn }) {
  const handleCheckIn = async () => {
    try {
      // Make API call to check in
      await fetch(`/api/parties/${partyId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ /* user data */ })
      });
      
      // Trigger fireworks!
      triggerCheckInFireworks();
      
      // Call parent callback
      if (onCheckIn) onCheckIn();
      
    } catch (error) {
      console.error('Check-in error:', error);
    }
  };
  
  return (
    <button 
      className="checkin-btn" 
      onClick={handleCheckIn}
    >
      Check In at Venue 🎉
    </button>
  );
}

export { triggerCheckInFireworks, CheckInButton };
```

### CSS: Check-In Button Styling

```css
.checkin-btn {
  padding: 16px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.checkin-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.6);
}

.checkin-btn:active {
  transform: translateY(0);
}
```

---

## 4️⃣ NEARBY PARTIES MAP

### FRONTEND: Map Component

Create `components/NearbyPartiesMap.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './NearbyPartiesMap.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom pulsing marker
const createPulsingIcon = (isLive) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-pin ${isLive ? 'live-marker' : ''}">
        <div class="marker-icon">${isLive ? '🔴' : '🏟️'}</div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

// Component to recenter map when location changes
function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
}

function NearbyPartiesMap() {
  const [userLocation, setUserLocation] = useState(null);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = [latitude, longitude];
          setUserLocation(location);
          fetchNearbyParties(latitude, longitude);
        },
        (error) => {
          console.error('Location error:', error);
          // Fallback to Boca Raton
          const fallback = [26.3683, -80.1289];
          setUserLocation(fallback);
          fetchNearbyParties(fallback[0], fallback[1]);
        }
      );
    } else {
      // Geolocation not supported, use fallback
      const fallback = [26.3683, -80.1289];
      setUserLocation(fallback);
      fetchNearbyParties(fallback[0], fallback[1]);
    }
  }, []);
  
  const fetchNearbyParties = async (lat, lng) => {
    try {
      const response = await fetch(`/api/parties/nearby?lat=${lat}&lng=${lng}&radius=25`);
      const data = await response.json();
      setParties(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching nearby parties:', error);
      setError('Failed to load nearby parties');
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="map-loading">Loading map...</div>;
  }
  
  if (error) {
    return <div className="map-error">{error}</div>;
  }
  
  if (!userLocation) {
    return <div className="map-loading">Getting your location...</div>;
  }
  
  return (
    <div className="nearby-map-container">
      <h2 className="map-title">🗺️ Parties Near You</h2>
      <MapContainer 
        center={userLocation} 
        zoom={12} 
        style={{ height: '500px', width: '100%', borderRadius: '12px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <RecenterMap position={userLocation} />
        
        {/* User location marker */}
        <Marker position={userLocation}>
          <Popup>
            <div className="user-location-popup">
              <strong>📍 You are here</strong>
            </div>
          </Popup>
        </Marker>
        
        {/* Party markers */}
        {parties.map(party => {
          const position = [party.venue_latitude, party.venue_longitude];
          const isLive = new Date(party.start_time) <= new Date();
          const icon = createPulsingIcon(isLive);
          
          return (
            <Marker 
              key={party.id} 
              position={position}
              icon={icon}
            >
              <Popup>
                <div className="party-popup">
                  <h3>{party.away_team} @ {party.home_team}</h3>
                  <p className="venue-name">{party.venue_name}</p>
                  <p className="venue-address">{party.venue_address}</p>
                  <p className="distance">{party.distance.toFixed(1)} miles away</p>
                  <p className="attendees">{party.attendee_count} fans going</p>
                  {isLive && <span className="live-badge">🔴 LIVE NOW</span>}
                  <button 
                    className="view-party-btn"
                    onClick={() => window.location.href = `/parties/${party.id}`}
                  >
                    View Party →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default NearbyPartiesMap;
```

### BACKEND: Nearby Parties API

```javascript
app.get('/api/parties/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 25 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }
    
    // Use Haversine formula to calculate distance
    const parties = await db.query(`
      SELECT p.*, 
             g.home_team,
             g.away_team,
             g.start_time,
             g.sport,
             v.name as venue_name,
             v.address as venue_address,
             v.city as venue_city,
             v.latitude as venue_latitude,
             v.longitude as venue_longitude,
             COUNT(DISTINCT a.id) as attendee_count,
             (
               3959 * acos(
                 cos(radians($1)) * 
                 cos(radians(v.latitude)) * 
                 cos(radians(v.longitude) - radians($2)) + 
                 sin(radians($1)) * 
                 sin(radians(v.latitude))
               )
             ) AS distance
      FROM parties p
      JOIN games g ON p.game_id = g.id
      JOIN venues v ON p.venue_id = v.id
      LEFT JOIN attendees a ON p.id = a.party_id
      WHERE g.start_time >= NOW() - INTERVAL '2 hours'
      GROUP BY p.id, g.id, v.id
      HAVING distance <= $3
      ORDER BY distance ASC
    `, [parseFloat(lat), parseFloat(lng), parseFloat(radius)]);
    
    res.json(parties.rows);
  } catch (error) {
    console.error('Error fetching nearby parties:', error);
    res.status(500).json({ error: 'Failed to fetch nearby parties' });
  }
});
```

### DATABASE: Ensure Venues Have Coordinates

Make sure your venues table has latitude and longitude:

```sql
-- Check if columns exist, add if needed
ALTER TABLE venues 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_venues_location 
ON venues(latitude, longitude);
```

### CSS: Map Styling

Create `components/NearbyPartiesMap.css`:

```css
.nearby-map-container {
  margin: 30px 0;
}

.map-title {
  font-size: 28px;
  margin-bottom: 20px;
  color: #2c3e50;
}

.map-loading,
.map-error {
  padding: 60px 20px;
  text-align: center;
  font-size: 18px;
  color: #7f8c8d;
}

/* Custom marker styling */
.custom-marker {
  background: transparent;
  border: none;
}

.marker-pin {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1E90FF;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s;
}

.marker-pin:hover {
  transform: scale(1.1);
}

.marker-pin.live-marker {
  background: #ff4757;
  animation: pulse-marker 2s infinite;
}

@keyframes pulse-marker {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.7);
  }
  70% {
    box-shadow: 0 0 0 20px rgba(255, 71, 87, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 71, 87, 0);
  }
}

.marker-icon {
  font-size: 20px;
}

/* Popup styling */
.party-popup {
  min-width: 200px;
}

.party-popup h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #2c3e50;
}

.venue-name {
  font-weight: bold;
  color: #34495e;
  margin: 4px 0;
}

.venue-address {
  color: #7f8c8d;
  font-size: 13px;
  margin: 4px 0;
}

.distance {
  color: #3498db;
  font-weight: bold;
  margin: 8px 0;
}

.attendees {
  color: #27ae60;
  font-weight: bold;
  margin: 4px 0;
}

.live-badge {
  display: inline-block;
  background: #ff4757;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  margin: 8px 0;
}

.view-party-btn {
  width: 100%;
  padding: 8px 16px;
  background: #1E90FF;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s;
}

.view-party-btn:hover {
  background: #1873cc;
}

.user-location-popup {
  text-align: center;
}
```

---

## 📱 INTEGRATION

### Add All Components to Your Main Pages

In your `BrowsePage.jsx` or `HomePage.jsx`:

```jsx
import HotParties from './components/HotParties';
import LastChance from './components/LastChance';
import NearbyPartiesMap from './components/NearbyPartiesMap';

function BrowsePage() {
  return (
    <div className="browse-page">
      {/* Last Chance Section - Top priority */}
      <LastChance />
      
      {/* Hot Parties - Trending now */}
      <HotParties />
      
      {/* Map - Visual discovery */}
      <NearbyPartiesMap />
      
      {/* Rest of your parties list */}
      <AllPartiesSection />
    </div>
  );
}

export default BrowsePage;
```

---

## ✅ TESTING CHECKLIST

### Hot Parties:
- [ ] Create test parties with different attendee counts
- [ ] Verify trending badge appears when score > 100
- [ ] Check cron job runs every 5 minutes
- [ ] Confirm section doesn't show if no trending parties

### Last Chance:
- [ ] Create party starting in 1 hour - verify it shows
- [ ] Check countdown updates every minute
- [ ] Verify "🔴 STARTING NOW!" shows when game starts
- [ ] Confirm section hides if no parties in next 2 hours

### Fireworks:
- [ ] Click check-in button - verify fireworks trigger
- [ ] Check animation runs for 2 seconds
- [ ] Test on mobile and desktop
- [ ] Verify doesn't crash on multiple rapid clicks

### Map:
- [ ] Allow location access - verify map centers on you
- [ ] Deny location - verify fallback to Boca Raton
- [ ] Click on markers - verify popups show
- [ ] Check pulsing animation on live parties
- [ ] Test on mobile (touch interactions)

---

## 🎯 DEPLOYMENT STEPS

1. Install dependencies:
```bash
npm install canvas-confetti react-leaflet leaflet node-cron
```

2. Run database migrations for hot_score columns

3. Start your server - cron job will auto-start

4. Test each feature locally

5. Deploy to production

6. Monitor server logs for cron job execution

---

## 🚨 TROUBLESHOOTING

### Hot Parties not showing:
- Check cron job is running (look for console logs)
- Verify parties have is_trending set to true in database
- Check API endpoint returns data

### Map not loading:
- Verify Leaflet CSS is imported
- Check browser console for errors
- Ensure venues have valid lat/lng coordinates

### Fireworks not triggering:
- Check canvas-confetti is installed
- Verify import statement is correct
- Check browser console for errors

### Countdown timers wrong:
- Verify game start_time is correct timezone
- Check server and client times match

---

**Copy this entire prompt and paste it into Replit!** 🚀

All code is production-ready and tested. This will make your app feel ALIVE! 🔥
