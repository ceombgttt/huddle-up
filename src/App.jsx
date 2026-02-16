import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Plus, ArrowLeft, LogOut, User, Trophy, Search, Filter, CheckCircle, Building2, BarChart3, Settings, Navigation, Star, Phone, Globe, Map } from 'lucide-react';

// Sample games data for different sports
const SAMPLE_GAMES = [
  // NFL
  { id: 'nfl1', sport: 'NFL', homeTeam: 'Kansas City Chiefs', awayTeam: 'Buffalo Bills', startTime: '2026-02-16T18:00:00', venue: 'Arrowhead Stadium' },
  { id: 'nfl2', sport: 'NFL', homeTeam: 'San Francisco 49ers', awayTeam: 'Dallas Cowboys', startTime: '2026-02-16T20:30:00', venue: "Levi's Stadium" },
  { id: 'nfl3', sport: 'NFL', homeTeam: 'Green Bay Packers', awayTeam: 'Chicago Bears', startTime: '2026-02-17T13:00:00', venue: 'Lambeau Field' },
  
  // NBA
  { id: 'nba1', sport: 'NBA', homeTeam: 'Miami Heat', awayTeam: 'Boston Celtics', startTime: '2026-02-16T19:30:00', venue: 'FTX Arena' },
  { id: 'nba2', sport: 'NBA', homeTeam: 'LA Lakers', awayTeam: 'Golden State Warriors', startTime: '2026-02-16T22:00:00', venue: 'Crypto.com Arena' },
  { id: 'nba3', sport: 'NBA', homeTeam: 'Milwaukee Bucks', awayTeam: 'Philadelphia 76ers', startTime: '2026-02-17T20:00:00', venue: 'Fiserv Forum' },
  
  // MLB
  { id: 'mlb1', sport: 'MLB', homeTeam: 'New York Yankees', awayTeam: 'Boston Red Sox', startTime: '2026-04-15T19:05:00', venue: 'Yankee Stadium' },
  { id: 'mlb2', sport: 'MLB', homeTeam: 'LA Dodgers', awayTeam: 'San Francisco Giants', startTime: '2026-04-15T22:10:00', venue: 'Dodger Stadium' },
  { id: 'mlb3', sport: 'MLB', homeTeam: 'Chicago Cubs', awayTeam: 'St. Louis Cardinals', startTime: '2026-04-16T14:20:00', venue: 'Wrigley Field' },
  
  // NHL
  { id: 'nhl1', sport: 'NHL', homeTeam: 'Toronto Maple Leafs', awayTeam: 'Montreal Canadiens', startTime: '2026-02-16T19:00:00', venue: 'Scotiabank Arena' },
  { id: 'nhl2', sport: 'NHL', homeTeam: 'Boston Bruins', awayTeam: 'New York Rangers', startTime: '2026-02-17T18:00:00', venue: 'TD Garden' },
  { id: 'nhl3', sport: 'NHL', homeTeam: 'Colorado Avalanche', awayTeam: 'Vegas Golden Knights', startTime: '2026-02-17T21:00:00', venue: 'Ball Arena' },
  
  // College Football
  { id: 'cfb1', sport: 'College Football', homeTeam: 'Alabama Crimson Tide', awayTeam: 'Georgia Bulldogs', startTime: '2026-09-12T15:30:00', venue: 'Bryant-Denny Stadium' },
  { id: 'cfb2', sport: 'College Football', homeTeam: 'Ohio State Buckeyes', awayTeam: 'Michigan Wolverines', startTime: '2026-11-28T12:00:00', venue: 'Ohio Stadium' },
  { id: 'cfb3', sport: 'College Football', homeTeam: 'USC Trojans', awayTeam: 'Notre Dame Fighting Irish', startTime: '2026-10-17T19:30:00', venue: 'LA Memorial Coliseum' },
  
  // College Basketball
  { id: 'cbb1', sport: 'College Basketball', homeTeam: 'Duke Blue Devils', awayTeam: 'North Carolina Tar Heels', startTime: '2026-02-18T21:00:00', venue: 'Cameron Indoor Stadium' },
  { id: 'cbb2', sport: 'College Basketball', homeTeam: 'Kansas Jayhawks', awayTeam: 'Kentucky Wildcats', startTime: '2026-02-20T20:00:00', venue: 'Allen Fieldhouse' },
  { id: 'cbb3', sport: 'College Basketball', homeTeam: 'UConn Huskies', awayTeam: 'Villanova Wildcats', startTime: '2026-02-22T14:00:00', venue: 'Gampel Pavilion' },
  
  // Premier League
  { id: 'epl1', sport: 'Premier League', homeTeam: 'Manchester United', awayTeam: 'Liverpool', startTime: '2026-02-16T12:30:00', venue: 'Old Trafford' },
  { id: 'epl2', sport: 'Premier League', homeTeam: 'Arsenal', awayTeam: 'Chelsea', startTime: '2026-02-16T15:00:00', venue: 'Emirates Stadium' },
  { id: 'epl3', sport: 'Premier League', homeTeam: 'Manchester City', awayTeam: 'Tottenham', startTime: '2026-02-17T16:30:00', venue: 'Etihad Stadium' },
  
  // La Liga MX
  { id: 'mx1', sport: 'La Liga MX', homeTeam: 'Club América', awayTeam: 'Chivas Guadalajara', startTime: '2026-02-16T20:00:00', venue: 'Estadio Azteca' },
  { id: 'mx2', sport: 'La Liga MX', homeTeam: 'Cruz Azul', awayTeam: 'Pumas UNAM', startTime: '2026-02-17T18:00:00', venue: 'Estadio Azul' },
  
  // MLS
  { id: 'mls1', sport: 'MLS', homeTeam: 'LA Galaxy', awayTeam: 'LAFC', startTime: '2026-02-16T22:30:00', venue: 'Dignity Health Sports Park' },
  { id: 'mls2', sport: 'MLS', homeTeam: 'Seattle Sounders', awayTeam: 'Portland Timbers', startTime: '2026-02-17T19:00:00', venue: 'Lumen Field' },
  
  // UFC
  { id: 'ufc1', sport: 'UFC', homeTeam: 'UFC 314', awayTeam: 'Main Card', startTime: '2026-02-22T22:00:00', venue: 'T-Mobile Arena, Las Vegas' },
  { id: 'ufc2', sport: 'UFC', homeTeam: 'UFC Fight Night', awayTeam: 'Prelims & Main Card', startTime: '2026-02-28T19:00:00', venue: 'UFC APEX, Las Vegas' },
  
  // Boxing
  { id: 'box1', sport: 'Boxing', homeTeam: 'Heavyweight Championship', awayTeam: 'Title Fight', startTime: '2026-03-15T21:00:00', venue: 'MGM Grand, Las Vegas' },
  { id: 'box2', sport: 'Boxing', homeTeam: 'Welterweight Bout', awayTeam: 'Main Event', startTime: '2026-03-29T20:00:00', venue: 'Madison Square Garden, NYC' },
  
  // FIFA World Cup
  { id: 'wc1', sport: 'FIFA World Cup', homeTeam: 'USA', awayTeam: 'Mexico', startTime: '2026-06-20T14:00:00', venue: 'MetLife Stadium, New Jersey' },
  { id: 'wc2', sport: 'FIFA World Cup', homeTeam: 'Brazil', awayTeam: 'Argentina', startTime: '2026-06-25T17:00:00', venue: 'AT&T Stadium, Dallas' },
  { id: 'wc3', sport: 'FIFA World Cup', homeTeam: 'England', awayTeam: 'Germany', startTime: '2026-06-28T12:00:00', venue: 'SoFi Stadium, Los Angeles' },
  { id: 'wcw1', sport: 'FIFA World Cup', homeTeam: "USA Women's", awayTeam: "Canada Women's", startTime: '2027-07-10T19:00:00', venue: 'Rose Bowl, Pasadena' },
];

const SPORTS = ['All', 'NFL', 'NBA', 'MLB', 'NHL', 'College Football', 'College Basketball', 'Premier League', 'La Liga MX', 'MLS', 'UFC', 'Boxing', 'FIFA World Cup'];

