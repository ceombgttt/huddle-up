# REPLIT PROMPT: ADD "BROWSE PARTIES" / "ALL PARTIES" BUTTON

**Goal:** Add a prominent button that shows ALL upcoming and current parties across all sports and venues, so users can easily discover and join watch parties.

---

## 🎯 FEATURE REQUIREMENTS

Create a "Browse Parties" page that shows:
1. **All upcoming parties** (today + next 14 days)
2. **Currently happening parties** (live now)
3. **Filter by sport** (NBA, NFL, NHL, MLB, etc.)
4. **Filter by city/area** (Miami, Boca Raton, Fort Lauderdale, etc.)
5. **Sort options** (soonest first, most popular, closest to me)
6. **Search bar** (search by team, venue, host name)

---

## 📍 WHERE TO ADD THE BUTTON

Add the "Browse Parties" button as a **PRIMARY NAVIGATION ITEM**:

### **Location 1: Main Navigation** ⭐ **MOST IMPORTANT**
In the top navigation or hamburger menu:
```
[Home] [Browse Parties 🔍] [My Profile] [Create Party]
```

Position: Second item (right after Home), before Profile

### **Location 2: Home Screen - Hero Button**
Big, prominent button on home screen:
```
┌────────────────────────────────────┐
│                                    │
│     🔍 BROWSE ALL PARTIES         │
│                                    │
│  Find watch parties near you       │
│  127 parties happening this week   │
│                                    │
│    [Browse Parties →]             │
│                                    │
└────────────────────────────────────┘
```

### **Location 3: Quick Action Tile (Home Screen)**
```
┌─────────────────────┐
│ 🔍 All Parties      │
│ 42 parties today    │
│ [Browse →]          │
└─────────────────────┘
```

---

## 📄 "BROWSE PARTIES" PAGE DESIGN

### **Page Layout:**

```
┌──────────────────────────────────────────────────┐
│ Browse Parties                              [X]  │
├──────────────────────────────────────────────────┤
│                                                   │
│ Search: [🔍 Search teams, venues, hosts...]      │
│                                                   │
│ Sport: [All ▼] [NBA] [NFL] [NHL] [MLB] [More]   │
│                                                   │
│ Location: [All Areas ▼] [Miami] [Boca] [FTL]    │
│                                                   │
│ Sort: [Soonest First ▼]                         │
│                                                   │
│ ┌─ HAPPENING NOW ─────────────────────────┐     │
│ │                                          │     │
│ │ 🏀 Heat vs Celtics - LIVE NOW! 🔴      │     │
│ │ Started 15 min ago • Q1 - Heat up 12-8  │     │
│ │ 📍 BRU's Room Sports Grill              │     │
│ │ 👥 23 people watching                    │     │
│ │ [Join Party →]                          │     │
│ │                                          │     │
│ └──────────────────────────────────────────┘     │
│                                                   │
│ ┌─ TODAY ────────────────────────────────┐      │
│ │                                          │     │
│ │ 🏒 Panthers vs Maple Leafs              │     │
│ │ Tonight at 7:30 PM (in 4 hours)         │     │
│ │ 📍 Barrel of Monks                      │     │
│ │ 👥 18 people going                       │     │
│ │ [Join Party →]                          │     │
│ │                                          │     │
│ │ ─────────────────────────────            │     │
│ │                                          │     │
│ │ 🏈 Dolphins vs Bills                    │     │
│ │ Tonight at 8:00 PM (in 5 hours)         │     │
│ │ 📍 Flanigan's Seafood Bar               │     │
│ │ 👥 12 people going                       │     │
│ │ [Join Party →]                          │     │
│ │                                          │     │
│ └──────────────────────────────────────────┘     │
│                                                   │
│ ┌─ TOMORROW ─────────────────────────────┐      │
│ │                                          │     │
│ │ 🏀 Heat vs Lakers                       │     │
│ │ Tomorrow at 7:00 PM                      │     │
│ │ 📍 Rocco's Tacos                        │     │
│ │ 👥 25 people going                       │     │
│ │ [Join Party →]                          │     │
│ │                                          │     │
│ └──────────────────────────────────────────┘     │
│                                                   │
│ ┌─ THIS WEEKEND ─────────────────────────┐      │
│ │ [More parties...]                        │     │
│ └──────────────────────────────────────────┘     │
│                                                   │
│ [Load More Parties]                              │
│                                                   │
└──────────────────────────────────────────────────┘
```

