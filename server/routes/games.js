import { Router } from 'express';

const router = Router();

const ESPN_ENDPOINTS = {
  'NFL': 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
  'NBA': 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
  'MLB': 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard',
  'NHL': 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard',
  'College Football': 'https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard',
  'College Basketball': 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard',
  'MLS': 'https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard',
  'Premier League': 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard',
  'Liga MX': 'https://site.api.espn.com/apis/site/v2/sports/soccer/mex.1/scoreboard',
  'La Liga': 'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard',
  'Champions League': 'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard',
  'Formula 1': 'https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard',
  'Tennis': 'https://site.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard',
  'Rugby': 'https://site.api.espn.com/apis/site/v2/sports/rugby/rugby-union/scoreboard',
  'Cricket': 'https://site.api.espn.com/apis/site/v2/sports/cricket/icc/scoreboard',
  'UFC': 'https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard',
};

let gamesCache = { data: null, timestamp: 0 };
const CACHE_TTL = 60 * 1000;

function parseESPNEvent(event, sport) {
  const competition = event.competitions?.[0];
  if (!competition) return null;

  const homeCompetitor = competition.competitors?.find(c => c.homeAway === 'home');
  const awayCompetitor = competition.competitors?.find(c => c.homeAway === 'away');

  if (!homeCompetitor || !awayCompetitor) return null;

  const status = event.status?.type;
  let gameStatus = 'scheduled';
  let statusDetail = '';

  if (status) {
    if (status.state === 'in') {
      gameStatus = 'live';
      statusDetail = status.shortDetail || status.detail || '';
    } else if (status.state === 'post') {
      gameStatus = 'final';
      statusDetail = status.shortDetail || 'Final';
    } else {
      gameStatus = 'scheduled';
      statusDetail = status.shortDetail || '';
    }
  }

  return {
    id: `${sport.toLowerCase().replace(/\s+/g, '')}_${event.id}`,
    espnId: event.id,
    sport,
    homeTeam: homeCompetitor.team?.displayName || homeCompetitor.team?.name || 'TBD',
    awayTeam: awayCompetitor.team?.displayName || awayCompetitor.team?.name || 'TBD',
    homeScore: parseInt(homeCompetitor.score) || 0,
    awayScore: parseInt(awayCompetitor.score) || 0,
    homeLogo: homeCompetitor.team?.logo || null,
    awayLogo: awayCompetitor.team?.logo || null,
    homeRecord: homeCompetitor.records?.[0]?.summary || '',
    awayRecord: awayCompetitor.records?.[0]?.summary || '',
    startTime: event.date,
    venue: competition.venue?.fullName || '',
    gameStatus,
    statusDetail,
    broadcast: competition.broadcasts?.[0]?.names?.[0] || '',
  };
}

async function fetchAllGames() {
  const now = Date.now();
  if (gamesCache.data && (now - gamesCache.timestamp) < CACHE_TTL) {
    return gamesCache.data;
  }

  const allGames = [];
  const fetchPromises = Object.entries(ESPN_ENDPOINTS).map(async ([sport, url]) => {
    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) return [];
      const data = await response.json();
      const events = data.events || [];
      return events.map(e => parseESPNEvent(e, sport)).filter(Boolean);
    } catch (err) {
      console.error(`Failed to fetch ${sport} games:`, err.message);
      return [];
    }
  });

  const results = await Promise.all(fetchPromises);
  results.forEach(games => allGames.push(...games));

  allGames.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  gamesCache = { data: allGames, timestamp: now };
  return allGames;
}

router.get('/', async (req, res) => {
  try {
    const games = await fetchAllGames();
    const now = new Date();
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

    const filtered = games.filter(game => {
      if (game.gameStatus === 'live') return true;
      if (game.gameStatus === 'scheduled') {
        const gameTime = new Date(game.startTime);
        return gameTime >= sixHoursAgo;
      }
      if (game.gameStatus === 'final') {
        const gameTime = new Date(game.startTime);
        const estimatedEndTime = new Date(gameTime.getTime() + 4 * 60 * 60 * 1000);
        return estimatedEndTime >= sixHoursAgo;
      }
      return false;
    });

    res.json(filtered);
  } catch (error) {
    console.error('Games fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

export default router;