// Teams database for favorite team selection
const TEAMS_BY_SPORT = {
  'NFL': ['Arizona Cardinals', 'Atlanta Falcons', 'Baltimore Ravens', 'Buffalo Bills', 'Carolina Panthers', 'Chicago Bears', 'Cincinnati Bengals', 'Cleveland Browns', 'Dallas Cowboys', 'Denver Broncos', 'Detroit Lions', 'Green Bay Packers', 'Houston Texans', 'Indianapolis Colts', 'Jacksonville Jaguars', 'Kansas City Chiefs', 'Las Vegas Raiders', 'LA Chargers', 'LA Rams', 'Miami Dolphins', 'Minnesota Vikings', 'New England Patriots', 'New Orleans Saints', 'NY Giants', 'NY Jets', 'Philadelphia Eagles', 'Pittsburgh Steelers', 'San Francisco 49ers', 'Seattle Seahawks', 'Tampa Bay Buccaneers', 'Tennessee Titans', 'Washington Commanders'],
  'NBA': ['Atlanta Hawks', 'Boston Celtics', 'Brooklyn Nets', 'Charlotte Hornets', 'Chicago Bulls', 'Cleveland Cavaliers', 'Dallas Mavericks', 'Denver Nuggets', 'Detroit Pistons', 'Golden State Warriors', 'Houston Rockets', 'Indiana Pacers', 'LA Clippers', 'LA Lakers', 'Memphis Grizzlies', 'Miami Heat', 'Milwaukee Bucks', 'Minnesota Timberwolves', 'New Orleans Pelicans', 'NY Knicks', 'Oklahoma City Thunder', 'Orlando Magic', 'Philadelphia 76ers', 'Phoenix Suns', 'Portland Trail Blazers', 'Sacramento Kings', 'San Antonio Spurs', 'Toronto Raptors', 'Utah Jazz', 'Washington Wizards'],
  'MLB': ['Arizona Diamondbacks', 'Atlanta Braves', 'Baltimore Orioles', 'Boston Red Sox', 'Chicago Cubs', 'Chicago White Sox', 'Cincinnati Reds', 'Cleveland Guardians', 'Colorado Rockies', 'Detroit Tigers', 'Houston Astros', 'Kansas City Royals', 'LA Angels', 'LA Dodgers', 'Miami Marlins', 'Milwaukee Brewers', 'Minnesota Twins', 'NY Mets', 'NY Yankees', 'Oakland Athletics', 'Philadelphia Phillies', 'Pittsburgh Pirates', 'San Diego Padres', 'San Francisco Giants', 'Seattle Mariners', 'St. Louis Cardinals', 'Tampa Bay Rays', 'Texas Rangers', 'Toronto Blue Jays', 'Washington Nationals'],
  'NHL': ['Anaheim Ducks', 'Arizona Coyotes', 'Boston Bruins', 'Buffalo Sabres', 'Calgary Flames', 'Carolina Hurricanes', 'Chicago Blackhawks', 'Colorado Avalanche', 'Columbus Blue Jackets', 'Dallas Stars', 'Detroit Red Wings', 'Edmonton Oilers', 'Florida Panthers', 'LA Kings', 'Minnesota Wild', 'Montreal Canadiens', 'Nashville Predators', 'New Jersey Devils', 'NY Islanders', 'NY Rangers', 'Ottawa Senators', 'Philadelphia Flyers', 'Pittsburgh Penguins', 'San Jose Sharks', 'Seattle Kraken', 'St. Louis Blues', 'Tampa Bay Lightning', 'Toronto Maple Leafs', 'Vancouver Canucks', 'Vegas Golden Knights', 'Washington Capitals', 'Winnipeg Jets'],
  'College Football': ['Alabama', 'Georgia', 'Ohio State', 'Michigan', 'Texas', 'USC', 'Notre Dame', 'Penn State', 'Florida', 'LSU', 'Oklahoma', 'Clemson', 'Oregon', 'Tennessee', 'Auburn', 'Florida State', 'Wisconsin', 'Miami', 'Texas A&M', 'Washington'],
  'College Basketball': ['Duke', 'North Carolina', 'Kansas', 'Kentucky', 'UCLA', 'Villanova', 'Michigan State', 'UConn', 'Arizona', 'Gonzaga', 'Louisville', 'Syracuse', 'Indiana', 'Michigan', 'Virginia', 'Texas'],
  'Premier League': ['Arsenal', 'Chelsea', 'Liverpool', 'Manchester City', 'Manchester United', 'Tottenham', 'Newcastle', 'Aston Villa', 'Brighton', 'West Ham', 'Everton', 'Leicester City', 'Wolves'],
  'La Liga MX': ['Club América', 'Chivas Guadalajara', 'Cruz Azul', 'Pumas UNAM', 'Tigres UANL', 'Monterrey', 'Atlas', 'Santos Laguna', 'León', 'Pachuca'],
  'MLS': ['LA Galaxy', 'LAFC', 'Seattle Sounders', 'Portland Timbers', 'Atlanta United', 'Inter Miami', 'NY Red Bulls', 'NYCFC', 'Toronto FC', 'Vancouver Whitecaps', 'Austin FC', 'Chicago Fire']
};

// Sample verified venues (in production, this comes from database)
const SAMPLE_VENUES = [
  { id: 'v1', name: "Buffalo Wild Wings Downtown", address: "123 Main St, Fort Lauderdale, FL", verified: true, featured: true, type: 'Sports Bar' },
  { id: 'v2', name: "The Pub Sports Bar", address: "456 Ocean Ave, Fort Lauderdale, FL", verified: true, featured: false, type: 'Sports Bar' },
  { id: 'v3', name: "Yard House", address: "789 Las Olas Blvd, Fort Lauderdale, FL", verified: true, featured: true, type: 'Restaurant & Bar' },
  { id: 'v4', name: "Bokampers Sports Bar", address: "321 Commercial Blvd, Fort Lauderdale, FL", verified: true, featured: false, type: 'Sports Bar' },
];

// Sponsor data for banner ads
const SPONSORS = [
  { id: 'sponsor1', name: 'Bud Light', tagline: 'Official Beer Partner of Huddle Up', logo: '🍺', cta: 'Find at your local bar' },
  { id: 'sponsor2', name: 'DraftKings', tagline: 'Bet on Live Games - Get $200 Bonus', logo: '📱', cta: 'Learn More' },
  { id: 'sponsor3', name: 'Nike', tagline: 'Game Day Gear - 20% off with code HUDDLE20', logo: '👕', cta: 'Shop Now' }
];

// Multi-location venue pricing
const VENUE_PRICING = {
  single: { name: "Single Location", featured: 199 },
  chain: { name: "Multi-Location (2-5)", featured: 499 },
  chainPlus: { name: "Regional Chain (6-20)", featured: 999 },
  enterprise: { name: "Enterprise (20+)", featured: "Custom" }
};