---

## 🎨 PARTY CARD DESIGN (IN LIST)

Each party card shows:

### **Card Layout:**
```
┌──────────────────────────────────────────┐
│ 🏀 Heat vs Celtics                       │
│ Tonight at 7:30 PM (in 4 hours)          │
│ 📍 BRU's Room Sports Grill              │
│                                          │
│ "Heat game tonight! Wings and beer.     │
│  Let's go! 🔥"                          │
│                                          │
│ 👤 Hosted by Mike R.                     │
│ 👥 23 people going                       │
│ 💬 15 messages                           │
│                                          │
│ [Join Party →]                          │
└──────────────────────────────────────────┘
```

### **Card Elements:**

**Header:**
- Sport emoji + game matchup
- Date/time with countdown (e.g., "in 4 hours", "in 2 days")
- Venue name with location icon

**Description:**
- First 100 characters of party description
- "..." if longer (click to expand)

**Host & Stats:**
- Host name with avatar (small)
- Attendee count
- Message count

**Action:**
- Big [Join Party →] button
- Goes to party detail page

---

## 🔍 FILTER & SEARCH FEATURES

### **1. Sport Filter (Horizontal Pills)**

```
Sport: [All] [🏀 NBA] [🏈 NFL] [🏒 NHL] [⚾ MLB] [⚽ Soccer] [More ▼]
```

**Behavior:**
- Click a sport → Shows only parties for that sport
- "All" selected by default
- Active filter highlighted in blue
- "More" dropdown shows all 13 sports

### **2. Location Filter (Dropdown)**

```
Location: [All Areas ▼]
```

**Dropdown Options:**
- All Areas (default)
- Miami
- Boca Raton
- Fort Lauderdale
- Delray Beach
- Boynton Beach
- West Palm Beach
- Pompano Beach
- [Use My Location] ← Uses GPS

**When "Use My Location" selected:**
- Asks for location permission
- Shows parties sorted by distance
- "2.3 miles away", "5.1 miles away"

### **3. Search Bar**

```
🔍 Search teams, venues, hosts...
```

**Search Capability:**
- Team names: "Heat", "Panthers", "Dolphins"
- Venue names: "BRU's Room", "Barrel of Monks"
- Host names: "Mike R.", "Sarah T."
- Game matchups: "Heat vs Celtics"
- Partial matches OK

**Real-time Search:**
- Updates results as user types
- No need to press enter
- Highlights matching text

### **4. Sort Options (Dropdown)**

```
Sort: [Soonest First ▼]
```

**Sort Options:**
- Soonest First (default) - Closest to now
- Most Popular - Most attendees
- Newest Posted - Recently created parties
- Closest to Me - By distance (if location enabled)

---

## 📅 TIME-BASED GROUPING

Group parties by time:

### **Section 1: "HAPPENING NOW 🔴"**
- Parties for games currently in progress
- Show live score if available
- "Started 15 min ago • Q1 - Heat up 12-8"
- Red "LIVE" indicator

### **Section 2: "TODAY"**
- Parties happening today (within next 12 hours)
- Show countdown: "in 4 hours", "in 30 minutes"

### **Section 3: "TOMORROW"**
- Parties happening tomorrow

### **Section 4: "THIS WEEKEND"**
- Friday/Saturday/Sunday parties

### **Section 5: "THIS WEEK"**
- Monday-Sunday of current week

### **Section 6: "NEXT WEEK"**
- Following week

**Collapse/Expand:**
- Sections can be collapsed to save space
- Remember user's preference

---

## 🎯 SMART DEFAULTS

When user first opens "Browse Parties":

### **If User Has Favorite Teams Set:**
- Default to showing parties for their favorite teams first
- Example: User likes Heat → Show Heat parties at top

### **If User Has Location Enabled:**
- Default to "Closest to Me" sort
- Show distance on cards: "2.3 miles away"

