import pool from './db.js';
import { sendPushToUser } from './routes/push.js';

const ESPN_ENDPOINTS = {
  'NFL': 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
  'NBA': 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
  'MLB': 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard',
  'NHL': 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard',
  'College Football': 'https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard',
  'College Basketball': 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard',
  'Premier League': 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard',
  'La Liga': 'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard',
  'Liga MX': 'https://site.api.espn.com/apis/site/v2/sports/soccer/mex.1/scoreboard',
  'MLS': 'https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard',
  'Champions League': 'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard',
  'UFC': 'https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard',
};

let cachedScores = {};

async function fetchAllScores() {
  const scores = {};
  for (const [sport, url] of Object.entries(ESPN_ENDPOINTS)) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.events) {
        for (const event of data.events) {
          const gameId = event.id;
          const competitors = event.competitions?.[0]?.competitors || [];
          const home = competitors.find(c => c.homeAway === 'home');
          const away = competitors.find(c => c.homeAway === 'away');
          const status = event.status?.type?.description || '';
          const shortDetail = event.status?.type?.shortDetail || event.status?.displayClock || '';
          scores[gameId] = {
            sport,
            homeTeam: home?.team?.displayName || '',
            awayTeam: away?.team?.displayName || '',
            homeScore: home?.score || '0',
            awayScore: away?.score || '0',
            status,
            detail: event.competitions?.[0]?.status?.type?.shortDetail || shortDetail,
            isLive: status === 'In Progress'
          };
        }
      }
    } catch (err) {
    }
  }
  return scores;
}

async function checkAndNotify() {
  try {
    const watches = await pool.query(
      `SELECT sw.user_id, sw.game_id, sw.last_notified_score, sw.home_team, sw.away_team, sw.sport
       FROM score_watches sw
       JOIN push_subscriptions ps ON ps.user_id = sw.user_id`
    );

    if (watches.rows.length === 0) return;

    const scores = await fetchAllScores();
    cachedScores = scores;

    for (const watch of watches.rows) {
      const game = scores[watch.game_id];
      if (!game) continue;

      const currentScore = `${game.homeScore}-${game.awayScore}`;
      if (currentScore === watch.last_notified_score) continue;
      if (currentScore === '0-0' && !game.isLive) continue;

      await pool.query(
        'UPDATE score_watches SET last_notified_score = $1 WHERE user_id = $2 AND game_id = $3',
        [currentScore, watch.user_id, watch.game_id]
      );

      const payload = {
        title: `${game.homeTeam} vs ${game.awayTeam}`,
        body: `${game.homeTeam} ${game.homeScore} - ${game.awayScore} ${game.awayTeam}${game.detail ? ' | ' + game.detail : ''}`,
        icon: '/huddle-up-logo-2.png',
        badge: '/huddle-up-logo-2.png',
        tag: `score-${watch.game_id}`,
        data: { gameId: watch.game_id, url: '/' }
      };

      await sendPushToUser(watch.user_id, payload);
    }
  } catch (error) {
    console.error('Score checker error:', error);
  }
}

let intervalId = null;

export function startScoreChecker() {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.log('Push notifications not configured - score checker disabled');
    return;
  }
  console.log('Score checker started - checking every 60 seconds');
  checkAndNotify();
  intervalId = setInterval(checkAndNotify, 60 * 1000);
}

export function stopScoreChecker() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