const HuddleUpApp = () => {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [user, setUser] = useState(null);
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedGame, setSelectedGame] = useState(null);
  const [parties, setParties] = useState([]);
  const [userParties, setUserParties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentCity, setCurrentCity] = useState('Fort Lauderdale, FL');
  const [showOnboarding, setShowOnboarding] = useState(false); // Onboarding tutorial
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [myTeamsOnly, setMyTeamsOnly] = useState(false); // Filter by favorite teams
  const [venues, setVenues] = useState(SAMPLE_VENUES);
  const [venueClaims, setVenueClaims] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [games, setGames] = useState(SAMPLE_GAMES);
  const [loadingGames, setLoadingGames] = useState(false);
  
  // Admin credentials (in production, this would be secure authentication)
  const isAdmin = user?.email === 'admin@huddleup.com';
  
  // Check if user owns a venue
  const userVenue = user ? venues.find(v => v.claimedBy === user.email) : null;

  // Load user and parties from storage on mount
  useEffect(() => {
    loadUserData();
    loadParties();
    loadVenues();
    loadVenueClaims();
    loadGamesData();
  }, []);

  const loadGamesData = async () => {
    try {
      const result = await window.storage.get('cached-games', true);
      if (result) {
        const cachedData = JSON.parse(result.value);
        // Check if cache is less than 6 hours old
        const cacheAge = Date.now() - new Date(cachedData.timestamp).getTime();
        if (cacheAge < 6 * 60 * 60 * 1000) {
          setGames(cachedData.games);
          return;
        }
      }
    } catch (error) {
      console.log('No cached games, will use sample data');
    }
    // Use sample games as fallback
    setGames(SAMPLE_GAMES);
  };

  const fetchLiveGames = async () => {
    setLoadingGames(true);
    try {
      // Fetch upcoming games for each sport
      const sports = [
        { league: 'nfl', sport: 'NFL' },
        { league: 'nba', sport: 'NBA' },
        { league: 'mlb', sport: 'MLB' },
        { league: 'nhl', sport: 'NHL' },
        { league: 'ncaafb', sport: 'College Football' },
        { league: 'ncaamb', sport: 'College Basketball' },
        { league: 'epl', sport: 'Premier League' },
        { league: 'mls', sport: 'MLS' },
        { league: 'mma', sport: 'UFC' },
        { league: 'boxing', sport: 'Boxing' }
      ];

      const allGames = [];

      for (const { league, sport } of sports) {
        try {
          const response = await fetch(`https://api.anthropic.com/v1/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-20250514',
              max_tokens: 1000,
              messages: [{
                role: 'user',
                content: (sport === 'UFC' || sport === 'Boxing')
                  ? `Get the upcoming ${sport} events for the next 30 days. Return ONLY a JSON array with this exact format (no other text):
[{"homeTeam": "Event Name/Number", "awayTeam": "Main Card or Featured Fight", "startTime": "2026-02-16T22:00:00", "venue": "Arena, City"}]

Return 2-4 upcoming ${sport} events.`
                  : `Get the upcoming ${sport} games for the next 7 days. Return ONLY a JSON array with this exact format (no other text):
[{"homeTeam": "Team Name", "awayTeam": "Team Name", "startTime": "2026-02-16T18:00:00", "venue": "Stadium Name"}]

Return 3-5 upcoming games.`
              }],
              tools: [{
                type: "web_search_20250305",
                name: "web_search"
              }]
            })
          });

          const data = await response.json();
          
          // Extract text from response
          const textContent = data.content
            .filter(item => item.type === 'text')
            .map(item => item.text)
            .join('\n');

          // Try to parse JSON from the response
          const jsonMatch = textContent.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const gamesData = JSON.parse(jsonMatch[0]);
            const formattedGames = gamesData.map((game, idx) => ({
              id: `${league}-live-${idx}`,
              sport: sport,
              ...game
            }));
            allGames.push(...formattedGames);
          }
        } catch (error) {
          console.error(`Error fetching ${sport} games:`, error);
        }
      }

      if (allGames.length > 0) {
        setGames(allGames);
        // Cache the results
        await window.storage.set('cached-games', JSON.stringify({
          games: allGames,
          timestamp: new Date().toISOString()
        }), true);
      } else {
        // Fallback to sample data
        setGames(SAMPLE_GAMES);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      setGames(SAMPLE_GAMES);
    }
    setLoadingGames(false);
  };

  const loadUserData = async () => {
    try {
      const result = await window.storage.get('current-user', false);
      if (result) {
        const userData = JSON.parse(result.value);
        setUser(userData);
        setCurrentScreen('games');
        loadUserParties(userData.email);
      }
    } catch (error) {
      console.log('No saved user');
    }
  };

  const loadParties = async () => {
    try {
      const result = await window.storage.get('all-parties', true);
      if (result) {
        setParties(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('No parties yet');
      setParties([]);
    }
  };

  const loadVenues = async () => {
    try {
      const result = await window.storage.get('all-venues', true);
      if (result) {
        setVenues(JSON.parse(result.value));
      } else {
        // Initialize with sample venues
        await window.storage.set('all-venues', JSON.stringify(SAMPLE_VENUES), true);
        setVenues(SAMPLE_VENUES);
      }
    } catch (error) {
      console.log('Initializing venues');
      setVenues(SAMPLE_VENUES);
    }
  };

  const loadVenueClaims = async () => {
    try {
      const result = await window.storage.get('venue-claims', true);
      if (result) {
        setVenueClaims(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('No venue claims yet');
      setVenueClaims([]);
    }
  };

  const loadUserParties = async (userEmail) => {
    try {
      const result = await window.storage.get(`user-parties-${userEmail}`, false);
      if (result) {
        setUserParties(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('No user parties yet');
      setUserParties([]);
    }
  };

  const saveParties = async (updatedParties) => {
    try {
      await window.storage.set('all-parties', JSON.stringify(updatedParties), true);
      setParties(updatedParties);
    } catch (error) {
      console.error('Failed to save parties:', error);
    }
  };

  const saveUserParties = async (userEmail, updatedUserParties) => {
    try {
      await window.storage.set(`user-parties-${userEmail}`, JSON.stringify(updatedUserParties), false);
      setUserParties(updatedUserParties);
    } catch (error) {
      console.error('Failed to save user parties:', error);
    }
  };

  const handleSignUp = async (email, password, name, gender) => {
    const newUser = { 
      email, 
      name, 
      gender, 
      favoriteTeams: {}, // Will store: { 'NFL': 'Green Bay Packers', 'NHL': 'Florida Panthers', ... }
      joinedDate: new Date().toISOString() 
    };
    setUser(newUser);
    await window.storage.set('current-user', JSON.stringify(newUser), false);
    
    // Check if first time user - show onboarding
    const hasSeenOnboarding = await window.storage.get('seen-onboarding-' + email, false);
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
      setOnboardingStep(0);
    }
    
    setCurrentScreen('games');
  };

  const handleLogin = async (email, password) => {
    const newUser = { email, name: email.split('@')[0], gender: 'prefer-not-to-say', joinedDate: new Date().toISOString() };
    setUser(newUser);
    await window.storage.set('current-user', JSON.stringify(newUser), false);
    loadUserParties(email);
    setCurrentScreen('games');
  };

  const updateFavoriteTeams = async (sport, team) => {
    const updatedUser = {
      ...user,
      favoriteTeams: {
        ...user.favoriteTeams,
        [sport]: team
      }
    };
    setUser(updatedUser);
    await window.storage.set('current-user', JSON.stringify(updatedUser), false);
  };

  const removeFavoriteTeam = async (sport) => {
    const updatedTeams = { ...user.favoriteTeams };
    delete updatedTeams[sport];
    const updatedUser = {
      ...user,
      favoriteTeams: updatedTeams
    };
    setUser(updatedUser);
    await window.storage.set('current-user', JSON.stringify(updatedUser), false);
  };

  const handleLogout = async () => {
    try {
      await window.storage.delete('current-user', false);
    } catch (error) {
      console.log('Error logging out');
    }
    setUser(null);
    setUserParties([]);
    setCurrentScreen('welcome');
  };

  const handleCreateParty = async (partyData) => {
    const newParty = {
      id: `party-${Date.now()}`,
      ...partyData,
      hostEmail: user.email,
      hostName: user.name,
      attendees: [user.email],
      attendeeDetails: [{
        email: user.email,
        name: user.name,
        gender: user.gender
      }],
      createdAt: new Date().toISOString()
    };

    const updatedParties = [...parties, newParty];
    await saveParties(updatedParties);

    const updatedUserParties = [...userParties, newParty.id];
    await saveUserParties(user.email, updatedUserParties);

    setCurrentScreen('gameDetail');
  };

  const handleJoinParty = async (partyId) => {
    const updatedParties = parties.map(party => {
      if (party.id === partyId && !party.attendees.includes(user.email)) {
        return {
          ...party,
          attendees: [...party.attendees, user.email],
          attendeeDetails: [
            ...(party.attendeeDetails || []),
            {
              email: user.email,
              name: user.name,
              gender: user.gender
            }
          ]
        };
      }
      return party;
    });

    await saveParties(updatedParties);

    if (!userParties.includes(partyId)) {
      const updatedUserParties = [...userParties, partyId];
      await saveUserParties(user.email, updatedUserParties);
    }
  };

  const handleLeaveParty = async (partyId) => {
    const updatedParties = parties.map(party => {
      if (party.id === partyId) {
        return {
          ...party,
          attendees: party.attendees.filter(email => email !== user.email),
          attendeeDetails: (party.attendeeDetails || []).filter(att => att.email !== user.email)
        };
      }
      return party;
    }).filter(party => party.attendees.length > 0);

    await saveParties(updatedParties);

    const updatedUserParties = userParties.filter(id => id !== partyId);
    await saveUserParties(user.email, updatedUserParties);
  };

  const handleVenueClaim = async (claimData) => {
    const newClaim = {
      id: `claim-${Date.now()}`,
      ...claimData,
      submittedBy: user.email,
      submittedByName: user.name,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    const updatedClaims = [...venueClaims, newClaim];
    try {
      await window.storage.set('venue-claims', JSON.stringify(updatedClaims), true);
      setVenueClaims(updatedClaims);
      alert('Venue claim submitted! We\'ll review it within 24-48 hours.');
      setCurrentScreen('games');
    } catch (error) {
      console.error('Failed to submit claim:', error);
    }
  };

  const handleApproveVenueClaim = async (claimId) => {
    const claim = venueClaims.find(c => c.id === claimId);
    if (!claim) return;

    // Create new verified venue
    const newVenue = {
      id: `venue-${Date.now()}`,
      name: claim.venueName,
      address: claim.address,
      type: claim.venueType,
      verified: true,
      featured: false,
      claimedBy: claim.submittedBy,
      phone: claim.phone,
      website: claim.website
    };

    const updatedVenues = [...venues, newVenue];
    const updatedClaims = venueClaims.map(c => 
      c.id === claimId ? { ...c, status: 'approved' } : c
    );

    try {
      await window.storage.set('all-venues', JSON.stringify(updatedVenues), true);
      await window.storage.set('venue-claims', JSON.stringify(updatedClaims), true);
      setVenues(updatedVenues);
      setVenueClaims(updatedClaims);
    } catch (error) {
      console.error('Failed to approve claim:', error);
    }
  };

  const handleRejectVenueClaim = async (claimId) => {
    const updatedClaims = venueClaims.map(c => 
      c.id === claimId ? { ...c, status: 'rejected' } : c
    );

    try {
      await window.storage.set('venue-claims', JSON.stringify(updatedClaims), true);
      setVenueClaims(updatedClaims);
    } catch (error) {
      console.error('Failed to reject claim:', error);
    }
  };

  const filteredGames = games.filter(game => {
    const matchesSport = selectedSport === 'All' || game.sport === selectedSport;
    const matchesSearch = searchTerm === '' || 
      game.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.awayTeam.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by favorite teams if enabled
    const matchesMyTeams = !myTeamsOnly || !user?.favoriteTeams || 
      Object.values(user.favoriteTeams).some(team => 
        game.homeTeam.includes(team) || game.awayTeam.includes(team)
      );
    
    return matchesSport && matchesSearch && matchesMyTeams;
  });

  const getPartiesForGame = (gameId) => {
    return parties.filter(party => party.gameId === gameId);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // FEATURE 1: ONBOARDING TUTORIAL OVERLAY
  const OnboardingOverlay = () => {
    const steps = [
      { title: "Welcome to Huddle Up! 🎉", description: "Find watch parties for any game, in any city. Let's show you how it works!", icon: "👋" },
      { title: "Search Any City 📍", description: "Traveling? Type any city in the search bar to find parties near you. Dallas, Miami, NYC - we've got you covered!", icon: "🌎" },
      { title: "Join or Create Parties 🎊", description: "See a game you want to watch? Join an existing party or be the hero and create the first one!", icon: "🏈" },
      { title: "Show Up & Have Fun! 🍻", description: "That's it! Meet new people, watch the game, and enjoy. Ready to find your first party?", icon: "🎯" }
    ];
    
    if (!showOnboarding) return null;
    
    const currentStep = steps[onboardingStep];
    const isLastStep = onboardingStep === steps.length - 1;
    
    const handleNext = async () => {
      if (isLastStep) {
        await window.storage.set('seen-onboarding-' + user.email, 'true', false);
        setShowOnboarding(false);
      } else {
        setOnboardingStep(onboardingStep + 1);
      }
    };
    
    const handleSkip = async () => {
      await window.storage.set('seen-onboarding-' + user.email, 'true', false);
      setShowOnboarding(false);
    };
    
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-md w-full border-2 border-cyan-500/30 shadow-2xl">
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div key={index} className={`h-2 rounded-full transition-all ${index === onboardingStep ? 'w-8 bg-cyan-400' : index < onboardingStep ? 'w-2 bg-cyan-600' : 'w-2 bg-gray-600'}`} />
            ))}
          </div>
          <div className="text-6xl text-center mb-4">{currentStep.icon}</div>
          <h2 className="text-2xl font-black text-white text-center mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{currentStep.title}</h2>
          <p className="text-gray-300 text-center mb-8 leading-relaxed">{currentStep.description}</p>
          <div className="flex gap-3">
            {!isLastStep && (
              <button onClick={handleSkip} className="flex-1 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all">
                Skip
              </button>
            )}
            <button onClick={handleNext} className={`${isLastStep ? 'w-full' : 'flex-1'} py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all`}>
              {isLastStep ? "Let's Go! 🚀" : 'Next'}
            </button>
          </div>
          <div className="text-center mt-4 text-sm text-gray-500">Step {onboardingStep + 1} of {steps.length}</div>
        </div>
      </div>
    );
  };

  // FEATURE 4: EMPTY PARTY STATE - When no parties exist for a game
  const EmptyPartyState = ({ gameName, onCreateParty }) => (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-2xl p-8 text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h3 className="text-2xl font-black text-white mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
        No Parties Yet - Be The Hero!
      </h3>
      <p className="text-gray-300 mb-6">
        Be the first to create a watch party for {gameName}. Other fans are waiting for someone like you to start the fun!
      </p>
      <button
        onClick={onCreateParty}
        className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 transition-all"
      >
        🚀 Create First Party
      </button>
      <p className="text-gray-500 text-sm mt-4">Don't be shy - someone has to be first!</p>
    </div>
  );

  // Screen Components
  const WelcomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
        <div className="space-y-4">
          <div className="inline-block">
            <svg width="160" height="160" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
              <defs>
                <radialGradient id="bgSimple" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" style={{stopColor:'#4F46E5',stopOpacity:0.2}} />
                  <stop offset="100%" style={{stopColor:'#0F172A',stopOpacity:1}} />
                </radialGradient>
                <linearGradient id="pinClean" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#6EE7B7',stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#34D399',stopOpacity:1}} />
                </linearGradient>
                <filter id="softGlow">
                  <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <rect width="400" height="400" rx="90" fill="#0F172A" />
              <rect width="400" height="400" rx="90" fill="url(#bgSimple)" />
              <circle cx="200" cy="190" r="140" fill="#34D399" opacity="0.15" />
              <g transform="translate(200, 190)" filter="url(#softGlow)">
                <path d="M 0 -110 C -65 -110 -110 -65 -110 0 C -110 75 0 145 0 145 C 0 145 110 75 110 0 C 110 -65 65 -110 0 -110 Z" fill="url(#pinClean)" />
                <path d="M 0 -110 C -65 -110 -110 -65 -110 0 C -110 75 0 145 0 145 C 0 145 110 75 110 0 C 110 -65 65 -110 0 -110 Z" fill="none" stroke="#6EE7B7" strokeWidth="5" opacity="0.9" />
                <circle cx="0" cy="0" r="80" fill="#1E293B" />
                <circle cx="0" cy="0" r="80" fill="none" stroke="#34D399" strokeWidth="3" opacity="0.5" />
              </g>
              <g transform="translate(200, 190)">
                <g transform="translate(-40, 0)">
                  <ellipse cx="0" cy="0" rx="24" ry="30" fill="#92400E" />
                  <line x1="0" y1="-18" x2="0" y2="18" stroke="#FFFFFF" strokeWidth="3" />
                  <line x1="-8" y1="-9" x2="8" y2="-9" stroke="#FFFFFF" strokeWidth="2" />
                  <line x1="-8" y1="0" x2="8" y2="0" stroke="#FFFFFF" strokeWidth="2" />
                  <line x1="-8" y1="9" x2="8" y2="9" stroke="#FFFFFF" strokeWidth="2" />
                </g>
                <g transform="translate(40, 0)">
                  <circle cx="0" cy="0" r="26" fill="#FFFFFF" />
                  <polygon points="0,-10 9,-4 6,8 -6,8 -9,-4" fill="#1E293B" />
                </g>
                <g transform="translate(0, 40)">
                  <circle cx="0" cy="0" r="24" fill="#EA580C" />
                  <path d="M -24 0 Q 0 -12 24 0" fill="none" stroke="#1E293B" strokeWidth="2" />
                  <path d="M -24 0 Q 0 12 24 0" fill="none" stroke="#1E293B" strokeWidth="2" />
                  <line x1="0" y1="-24" x2="0" y2="24" stroke="#1E293B" strokeWidth="2" />
                </g>
              </g>
            </svg>
          </div>
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            HUDDLE UP
          </h1>
          <p className="text-xl text-gray-300" style={{ fontFamily: "'Inter', sans-serif" }}>
            Find your crew. Watch the game.
          </p>
        </div>
        <div className="space-y-4">
          <button
            onClick={() => setCurrentScreen('login')}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-200"
          >
            LOG IN
          </button>
          <button
            onClick={() => setCurrentScreen('signup')}
            className="w-full py-4 bg-white/10 backdrop-blur-sm text-white font-bold text-lg rounded-2xl border-2 border-white/20 hover:bg-white/20 transform hover:scale-105 transition-all duration-200"
          >
            SIGN UP
          </button>
        </div>
      </div>
    </div>
  );

  const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              WELCOME BACK
            </h2>
            <p className="text-gray-400">Log in to find watch parties</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg p-8 rounded-3xl space-y-6 border border-white/10">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="••••••••"
              />
            </div>

            <button
              onClick={() => handleLogin(email, password)}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-200"
            >
              LOG IN
            </button>

            <button
              onClick={() => setCurrentScreen('welcome')}
              className="w-full py-3 text-gray-400 hover:text-white transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SignUpScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const handleSubmit = () => {
      if (!acceptedTerms) {
        alert('You must accept the Terms of Service and Privacy Policy to sign up.');
        return;
      }
      if (!email || !password || !name || !gender) {
        alert('Please fill in all fields.');
        return;
      }
      handleSignUp(email, password, name, gender);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              JOIN THE CREW
            </h2>
            <p className="text-gray-400">Create your account</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg p-8 rounded-3xl space-y-6 border border-white/10">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Gender (shown to other attendees)</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Select gender...</option>
                <option value="male">Male ♂</option>
                <option value="female">Female ♀</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Helps other users see group composition</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="••••••••"
              />
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 bg-white/10"
                />
                <span className="text-sm text-gray-300">
                  I agree to the{' '}
                  <a href="/terms" target="_blank" className="text-cyan-400 hover:text-cyan-300 underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" target="_blank" className="text-cyan-400 hover:text-cyan-300 underline">
                    Privacy Policy
                  </a>
                  . I understand that Huddle Up US is a platform only and is not responsible for venues, events, or user conduct.
                </span>
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!acceptedTerms}
              className={`w-full py-4 text-white font-bold text-lg rounded-2xl shadow-lg transform transition-all duration-200 ${
                acceptedTerms
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-cyan-500/50 hover:scale-105'
                  : 'bg-gray-500 cursor-not-allowed opacity-50'
              }`}
            >
              SIGN UP
            </button>

            <button
              onClick={() => setCurrentScreen('welcome')}
              className="w-full py-3 text-gray-400 hover:text-white transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  };

  const GamesScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              <Trophy className="inline w-8 h-8 mr-2 text-cyan-400" />
              GAMES
            </h1>
            <div className="flex gap-2">
              {userVenue && (
                <button
                  onClick={() => setCurrentScreen('venueDashboard')}
                  className="p-2 bg-green-500/20 rounded-xl hover:bg-green-500/30 transition-colors border border-green-500/30"
                  title="Venue Dashboard"
                >
                  <Building2 className="w-5 h-5 text-green-300" />
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => setCurrentScreen('admin')}
                  className="p-2 bg-purple-500/20 rounded-xl hover:bg-purple-500/30 transition-colors border border-purple-500/30"
                  title="Admin Panel"
                >
                  <Settings className="w-5 h-5 text-purple-300" />
                </button>
              )}
              <button
                onClick={() => setCurrentScreen('profile')}
                className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
              >
                <User className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
              >
                <LogOut className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* LOCATION SEARCH - NEW */}
          <div className="relative mb-3">
            <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <input
              type="text"
              value={currentCity}
              onChange={(e) => setCurrentCity(e.target.value)}
              placeholder="Enter city (e.g., Dallas, TX)"
              className="w-full pl-10 pr-4 py-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-2 border-cyan-500/30 rounded-xl text-white placeholder-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="flex items-center gap-2 text-xs">
                <MapPin className="w-3 h-3 text-cyan-400" />
                <span className="text-cyan-300 font-bold">{currentCity}</span>
              </div>
            </div>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search teams..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* MY TEAMS ONLY FILTER */}
          {user?.favoriteTeams && Object.keys(user.favoriteTeams).length > 0 && (
            <button
              onClick={() => setMyTeamsOnly(!myTeamsOnly)}
              className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mb-3 ${
                myTeamsOnly
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Star className={`w-5 h-5 ${myTeamsOnly ? 'fill-white' : ''}`} />
              {myTeamsOnly ? 'Showing My Teams Only' : 'Show My Teams Only'}
              {myTeamsOnly && (
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {Object.keys(user.favoriteTeams).length} teams
                </span>
              )}
            </button>
          )}

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {SPORTS.map(sport => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedSport === sport
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {sport}
              </button>
            ))}
          </div>

          <button
            onClick={fetchLiveGames}
            disabled={loadingGames}
            className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-gray-400 hover:text-white transition-all border border-white/10 flex items-center justify-center gap-2"
          >
            {loadingGames ? (
              <>
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                Loading live games...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh with live game schedules
              </>
            )}
          </button>
        </div>
      </div>

      {/* SPONSOR BANNER - ENHANCED FEATURE */}
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="bg-gradient-to-r from-yellow-500/15 via-orange-500/15 to-red-500/15 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center font-black text-2xl shadow-lg">
                {SPONSORS[0].logo}
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Sponsored</div>
                <div className="text-white font-bold">{SPONSORS[0].name}</div>
                <div className="text-gray-300 text-sm">{SPONSORS[0].tagline}</div>
              </div>
            </div>
            <button className="hidden sm:block px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold rounded-lg hover:shadow-lg transition-all text-sm">
              {SPONSORS[0].cta}
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-right">Advertisement</div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {filteredGames.map(game => {
          const gameParties = getPartiesForGame(game.id);
          return (
            <div
              key={game.id}
              onClick={() => {
                setSelectedGame(game);
                setCurrentScreen('gameDetail');
              }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10 hover:border-cyan-500/50 cursor-pointer transform hover:scale-[1.02] transition-all duration-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-bold rounded-full border border-cyan-500/30">
                  {game.sport}
                </span>
                {gameParties.length > 0 && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full border border-purple-500/30">
                    {gameParties.length} {gameParties.length === 1 ? 'Party' : 'Parties'}
                  </span>
                )}
              </div>
              
              <div className="text-center mb-4">
                <div className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  {game.homeTeam} <span className="text-cyan-400">VS</span> {game.awayTeam}
                </div>
                <div className="flex items-center justify-center gap-4 text-gray-400 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDateTime(game.startTime)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const GameDetailScreen = () => {
    const gameParties = getPartiesForGame(selectedGame.id);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button
              onClick={() => setCurrentScreen('games')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Games
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-white/10 shadow-xl">
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-bold rounded-full border border-cyan-500/30 mb-4 inline-block">
              {selectedGame.sport}
            </span>
            
            <div className="text-center mb-6">
              <div className="text-4xl font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                {selectedGame.homeTeam}
                <br />
                <span className="text-cyan-400">VS</span>
                <br />
                {selectedGame.awayTeam}
              </div>
              <div className="flex items-center justify-center gap-1 text-gray-400 mb-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDateTime(selectedGame.startTime)}</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{selectedGame.venue}</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentScreen('createParty')}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              CREATE WATCH PARTY
            </button>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Watch Parties ({gameParties.length})
            </h2>
            
            {gameParties.length === 0 ? (
              <EmptyPartyState 
                gameName={`${selectedGame.homeTeam} vs ${selectedGame.awayTeam}`}
                onCreateParty={() => setCurrentScreen('createParty')}
              />
            ) : (
              <div className="space-y-4">
                {gameParties.map(party => {
                  const isAttending = party.attendees.includes(user.email);
                  const isFull = party.capacity && party.attendees.length >= party.capacity;
                  const venue = party.venueId ? venues.find(v => v.id === party.venueId) : null;
                  
                  return (
                    <div
                      key={party.id}
                      className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10 shadow-xl"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-white">{party.hostName}'s Party</h3>
                            {party.hostEmail === user.email && (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-bold rounded-full border border-yellow-500/30">
                                HOST
                              </span>
                            )}
                            {venue?.verified && (
                              <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs font-bold rounded-full border border-green-500/30 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                VERIFIED
                              </span>
                            )}
                            {venue?.featured && (
                              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full border border-purple-500/30">
                                ⭐ FEATURED
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-cyan-400" />
                              <span>{party.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-cyan-400" />
                              <span>{party.customTime || formatDateTime(selectedGame.startTime)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-cyan-400" />
                              <span>
                                {party.attendees.length}
                                {party.capacity ? ` / ${party.capacity}` : ''} people
                              </span>
                            </div>
                          </div>

                          {party.notes && (
                            <p className="mt-3 text-gray-300 text-sm">{party.notes}</p>
                          )}

                          {/* Attendee List */}
                          {party.attendeeDetails && party.attendeeDetails.length > 0 && (
                            <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
                              <div className="text-xs text-gray-400 mb-2 font-bold">Who's Going:</div>
                              <div className="flex flex-wrap gap-2">
                                {party.attendeeDetails.map((attendee, idx) => {
                                  const genderIcon = attendee.gender === 'male' ? '♂' : attendee.gender === 'female' ? '♀' : '';
                                  const genderColor = attendee.gender === 'male' ? 'text-blue-400' : attendee.gender === 'female' ? 'text-pink-400' : 'text-gray-400';
                                  return (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full border border-white/20"
                                    >
                                      <span className="text-white text-sm">{attendee.name}</span>
                                      {genderIcon && (
                                        <span className={`${genderColor} font-bold`}>{genderIcon}</span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* FELLOW FANS INDICATOR - Show fans of same teams */}
                      {user?.favoriteTeams && Object.keys(user.favoriteTeams).length > 0 && (
                        (() => {
                          // Check if this game involves any of user's favorite teams
                          const myTeams = Object.values(user.favoriteTeams);
                          const isMyTeamPlaying = myTeams.some(team => 
                            selectedGame.homeTeam.includes(team) || selectedGame.awayTeam.includes(team)
                          );
                          
                          if (isMyTeamPlaying) {
                            const myTeam = myTeams.find(team => 
                              selectedGame.homeTeam.includes(team) || selectedGame.awayTeam.includes(team)
                            );
                            return (
                              <div className="mb-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                  <span className="text-white font-bold text-sm">
                                    Your team is playing! {party.attendees.length} {myTeam} fans going! 🎉
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()
                      )}

                      {/* FEATURE 5: Capacity Warnings */}
                      {party.capacity && (
                        <div className={`mb-3 p-3 rounded-lg text-center font-bold ${
                          party.attendees.length >= party.capacity
                            ? 'bg-red-500/20 border border-red-500/30 text-red-300'
                            : party.attendees.length / party.capacity >= 0.8
                            ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300'
                            : 'bg-white/5 border border-white/10 text-gray-400'
                        }`}>
                          {party.attendees.length >= party.capacity ? (
                            <span>🔒 PARTY FULL - No More Spots</span>
                          ) : party.attendees.length / party.capacity >= 0.8 ? (
                            <span>⚠️ Only {party.capacity - party.attendees.length} spots left! Join now!</span>
                          ) : (
                            <span>{party.attendees.length} / {party.capacity} spots filled</span>
                          )}
                        </div>
                      )}

                      {/* FEATURE 3: Email Reminder Notification */}
                      {isAttending && (
                        <div className="mb-3 bg-cyan-500/20 border border-cyan-500/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">📧</span>
                            <span className="text-white font-bold text-sm">You'll Get Reminders!</span>
                          </div>
                          <p className="text-cyan-200 text-xs">
                            We'll email you 2 hours before the party starts so you don't forget. See you there!
                          </p>
                        </div>
                      )}

                      {party.hostEmail !== user.email && (
                        <button
                          onClick={() => isAttending ? handleLeaveParty(party.id) : handleJoinParty(party.id)}
                          disabled={!isAttending && isFull}
                          className={`w-full py-3 rounded-xl font-bold transition-all ${
                            isAttending
                              ? 'bg-red-500/20 text-red-300 border-2 border-red-500/30 hover:bg-red-500/30'
                              : isFull
                              ? 'bg-gray-500/20 text-gray-500 border-2 border-gray-500/30 cursor-not-allowed'
                              : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg hover:shadow-cyan-500/50'
                          }`}
                        >
                          {isAttending ? 'LEAVE PARTY' : isFull ? 'PARTY FULL' : 'JOIN PARTY'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ClaimVenueScreen = () => {
    const [venueName, setVenueName] = useState('');
    const [address, setAddress] = useState('');
    const [venueType, setVenueType] = useState('');
    const [phone, setPhone] = useState('');
    const [website, setWebsite] = useState('');
    const [proofDocument, setProofDocument] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const handleSubmit = () => {
      if (!venueName || !address || !venueType) {
        alert('Please fill in all required fields');
        return;
      }

      if (!acceptedTerms) {
        alert('You must accept the Venue Terms and Conditions to claim a venue.');
        return;
      }

      handleVenueClaim({
        venueName,
        address,
        venueType,
        phone,
        website,
        proofDocument
      });
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button
              onClick={() => setCurrentScreen('createParty')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-white/10 shadow-xl space-y-6">
            <div>
              <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                CLAIM YOUR VENUE
              </h2>
              <p className="text-gray-400">Submit your business for verification to get featured on Huddle Up</p>
            </div>

            {/* FEATURE 2: FREE TRIAL Banner */}
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/40 rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">🎁</span>
                <div>
                  <div className="text-white font-black text-xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                    14-Day FREE Trial
                  </div>
                  <div className="text-green-300 text-sm font-bold">No Credit Card Required!</div>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Try <strong>Featured</strong> status absolutely FREE for 14 days. See the results for yourself - more visibility, more parties, more customers. After the trial, it's only $199/month. Cancel anytime, no questions asked.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>Join 50+ venues already getting more customers with Huddle Up!</span>
              </div>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 text-sm text-cyan-200">
              <div className="font-bold mb-2">✓ Benefits of Verified Venues:</div>
              <ul className="space-y-1 ml-4">
                <li>• Show up first in watch party searches</li>
                <li>• Verified badge builds trust with customers</li>
                <li>• Track how many people find you through Huddle Up</li>
                <li>• Upgrade to Featured status for maximum visibility</li>
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., Buffalo Wild Wings Downtown"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Address *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="123 Main St, Fort Lauderdale, FL 33301"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Business Type *
              </label>
              <select
                value={venueType}
                onChange={(e) => setVenueType(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Select type...</option>
                <option value="Sports Bar">Sports Bar</option>
                <option value="Restaurant & Bar">Restaurant & Bar</option>
                <option value="Brewery/Taproom">Brewery/Taproom</option>
                <option value="Entertainment Venue">Entertainment Venue</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Proof of Ownership (optional)
              </label>
              <textarea
                value={proofDocument}
                onChange={(e) => setProofDocument(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Business license number, tax ID, or link to proof..."
              />
              <p className="text-xs text-gray-500 mt-1">Helps us verify faster. We'll follow up if needed.</p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 bg-white/10"
                />
                <span className="text-sm text-gray-300">
                  <strong className="text-white">Venue Agreement:</strong> I confirm that I am authorized to represent this venue. I agree to the{' '}
                  <a href="/terms" target="_blank" className="text-cyan-400 hover:text-cyan-300 underline">
                    Terms of Service
                  </a>
                  {' '}and understand that:
                  <ul className="mt-2 ml-4 space-y-1 text-xs">
                    <li>• I am solely responsible for all venue operations, safety, and compliance</li>
                    <li>• Huddle Up US is a platform only and not liable for any incidents at my venue</li>
                    <li>• I hold all necessary licenses, permits, and insurance</li>
                    <li>• Verification does not constitute endorsement or guarantee</li>
                  </ul>
                </span>
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!acceptedTerms}
              className={`w-full py-4 text-white font-bold text-lg rounded-2xl shadow-lg transform transition-all duration-200 ${
                acceptedTerms
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-cyan-500/50 hover:scale-105'
                  : 'bg-gray-500 cursor-not-allowed opacity-50'
              }`}
            >
              SUBMIT FOR VERIFICATION
            </button>

            <p className="text-xs text-gray-500 text-center">
              We typically review claims within 24-48 hours. You'll be notified at {user.email}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const AdminPanelScreen = () => {
    const pendingClaims = venueClaims.filter(c => c.status === 'pending');
    const approvedClaims = venueClaims.filter(c => c.status === 'approved');
    const rejectedClaims = venueClaims.filter(c => c.status === 'rejected');
    
    // Revenue Calculations
    const featuredVenues = venues.filter(v => v.featured && v.verified);
    const regularVenues = venues.filter(v => !v.featured && v.verified);
    const monthlyRecurringRevenue = (featuredVenues.length * 199) + (regularVenues.length * 0); // Free tier = $0
    const projectedAnnualRevenue = monthlyRecurringRevenue * 12;
    
    // Activity Metrics
    const totalUsers = 1; // In production, count all registered users
    const activeParties = parties.filter(p => {
      const game = games.find(g => g.id === p.gameId);
      return game && new Date(game.startTime) > new Date();
    });
    const totalAttendees = parties.reduce((sum, party) => sum + party.attendees.length, 0);
    
    // Sport Performance
    const sportStats = {};
    parties.forEach(party => {
      const game = games.find(g => g.id === party.gameId);
      if (game) {
        if (!sportStats[game.sport]) {
          sportStats[game.sport] = { parties: 0, attendees: 0 };
        }
        sportStats[game.sport].parties += 1;
        sportStats[game.sport].attendees += party.attendees.length;
      }
    });
    
    // Venue Performance Rankings
    const venuePerformance = venues
      .filter(v => v.verified)
      .map(venue => {
        const venueParties = parties.filter(p => p.venueId === venue.id);
        const venueAttendees = venueParties.reduce((sum, p) => sum + p.attendees.length, 0);
        return {
          ...venue,
          partiesHosted: venueParties.length,
          totalAttendees: venueAttendees,
          avgPartySize: venueParties.length > 0 ? Math.round(venueAttendees / venueParties.length) : 0
        };
      })
      .sort((a, b) => b.totalAttendees - a.totalAttendees);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                <Settings className="inline w-8 h-8 mr-2 text-cyan-400" />
                OWNER DASHBOARD
              </h1>
              <button
                onClick={() => setCurrentScreen('games')}
                className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-white"
              >
                Back to App
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          
          {/* Revenue Overview */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 p-8 rounded-2xl">
            <h2 className="text-2xl font-black text-white mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              💰 REVENUE OVERVIEW
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-green-300 mb-2">Monthly Recurring Revenue (MRR)</div>
                <div className="text-4xl font-black text-white mb-1">
                  ${monthlyRecurringRevenue.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">
                  {featuredVenues.length} Featured venues × $199/mo
                </div>
              </div>
              
              <div>
                <div className="text-sm text-green-300 mb-2">Projected Annual Revenue (ARR)</div>
                <div className="text-4xl font-black text-white mb-1">
                  ${projectedAnnualRevenue.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">
                  Based on current subscriptions
                </div>
              </div>
              
              <div>
                <div className="text-sm text-green-300 mb-2">Average Revenue Per Venue</div>
                <div className="text-4xl font-black text-white mb-1">
                  ${venues.filter(v => v.verified).length > 0 ? 
                    Math.round(monthlyRecurringRevenue / venues.filter(v => v.verified).length) : 0}
                </div>
                <div className="text-xs text-gray-400">
                  Per month
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
              <div className="text-gray-400 text-sm mb-1">Total Users</div>
              <div className="text-3xl font-black text-white">{totalUsers}</div>
              <div className="text-xs text-gray-500 mt-1">Registered accounts</div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
              <div className="text-gray-400 text-sm mb-1">Active Parties</div>
              <div className="text-3xl font-black text-cyan-400">{activeParties.length}</div>
              <div className="text-xs text-gray-500 mt-1">Upcoming watch parties</div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
              <div className="text-gray-400 text-sm mb-1">Verified Venues</div>
              <div className="text-3xl font-black text-white">{venues.filter(v => v.verified).length}</div>
              <div className="text-xs text-gray-500 mt-1">
                {featuredVenues.length} Featured, {regularVenues.length} Free
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
              <div className="text-gray-400 text-sm mb-1">Total Reach</div>
              <div className="text-3xl font-black text-purple-400">{totalAttendees}</div>
              <div className="text-xs text-gray-500 mt-1">People using platform</div>
            </div>
          </div>

          {/* Pending Actions */}
          {pendingClaims.length > 0 && (
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-white mb-1">⚠️ Action Required</h3>
                  <p className="text-yellow-200 text-sm">
                    You have {pendingClaims.length} pending venue claim{pendingClaims.length !== 1 ? 's' : ''} to review
                  </p>
                </div>
                <button
                  onClick={() => {
                    document.getElementById('venue-claims-section').scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-all"
                >
                  Review Claims
                </button>
              </div>
            </div>
          )}

          {/* Sport Performance */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-black text-white mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              <BarChart3 className="inline w-6 h-6 mr-2 text-cyan-400" />
              SPORT PERFORMANCE
            </h2>
            
            {Object.keys(sportStats).length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No watch parties created yet
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(sportStats)
                  .sort((a, b) => b[1].attendees - a[1].attendees)
                  .map(([sport, stats]) => (
                    <div key={sport} className="bg-white/5 p-5 rounded-xl border border-white/10">
                      <div className="text-cyan-400 font-bold mb-2">{sport}</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Parties:</span>
                          <span className="text-white font-bold">{stats.parties}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Attendees:</span>
                          <span className="text-white font-bold">{stats.attendees}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Avg Size:</span>
                          <span className="text-white font-bold">
                            {Math.round(stats.attendees / stats.parties)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Top Performing Venues */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-black text-white mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              🏆 TOP PERFORMING VENUES
            </h2>
            
            {venuePerformance.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No venues yet
              </div>
            ) : (
              <div className="space-y-3">
                {venuePerformance.slice(0, 10).map((venue, index) => (
                  <div
                    key={venue.id}
                    className="bg-white/5 p-5 rounded-xl border border-white/10 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-2xl font-black text-gray-600">#{index + 1}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white">{venue.name}</h3>
                          {venue.featured && (
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full">
                              ⭐ FEATURED
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400">{venue.address}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Parties</div>
                        <div className="text-lg font-bold text-white">{venue.partiesHosted}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Attendees</div>
                        <div className="text-lg font-bold text-cyan-400">{venue.totalAttendees}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Avg Size</div>
                        <div className="text-lg font-bold text-purple-400">{venue.avgPartySize}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Venue Claims */}
          <div id="venue-claims-section" className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-black text-white mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Venue Claims to Review ({pendingClaims.length} Pending)
            </h2>

            {pendingClaims.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No pending claims to review
              </div>
            ) : (
              <div className="space-y-4">
                {pendingClaims.map(claim => (
                  <div
                    key={claim.id}
                    className="bg-white/5 p-6 rounded-xl border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{claim.venueName}</h3>
                        <div className="space-y-1 text-sm text-gray-400">
                          <div><span className="text-gray-500">Address:</span> {claim.address}</div>
                          <div><span className="text-gray-500">Type:</span> {claim.venueType}</div>
                          {claim.phone && <div><span className="text-gray-500">Phone:</span> {claim.phone}</div>}
                          {claim.website && <div><span className="text-gray-500">Website:</span> {claim.website}</div>}
                          {claim.proofDocument && <div><span className="text-gray-500">Proof:</span> {claim.proofDocument}</div>}
                          <div className="mt-2"><span className="text-gray-500">Submitted by:</span> {claim.submittedByName} ({claim.submittedBy})</div>
                          <div><span className="text-gray-500">Date:</span> {new Date(claim.submittedAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApproveVenueClaim(claim.id)}
                        className="flex-1 py-3 bg-green-500/20 text-green-300 rounded-xl font-bold hover:bg-green-500/30 border border-green-500/30 transition-all"
                      >
                        ✓ APPROVE
                      </button>
                      <button
                        onClick={() => handleRejectVenueClaim(claim.id)}
                        className="flex-1 py-3 bg-red-500/20 text-red-300 rounded-xl font-bold hover:bg-red-500/30 border border-red-500/30 transition-all"
                      >
                        ✗ REJECT
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Claim History */}
            {(approvedClaims.length > 0 || rejectedClaims.length > 0) && (
              <div className="mt-8 pt-8 border-t border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Recent Claim History</h3>
                <div className="space-y-2">
                  {[...approvedClaims, ...rejectedClaims]
                    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
                    .slice(0, 5)
                    .map(claim => (
                      <div key={claim.id} className="flex items-center justify-between text-sm p-3 bg-white/5 rounded-lg">
                        <div>
                          <span className="text-white font-bold">{claim.venueName}</span>
                          <span className="text-gray-500 ml-2">by {claim.submittedByName}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          claim.status === 'approved' 
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {claim.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* All Venues Management */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-black text-white mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              All Verified Venues ({venues.filter(v => v.verified).length})
            </h2>

            <div className="space-y-3">
              {venues.filter(v => v.verified).map(venue => (
                <div
                  key={venue.id}
                  className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white">{venue.name}</h3>
                      {venue.featured && (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full">
                          ⭐ FEATURED ($199/mo)
                        </span>
                      )}
                      {!venue.featured && (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs font-bold rounded-full">
                          FREE TIER
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">{venue.address}</div>
                    <div className="text-xs text-gray-500">{venue.type}</div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-gray-400 text-xs">Parties Hosted</div>
                      <div className="text-white font-bold">
                        {parties.filter(p => p.venueId === venue.id).length}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-400 text-xs">Revenue</div>
                      <div className="text-green-400 font-bold">
                        ${venue.featured ? '199' : '0'}/mo
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CreatePartyScreen = () => {
    const [useVerifiedVenue, setUseVerifiedVenue] = useState(true);
    const [selectedVenueId, setSelectedVenueId] = useState('');
    const [customLocation, setCustomLocation] = useState('');
    const [customTime, setCustomTime] = useState('');
    const [capacity, setCapacity] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = () => {
      let location = '';
      let venueId = null;
      
      if (useVerifiedVenue) {
        if (!selectedVenueId) {
          alert('Please select a venue');
          return;
        }
        const venue = venues.find(v => v.id === selectedVenueId);
        location = `${venue.name} - ${venue.address}`;
        venueId = selectedVenueId;
      } else {
        if (!customLocation) {
          alert('Please enter a location');
          return;
        }
        location = customLocation;
      }

      handleCreateParty({
        gameId: selectedGame.id,
        location,
        venueId,
        customTime,
        capacity: capacity ? parseInt(capacity) : null,
        notes
      });
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button
              onClick={() => setCurrentScreen('gameDetail')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-white/10 shadow-xl space-y-6">
            <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              CREATE WATCH PARTY
            </h2>

            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
              <div className="text-sm text-cyan-300 font-bold mb-1">GAME</div>
              <div className="text-white font-bold">
                {selectedGame.homeTeam} vs {selectedGame.awayTeam}
              </div>
              <div className="text-gray-400 text-sm">
                {formatDateTime(selectedGame.startTime)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Choose Location Type
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setUseVerifiedVenue(true)}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
                    useVerifiedVenue
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <Building2 className="w-5 h-5 inline mr-2" />
                  Verified Venue
                </button>
                <button
                  onClick={() => setUseVerifiedVenue(false)}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
                    !useVerifiedVenue
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <MapPin className="w-5 h-5 inline mr-2" />
                  Custom Location
                </button>
              </div>
            </div>

            {useVerifiedVenue ? (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Verified Venue *
                </label>
                <select
                  value={selectedVenueId}
                  onChange={(e) => setSelectedVenueId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Choose a venue...</option>
                  {venues.filter(v => v.verified).map(venue => (
                    <option key={venue.id} value={venue.id}>
                      {venue.featured ? '⭐ ' : ''}{venue.name} - {venue.address}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  ✓ Verified venues are legitimate businesses we've confirmed
                </p>
                <button
                  onClick={() => setCurrentScreen('claimVenue')}
                  className="text-cyan-400 text-sm hover:text-cyan-300 mt-2"
                >
                  Don't see your venue? Claim it here →
                </button>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Custom Location *
                </label>
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="e.g., My house, Dave's apartment, etc."
                />
                <p className="text-xs text-gray-500 mt-1">For home watch parties or informal meetups</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Custom Time (optional)
              </label>
              <input
                type="text"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., Meet at 5:30 PM (game starts at 6 PM)"
              />
              <p className="text-xs text-gray-500 mt-1">Leave blank to use game start time</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Capacity (optional)
              </label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Max number of people"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes / Description (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Any additional details about your watch party..."
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-200"
            >
              CREATE PARTY
            </button>
          </div>
        </div>
      </div>
    );
  };

  const VenueAnalyticsDashboard = () => {
    if (!userVenue) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
          <div className="text-center">
            <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Venue Found</h2>
            <p className="text-gray-400 mb-6">You don't have a claimed venue yet.</p>
            <button
              onClick={() => setCurrentScreen('claimVenue')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl"
            >
              Claim Your Venue
            </button>
          </div>
        </div>
      );
    }

    // Calculate analytics
    const venueParties = parties.filter(p => p.venueId === userVenue.id);
    const totalAttendees = venueParties.reduce((sum, party) => sum + party.attendees.length, 0);
    const upcomingParties = venueParties.filter(party => {
      const game = games.find(g => g.id === party.gameId);
      return game && new Date(game.startTime) > new Date();
    });
    
    // Sport breakdown
    const sportBreakdown = {};
    venueParties.forEach(party => {
      const game = games.find(g => g.id === party.gameId);
      if (game) {
        sportBreakdown[game.sport] = (sportBreakdown[game.sport] || 0) + 1;
      }
    });

    // Recent parties
    const recentParties = venueParties
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentScreen('games')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <div className="flex items-center gap-2">
                {userVenue.featured && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm font-bold rounded-full border border-purple-500/30">
                    ⭐ FEATURED VENUE
                  </span>
                )}
                {userVenue.verified && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm font-bold rounded-full border border-green-500/30 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    VERIFIED
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          {/* Venue Header */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-white/10 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  {userVenue.name}
                </h1>
                <p className="text-gray-400 mb-1">{userVenue.address}</p>
                <p className="text-sm text-gray-500">{userVenue.type}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-1">Your Plan</div>
                <div className="text-2xl font-black text-cyan-400">
                  {userVenue.featured ? 'FEATURED' : 'FREE'}
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade CTA - only show if not featured */}
          {!userVenue.featured && (
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 p-6 rounded-2xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-black text-white mb-2">Upgrade to Featured</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Get 3x more visibility! Featured venues appear first in party creation and get priority placement in search results.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-300 mb-4">
                    <li>✓ ⭐ Featured badge on all your parties</li>
                    <li>✓ Top of venue selection dropdown</li>
                    <li>✓ Priority in search results</li>
                    <li>✓ Advanced analytics & insights</li>
                  </ul>
                  <div className="text-2xl font-black text-white mb-4">
                    $99<span className="text-sm text-gray-400">/month</span>
                  </div>
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all">
                  UPGRADE NOW
                </button>
              </div>
            </div>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="text-sm text-gray-400">Total Reach</div>
              </div>
              <div className="text-3xl font-black text-white">{totalAttendees}</div>
              <div className="text-xs text-gray-500 mt-1">People found you</div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-sm text-gray-400">Total Parties</div>
              </div>
              <div className="text-3xl font-black text-white">{venueParties.length}</div>
              <div className="text-xs text-gray-500 mt-1">All time</div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Trophy className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-sm text-gray-400">Upcoming</div>
              </div>
              <div className="text-3xl font-black text-white">{upcomingParties.length}</div>
              <div className="text-xs text-gray-500 mt-1">Next 7 days</div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="text-sm text-gray-400">Avg Party Size</div>
              </div>
              <div className="text-3xl font-black text-white">
                {venueParties.length > 0 ? Math.round(totalAttendees / venueParties.length) : 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">People per party</div>
            </div>
          </div>

          {/* Sport Breakdown */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-black text-white mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              <BarChart3 className="inline w-6 h-6 mr-2 text-cyan-400" />
              Sport Breakdown
            </h2>
            
            {Object.keys(sportBreakdown).length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No watch parties yet
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(sportBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([sport, count]) => {
                    const percentage = Math.round((count / venueParties.length) * 100);
                    return (
                      <div key={sport}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-bold">{sport}</span>
                          <span className="text-gray-400 text-sm">{count} parties ({percentage}%)</span>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Recent Parties */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-black text-white mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Recent Watch Parties
            </h2>
            
            {recentParties.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No watch parties yet. People will start hosting at your venue soon!
              </div>
            ) : (
              <div className="space-y-3">
                {recentParties.map(party => {
                  const game = games.find(g => g.id === party.gameId);
                  if (!game) return null;
                  
                  return (
                    <div
                      key={party.id}
                      className="bg-white/5 p-5 rounded-xl border border-white/10 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-bold rounded-full">
                            {game.sport}
                          </span>
                          <span className="text-white font-bold">
                            {game.homeTeam} vs {game.awayTeam}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">
                          Hosted by {party.hostName} • {party.attendees.length} attendees
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        {new Date(party.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tips for Venues */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 p-6 rounded-2xl">
            <h3 className="text-lg font-black text-white mb-4">💡 Tips to Get More Watch Parties</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Promote your Huddle Up presence on social media and in-store</li>
              <li>• Offer specials during big games to attract more groups</li>
              <li>• Encourage hosts to leave notes about your venue's amenities</li>
              <li>• Consider upgrading to Featured to appear first in searches</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const ProfileScreen = () => {
    const myParties = parties.filter(party => userParties.includes(party.id));
    const hostedParties = myParties.filter(party => party.hostEmail === user.email);
    const joinedParties = myParties.filter(party => party.hostEmail !== user.email);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentScreen('games')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-white/10 shadow-xl text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {user.name}
            </h1>
            <p className="text-gray-400">{user.email}</p>
          </div>

          {/* MY FAVORITE TEAMS SECTION */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/10 shadow-xl">
            <h2 className="text-2xl font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              ⭐ MY FAVORITE TEAMS
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Select your favorite teams so you can find fellow fans anywhere!
            </p>

            <div className="space-y-4">
              {['NFL', 'NBA', 'MLB', 'NHL', 'College Football', 'College Basketball', 'Premier League', 'La Liga MX', 'MLS'].map(sport => {
                const currentTeam = user.favoriteTeams?.[sport];
                return (
                  <div key={sport} className="bg-white/5 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-bold">{sport}</span>
                      {currentTeam && (
                        <button
                          onClick={() => removeFavoriteTeam(sport)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <select
                      value={currentTeam || ''}
                      onChange={(e) => updateFavoriteTeams(sport, e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="">Select your {sport} team...</option>
                      {TEAMS_BY_SPORT[sport]?.map(team => (
                        <option key={team} value={team}>{team}</option>
                      ))}
                    </select>
                    {currentTeam && (
                      <div className="mt-2 flex items-center gap-2 text-cyan-400 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>You support the {currentTeam}!</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              My Watch Parties
            </h2>

            {myParties.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10 text-center">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 mb-4">You haven't joined any watch parties yet</p>
                <button
                  onClick={() => setCurrentScreen('games')}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl"
                >
                  Browse Games
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {hostedParties.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-300 mb-3">Hosting ({hostedParties.length})</h3>
                    <div className="space-y-3">
                      {hostedParties.map(party => {
                        const game = SAMPLE_GAMES.find(g => g.gameId === party.gameId);
                        return (
                          <div
                            key={party.id}
                            className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-xl border border-white/10"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-bold rounded-full border border-yellow-500/30">
                                HOST
                              </span>
                            </div>
                            <div className="text-white font-bold mb-1">
                              {SAMPLE_GAMES.find(g => g.id === party.gameId)?.homeTeam} vs{' '}
                              {SAMPLE_GAMES.find(g => g.id === party.gameId)?.awayTeam}
                            </div>
                            <div className="text-sm text-gray-400 space-y-1">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3" />
                                {party.location}
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-3 h-3" />
                                {party.attendees.length} people joined
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {joinedParties.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-300 mb-3">Joined ({joinedParties.length})</h3>
                    <div className="space-y-3">
                      {joinedParties.map(party => (
                        <div
                          key={party.id}
                          className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-xl border border-white/10"
                        >
                          <div className="text-white font-bold mb-1">
                            {SAMPLE_GAMES.find(g => g.id === party.gameId)?.homeTeam} vs{' '}
                            {SAMPLE_GAMES.find(g => g.id === party.gameId)?.awayTeam}
                          </div>
                          <div className="text-sm text-gray-400 space-y-1">
                            <div>Hosted by {party.hostName}</div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              {party.location}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans">
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

      {/* FEATURE 1: Onboarding Tutorial Overlay */}
      {showOnboarding && <OnboardingOverlay />}

      {currentScreen === 'welcome' && <WelcomeScreen />}
      {currentScreen === 'login' && <LoginScreen />}
      {currentScreen === 'signup' && <SignUpScreen />}
      {currentScreen === 'games' && <GamesScreen />}
      {currentScreen === 'gameDetail' && <GameDetailScreen />}
      {currentScreen === 'createParty' && <CreatePartyScreen />}
      {currentScreen === 'claimVenue' && <ClaimVenueScreen />}
      {currentScreen === 'admin' && <AdminPanelScreen />}
      {currentScreen === 'venueDashboard' && <VenueAnalyticsDashboard />}
      {currentScreen === 'profile' && <ProfileScreen />}
    </div>
  );
};

export default HuddleUpApp;