### **If User Previously Filtered:**
- Remember last filter selection
- Example: Last time viewed "NBA only" → Default to NBA

### **If New User (No Preferences):**
- Show "All Sports"
- Sort by "Soonest First"
- Location: "All Areas"

---

## 📱 MOBILE RESPONSIVE

On mobile:

### **Compact Filter Design:**
```
┌────────────────────────┐
│ 🔍 [Search...]        │
│                        │
│ Sport: [All ▼]        │
│ Location: [All ▼]     │
│ Sort: [Soonest ▼]     │
└────────────────────────┘
```

### **Compact Party Cards:**
```
┌───────────────────────┐
│ 🏀 Heat vs Celtics   │
│ Tonight 7:30 PM       │
│ 📍 BRU's Room        │
│ 👥 23  💬 15         │
│ [Join →]             │
└───────────────────────┘
```

### **Filter Drawer (Mobile):**
```
[🔍 Filters (3)] ← Button opens drawer
```

Clicking opens slide-up drawer with all filters.

---

## 🎨 VISUAL DESIGN

### **Live Indicator:**
```
┌──────────────────────────────┐
│ 🔴 LIVE NOW                  │
│ 🏀 Heat vs Celtics           │
│ Q2 • Heat 45 - Celtics 42    │
└──────────────────────────────┘
```
Red pulsing dot + "LIVE NOW" text

### **Countdown Badges:**
```
Tonight at 7:30 PM
⏰ Starts in 4h 23m
```

### **Distance Badges (if location enabled):**
```
📍 BRU's Room Sports Grill
📏 2.3 miles away
```

### **Popular Party Badge:**
```
👥 35 people going 🔥 POPULAR
```
Show "🔥 POPULAR" if 25+ attendees

---

## 🎯 EMPTY STATES

### **No Parties Found:**
```
┌──────────────────────────────┐
│         🔍                   │
│                              │
│  No parties found            │
│                              │
│  Try adjusting your filters  │
│  or create the first party!  │
│                              │
│  [Clear Filters]            │
│  [Create Party]             │
└──────────────────────────────┘
```

### **No Parties for This Sport:**
```
┌──────────────────────────────┐
│         🏒                   │
│                              │
│  No NHL parties yet          │
│                              │
│  Be the first to create one! │
│                              │
│  [Create NHL Party]         │
└──────────────────────────────┘
```

---

## 🔔 SMART SUGGESTIONS

### **If User Searches for Team with No Parties:**
```
No parties for "Dolphins" yet.

🎯 Upcoming Dolphins Games:
• Dolphins vs Bills - Sunday 1:00 PM
• Dolphins vs Patriots - Next Sunday

[Create Party for This Game]
```

### **If User in Miami, Show Local:**
```
📍 You're in Miami

🔥 Hot Parties Near You:
• Heat game at BRU's Room (2.1 mi)
• Panthers at Barrel of Monks (3.5 mi)
```

---

## 💾 DATABASE REQUIREMENTS

### **Query for All Parties:**

```sql
SELECT parties.*, 
       games.team1, games.team2, games.sport, games.start_time,
       venues.name as venue_name, venues.city,
       users.name as host_name,
       COUNT(attendees.user_id) as attendee_count
FROM parties
JOIN games ON parties.game_id = games.id
JOIN venues ON parties.venue_id = venues.id
JOIN users ON parties.creator_id = users.id
LEFT JOIN attendees ON parties.id = attendees.party_id
WHERE games.start_time >= NOW()  -- Only upcoming/current
GROUP BY parties.id
ORDER BY games.start_time ASC
```

### **Filters Applied Dynamically:**

**Sport Filter:**
```sql
AND games.sport = 'NBA'
```

**Location Filter:**
```sql
AND venues.city = 'Miami'
```

**Search:**
```sql
AND (
  games.team1 LIKE '%Heat%' OR 
  games.team2 LIKE '%Heat%' OR
  venues.name LIKE '%BRU%' OR
  users.name LIKE '%Mike%'
)
```

---

## 🚀 IMPLEMENTATION CHECKLIST

Build this feature with these requirements:

**Navigation:**
- [ ] Add "Browse Parties" button to main navigation (2nd position)
- [ ] Add hero button on home screen
- [ ] Add quick action tile (optional)

