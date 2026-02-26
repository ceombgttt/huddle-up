import { Router } from 'express';
import pool from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { sendPushToUser } from './push.js';

const router = Router();

const POINT_VALUES = {
  base: 50,
  streak_5: 100,
  streak_10: 250,
  upset_bonus: 200,
};

async function awardPredictionPoints(userId, points, description, referenceId = null) {
  const userResult = await pool.query('SELECT subscription_tier FROM users WHERE id = $1', [userId]);
  const isPro = userResult.rows[0]?.subscription_tier === 'pro';
  if (isPro) points *= 3;

  await pool.query(
    `INSERT INTO user_points (user_id, total_points, lifetime_points, updated_at)
     VALUES ($1, $2, $2, NOW())
     ON CONFLICT (user_id)
     DO UPDATE SET total_points = user_points.total_points + $2,
                   lifetime_points = user_points.lifetime_points + $2,
                   updated_at = NOW()`,
    [userId, points]
  );

  await pool.query(
    `INSERT INTO points_history (user_id, points, action, description, reference_id)
     VALUES ($1, $2, 'prediction_correct', $3, $4)`,
    [userId, points, description || (isPro ? `Prediction correct (3x Pro bonus)` : 'Prediction correct'), referenceId]
  );

  return points;
}

router.post('/submit', requireAuth, async (req, res) => {
  try {
    const { gameId, sport, homeTeam, awayTeam, pickedTeam, confidence, gameTime } = req.body;
    const userId = req.session.userId;

    if (!gameId || !pickedTeam || !confidence) {
      return res.status(400).json({ error: 'Game ID, picked team, and confidence are required' });
    }
    if (confidence < 1 || confidence > 10) {
      return res.status(400).json({ error: 'Confidence must be between 1 and 10' });
    }

    if (gameTime && new Date(gameTime) < new Date()) {
      return res.status(400).json({ error: 'Cannot predict after game has started' });
    }

    const result = await pool.query(
      `INSERT INTO predictions (user_id, game_id, sport, home_team, away_team, picked_team, confidence, game_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id, game_id) DO UPDATE SET
         picked_team = $6, confidence = $7, created_at = NOW()
       RETURNING *`,
      [userId, gameId, sport || '', homeTeam || '', awayTeam || '', pickedTeam, confidence, gameTime || null]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Submit prediction error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/mine', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const result = await pool.query(
      `SELECT * FROM predictions WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get predictions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/game/:gameId', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const result = await pool.query(
      `SELECT * FROM predictions WHERE user_id = $1 AND game_id = $2`,
      [userId, req.params.gameId]
    );
    res.json(result.rows[0] || null);
  } catch (error) {
    console.error('Get game prediction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const [statsResult, streakResult] = await Promise.all([
      pool.query(
        `SELECT 
           COUNT(*) as total,
           COUNT(*) FILTER (WHERE status = 'correct') as correct,
           COUNT(*) FILTER (WHERE status = 'incorrect') as incorrect,
           COUNT(*) FILTER (WHERE status = 'pending') as pending,
           COALESCE(SUM(points_earned), 0) as total_points_earned
         FROM predictions WHERE user_id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT current_streak, best_streak, total_correct, total_predictions
         FROM prediction_streaks WHERE user_id = $1`,
        [userId]
      )
    ]);

    const stats = statsResult.rows[0];
    const streak = streakResult.rows[0] || { current_streak: 0, best_streak: 0, total_correct: 0, total_predictions: 0 };
    const total = parseInt(stats.total);
    const correct = parseInt(stats.correct);

    res.json({
      total,
      correct,
      incorrect: parseInt(stats.incorrect),
      pending: parseInt(stats.pending),
      winRate: total > 0 ? ((correct / total) * 100).toFixed(1) : '0.0',
      totalPointsEarned: parseInt(stats.total_points_earned),
      currentStreak: streak.current_streak,
      bestStreak: streak.best_streak,
    });
  } catch (error) {
    console.error('Get prediction stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const period = req.query.period || 'weekly';
    let dateFilter = '';
    if (period === 'weekly') {
      dateFilter = "AND p.resolved_at >= date_trunc('week', NOW())";
    } else if (period === 'monthly') {
      dateFilter = "AND p.resolved_at >= date_trunc('month', NOW())";
    }

    const result = await pool.query(
      `SELECT u.id, u.name, u.profile_picture,
              COUNT(*) FILTER (WHERE p.status = 'correct') as correct_picks,
              COUNT(*) as total_picks,
              COALESCE(SUM(p.points_earned), 0) as points_earned
       FROM predictions p
       JOIN users u ON u.id = p.user_id
       WHERE p.status IN ('correct', 'incorrect') ${dateFilter}
       GROUP BY u.id, u.name, u.profile_picture
       HAVING COUNT(*) >= 1
       ORDER BY correct_picks DESC, points_earned DESC
       LIMIT ${period === 'monthly' ? 20 : 10}`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/game-predictions/:gameId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT picked_team, COUNT(*) as count
       FROM predictions WHERE game_id = $1
       GROUP BY picked_team`,
      [req.params.gameId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Game predictions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/admin/resolve', requireAdmin, async (req, res) => {
  try {
    const { gameId, winner } = req.body;
    if (!gameId || !winner) {
      return res.status(400).json({ error: 'Game ID and winner are required' });
    }

    const predictions = await pool.query(
      `SELECT * FROM predictions WHERE game_id = $1 AND status = 'pending'`,
      [gameId]
    );

    let resolved = 0;
    for (const pred of predictions.rows) {
      const isCorrect = pred.picked_team === winner;
      let pointsEarned = 0;

      if (isCorrect) {
        pointsEarned = POINT_VALUES.base * pred.confidence;

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
        if (newStreak === 5) pointsEarned += POINT_VALUES.streak_5;
        if (newStreak === 10) pointsEarned += POINT_VALUES.streak_10;

        await awardPredictionPoints(
          pred.user_id,
          pointsEarned,
          `Correct prediction: ${pred.picked_team} (${pred.confidence}/10 confidence)${newStreak >= 5 ? ` + ${newStreak} streak bonus!` : ''}`,
          pred.id
        );

        try {
          await sendPushToUser(pred.user_id, {
            title: `You won! +${pointsEarned} points 🎉`,
            body: `${pred.picked_team} won! Your prediction was correct.`,
            icon: '/huddle-up-logo-2.png',
            url: '/predictions'
          }, { prefType: 'prediction_results' });
        } catch (pushErr) {}

        if (newStreak === 5) {
          try {
            await sendPushToUser(pred.user_id, {
              title: '5 game win streak! 🔥',
              body: 'You\'re on fire! +100 bonus points earned.',
              icon: '/huddle-up-logo-2.png',
              url: '/predictions'
            }, { prefType: 'achievement_unlocks' });
          } catch (pushErr) {}
        }
        if (newStreak === 10) {
          try {
            await sendPushToUser(pred.user_id, {
              title: '10 game win streak! 🏆',
              body: 'Legendary! +250 bonus points earned.',
              icon: '/huddle-up-logo-2.png',
              url: '/predictions'
            }, { prefType: 'achievement_unlocks' });
          } catch (pushErr) {}
        }
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
      }

      await pool.query(
        `UPDATE predictions SET status = $1, winner = $2, points_earned = $3, resolved_at = NOW()
         WHERE id = $4`,
        [isCorrect ? 'correct' : 'incorrect', winner, pointsEarned, pred.id]
      );
      resolved++;
    }

    res.json({ success: true, resolved, winner });
  } catch (error) {
    console.error('Resolve predictions error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/pending-games', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT game_id, sport, home_team, away_team, game_time,
              COUNT(*) as prediction_count
       FROM predictions
       WHERE status = 'pending'
       GROUP BY game_id, sport, home_team, away_team, game_time
       ORDER BY game_time ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Pending games error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/admin/game-detail/:gameId', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.name as user_name, u.profile_picture
       FROM predictions p
       JOIN users u ON u.id = p.user_id
       WHERE p.game_id = $1
       ORDER BY p.created_at DESC`,
      [req.params.gameId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Game detail error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
