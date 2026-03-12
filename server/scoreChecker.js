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
  'Boxing': 'https://site.api.espn.com/apis/site/v2/sports/boxing/scoreboard',
};

let cachedScores = {};

async function fetchAllScores() {
  const scores = {};
  for (const [sport, url] of Object.entries(ESPN_ENDPOINTS)) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
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

    const scores = await fetchAllScores();
    cachedScores = scores;

    if (watches.rows.length === 0) return;

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

async function sendPartyReminders() {
  try {
    const parties = await pool.query(
      `SELECT p.id, p.home_team, p.away_team, p.venue_name, p.game_time, pa.user_id
       FROM parties p
       JOIN party_attendees pa ON pa.party_id = p.id
       WHERE p.game_time IS NOT NULL
       AND p.game_time ~ '^[0-9]{4}-'
       AND p.game_time::timestamptz BETWEEN NOW() + INTERVAL '55 minutes' AND NOW() + INTERVAL '65 minutes'`
    );
    for (const row of parties.rows) {
      sendPushToUser(row.user_id, {
        title: 'Game starts soon! 🏒',
        body: `${row.home_team} vs ${row.away_team}${row.venue_name ? ' at ' + row.venue_name : ''} in 1 hour`,
        icon: '/huddle-up-logo-2.png',
        tag: `party-reminder-${row.id}`,
        data: { url: '/' }
      }, { prefType: 'party_reminders' }).catch(e => console.error('Party reminder push error:', e));
    }
  } catch (err) {
    if (err.code !== '22007') console.error('Party reminder error:', err);
  }
}

async function autoResolvePredictions() {
  try {
    const pending = await pool.query(
      `SELECT DISTINCT game_id, sport, home_team, away_team
       FROM predictions
       WHERE status = 'pending'`
    );
    if (pending.rows.length === 0) return;

    const scores = cachedScores;
    for (const game of pending.rows) {
      const scoreData = scores[game.game_id];
      if (!scoreData || scoreData.status !== 'Final') continue;

      const homeScore = parseInt(scoreData.homeScore) || 0;
      const awayScore = parseInt(scoreData.awayScore) || 0;
      if (homeScore === awayScore) continue;

      const winner = homeScore > awayScore ? scoreData.homeTeam : scoreData.awayTeam;
      console.log(`Auto-resolving predictions for game ${game.game_id}: ${winner} wins (${homeScore}-${awayScore})`);

      const preds = await pool.query(
        `SELECT * FROM predictions WHERE game_id = $1 AND status = 'pending'`,
        [game.game_id]
      );

      for (const pred of preds.rows) {
        const isCorrect = pred.picked_team === winner;
        let pointsEarned = 0;

        if (isCorrect) {
          pointsEarned = 50 * pred.confidence;

          const streakResult = await pool.query(
            `INSERT INTO prediction_streaks (user_id, current_streak, best_streak, total_correct, total_predictions)
             VALUES ($1, 1, 1, 1, 1)
             ON CONFLICT (user_id) DO UPDATE SET
               current_streak = prediction_streaks.current_streak + 1,
               best_streak = GREATEST(prediction_streaks.best_streak, prediction_streaks.current_streak + 1),
               total_correct = prediction_streaks.total_correct + 1,
               total_predictions = prediction_streaks.total_predictions + 1,
               updated_at = NOW()
             RETURNING current_streak`,
            [pred.user_id]
          );

          const newStreak = streakResult.rows[0].current_streak;
          if (newStreak === 5) pointsEarned += 100;
          if (newStreak === 10) pointsEarned += 250;

          const userResult = await pool.query('SELECT subscription_tier FROM users WHERE id = $1', [pred.user_id]);
          const isPro = userResult.rows[0]?.subscription_tier === 'pro';
          const finalPoints = isPro ? pointsEarned * 3 : pointsEarned;

          await pool.query(
            `INSERT INTO user_points (user_id, total_points, lifetime_points, updated_at)
             VALUES ($1, $2, $2, NOW())
             ON CONFLICT (user_id)
             DO UPDATE SET total_points = user_points.total_points + $2,
                           lifetime_points = user_points.lifetime_points + $2,
                           updated_at = NOW()`,
            [pred.user_id, finalPoints]
          );

          await pool.query(
            `INSERT INTO points_history (user_id, points, action, description, reference_id)
             VALUES ($1, $2, 'prediction_correct', $3, $4)`,
            [pred.user_id, finalPoints, `Correct prediction: ${pred.picked_team} (${pred.confidence}/10 confidence)${isPro ? ' (3x Pro)' : ''}`, pred.id]
          );

          pointsEarned = finalPoints;

          try {
            await sendPushToUser(pred.user_id, {
              title: `You won! +${pointsEarned} points`,
              body: `${pred.picked_team} won! Your prediction was correct.`,
              icon: '/huddle-up-logo-2.png',
              url: '/predictions'
            }, { prefType: 'prediction_results' });
          } catch (pushErr) { console.error('Push notification error (win):', pushErr); }
        } else {
          await pool.query(
            `INSERT INTO prediction_streaks (user_id, current_streak, best_streak, total_correct, total_predictions)
             VALUES ($1, 0, 0, 0, 1)
             ON CONFLICT (user_id) DO UPDATE SET
               current_streak = 0,
               total_predictions = prediction_streaks.total_predictions + 1,
               updated_at = NOW()`,
            [pred.user_id]
          );

          try {
            await sendPushToUser(pred.user_id, {
              title: 'Better luck next time!',
              body: `${winner} won. Your pick was ${pred.picked_team}.`,
              icon: '/huddle-up-logo-2.png',
              url: '/predictions'
            }, { prefType: 'prediction_results' });
          } catch (pushErr) { console.error('Push notification error (loss):', pushErr); }
        }

        await pool.query(
          `UPDATE predictions SET status = $1, winner = $2, points_earned = $3, resolved_at = NOW()
           WHERE id = $4`,
          [isCorrect ? 'correct' : 'incorrect', winner, pointsEarned, pred.id]
        );
      }
    }
  } catch (err) {
    console.error('Auto-resolve predictions error:', err);
  }
}

async function sendPredictionReminders() {
  try {
    const games = await pool.query(
      `SELECT DISTINCT game_id, sport, home_team, away_team, game_time
       FROM predictions
       WHERE status = 'pending'
       AND game_time IS NOT NULL
       AND game_time BETWEEN NOW() + INTERVAL '25 minutes' AND NOW() + INTERVAL '35 minutes'`
    );
    for (const game of games.rows) {
      const subs = await pool.query('SELECT DISTINCT user_id FROM push_subscriptions');
      const alreadyPredicted = await pool.query(
        `SELECT user_id FROM predictions WHERE game_id = $1 AND status = 'pending'`,
        [game.game_id]
      );
      const predSet = new Set(alreadyPredicted.rows.map(r => r.user_id));
      for (const u of subs.rows) {
        if (!predSet.has(u.user_id)) {
          sendPushToUser(u.user_id, {
            title: 'Last chance to predict! ⚡',
            body: `${game.home_team} vs ${game.away_team} starts in 30 minutes. Make your pick!`,
            icon: '/huddle-up-logo-2.png',
            tag: `predict-reminder-${game.game_id}`,
            data: { url: '/predictions' }
          }, { prefType: 'prediction_reminders' }).catch(e => console.error('Prediction reminder push error:', e));
        }
      }
    }
  } catch (err) {
    if (err.code !== '22007') console.error('Prediction reminder error:', err);
  }
}

async function updateHotParties() {
  try {
    const parties = await pool.query(`
      SELECT p.id, p.game_time,
        (SELECT COUNT(*) FROM party_attendees pa WHERE pa.party_id = p.id) as total_attendees,
        (SELECT COUNT(*) FROM party_attendees pa WHERE pa.party_id = p.id AND pa.joined_at > NOW() - INTERVAL '2 hours') as recent_joins,
        (SELECT COUNT(*) FROM party_messages pm WHERE pm.party_id = p.id AND pm.created_at > NOW() - INTERVAL '1 hour') as recent_messages
      FROM parties p
      WHERE p.game_time IS NOT NULL AND p.game_time ~ '^[0-9]{4}-'
        AND p.game_time::timestamptz >= NOW() - INTERVAL '2 hours'
        AND p.game_time::timestamptz <= NOW() + INTERVAL '24 hours'
    `);
    for (const party of parties.rows) {
      const gt = new Date(party.game_time);
      const hoursUntil = (gt - Date.now()) / 3600000;
      let timeFactor = 1;
      if (hoursUntil <= 0) timeFactor = 5;
      else if (hoursUntil <= 2) timeFactor = 3;
      else if (hoursUntil <= 4) timeFactor = 2;
      const hotScore = (parseInt(party.recent_joins) || 0) * 10
        + (parseInt(party.total_attendees) || 0) * 2
        + (parseInt(party.recent_messages) || 0) * 5
        + timeFactor * 20;
      const trending = hotScore > 100;
      await pool.query('UPDATE parties SET hot_score = $1, is_trending = $2 WHERE id = $3', [hotScore, trending, party.id]);
    }
  } catch (err) {
    if (err.code !== '22007' && err.code !== '42703') console.error('Hot parties update error:', err);
  }
}

let hotPartiesCounter = 0;
let intervalId = null;

export function startScoreChecker() {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.log('Push notifications not configured - starting score checker with auto-resolve and hot parties');
    fetchAllScores().then(s => { cachedScores = s; autoResolvePredictions(); }).catch(e => console.error('Score fetch error:', e));
    updateHotParties();
    intervalId = setInterval(() => {
      fetchAllScores().then(s => { cachedScores = s; autoResolvePredictions(); }).catch(e => console.error('Score fetch error:', e));
      hotPartiesCounter++;
      if (hotPartiesCounter % 5 === 0) updateHotParties();
    }, 60 * 1000);
    return;
  }
  console.log('Score checker started - checking every 60 seconds');
  checkAndNotify().then(() => autoResolvePredictions()).catch(e => console.error('Check and notify error:', e));
  sendPartyReminders();
  sendPredictionReminders();
  updateHotParties();
  intervalId = setInterval(() => {
    checkAndNotify().then(() => autoResolvePredictions()).catch(e => console.error('Check and notify error:', e));
    sendPartyReminders();
    sendPredictionReminders();
    hotPartiesCounter++;
    if (hotPartiesCounter % 5 === 0) updateHotParties();
  }, 60 * 1000);
}

export function stopScoreChecker() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