**Browse Parties Page:**
- [ ] Search bar (team, venue, host)
- [ ] Sport filter (horizontal pills)
- [ ] Location filter (dropdown)
- [ ] Sort dropdown (soonest, popular, newest, closest)
- [ ] Time-based sections (Now, Today, Tomorrow, Weekend, Week)

**Party Cards:**
- [ ] Game matchup + emoji
- [ ] Date/time with countdown
- [ ] Venue name + city
- [ ] Party description (first 100 chars)
- [ ] Host name + avatar
- [ ] Attendee count + message count
- [ ] [Join Party] button

**Live Indicators:**
- [ ] "🔴 LIVE NOW" for games in progress
- [ ] Show live score if available
- [ ] Countdown timers ("in 4 hours")
- [ ] Distance badges ("2.3 miles away")

**Smart Features:**
- [ ] Remember user's last filter
- [ ] Default to favorite teams (if set)
- [ ] Location-based sorting (if enabled)
- [ ] "Popular" badge for 25+ attendees

**Empty States:**
- [ ] No parties found (with clear filters button)
- [ ] No parties for this sport (with create button)
- [ ] Suggestions for upcoming games

**Mobile Responsive:**
- [ ] Compact filter design
- [ ] Collapsible filter drawer
- [ ] Touch-friendly cards
- [ ] Smooth scrolling

---

## 🎯 USER FLOW EXAMPLES

### **Example 1: Tourist in Miami**

1. User opens app
2. Clicks **"Browse Parties"** button
3. Sees all upcoming parties
4. Filters: Location → **"Miami"**
5. Filters: Sport → **"🏀 NBA"**
6. Sees: "Heat vs Lakers at BRU's Room - Tonight 7:30 PM"
7. Clicks **[Join Party →]**
8. Joins party, gets directions, shows up!

### **Example 2: Local Finding Weekend Plans**

1. User clicks **"Browse Parties"**
2. Scrolls to **"THIS WEEKEND"** section
3. Sees 8 parties for Saturday/Sunday
4. Sorts by: **"Most Popular"**
5. Top result: "Panthers game - 35 people going"
6. Clicks **[Join Party →]**

### **Example 3: Die-Hard Heat Fan**

1. User clicks **"Browse Parties"**
2. Types in search: **"Heat"**
3. Sees all Heat parties (6 results)
4. Sorted by soonest first
5. Joins tonight's party

---

## 📍 EXACT PLACEMENT IN APP

### **In Main Navigation:**

```javascript
<nav className="main-navigation">
  <button onClick={() => setScreen('home')}>
    🏠 Home
  </button>
  
  <button onClick={() => setScreen('browseParties')}>  // ← ADD THIS
    🔍 Browse Parties
  </button>
  
  <button onClick={() => setScreen('profile')}>
    👤 Profile
  </button>
  
  <button onClick={() => setScreen('createParty')}>
    ➕ Create Party
  </button>
</nav>
```

### **On Home Screen (Hero Section):**

```javascript
<div className="hero-section">
  <h1>Find Your Game Day Crew</h1>
  
  <button 
    onClick={() => setScreen('browseParties')}
    className="hero-cta-button"
  >
    🔍 Browse All Parties
    <span className="party-count">127 parties this week</span>
  </button>
</div>
```

---

## 🎯 FINAL REQUIREMENTS

After implementing, users should be able to:

1. **Click "Browse Parties"** from main navigation
2. **See ALL upcoming/current parties** across all sports
3. **Filter by sport** (NBA, NFL, NHL, etc.)
4. **Filter by location** (Miami, Boca, etc.)
5. **Search** by team, venue, or host name
6. **Sort** by time, popularity, or distance
7. **See live parties** with "🔴 LIVE NOW" indicator
8. **See countdown timers** ("in 4 hours")
9. **See distance** if location enabled ("2.3 miles away")
10. **Join any party** with one click

**Visual Design:**
- Matches app theme (dark mode, blue/gold)
- Responsive on mobile
- Smooth scrolling
- Clear grouping (Now, Today, Tomorrow, etc.)

Build this "Browse All Parties" feature now with all functionality described above.
