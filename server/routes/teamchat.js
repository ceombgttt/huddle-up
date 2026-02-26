import { Router } from 'express';
import pool from '../db.js';

const router = Router();

const requireAuth = (req, res, next) => {
  if (!req.session?.userId) return res.status(401).json({ error: 'Not authenticated' });
  next();
};

// GET /rooms - List all team chat rooms grouped by sport
router.get('/rooms', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        tcr.id,
        tcr.sport,
        tcr.team_name,
        tcr.team_abbrev,
        tcr.logo_url,
        tcr.created_at,
        COUNT(tcm.id) as message_count,
        MAX(tcm.created_at) as last_message_time
      FROM team_chat_rooms tcr
      LEFT JOIN team_chat_messages tcm ON tcr.id = tcm.room_id
      GROUP BY tcr.id, tcr.sport, tcr.team_name, tcr.team_abbrev, tcr.logo_url, tcr.created_at
      ORDER BY tcr.sport ASC, tcr.team_name ASC
    `);

    const rooms = result.rows.map(room => ({
      id: room.id,
      sport: room.sport,
      teamName: room.team_name,
      teamAbbrev: room.team_abbrev,
      logoUrl: room.logo_url,
      messageCount: parseInt(room.message_count),
      lastMessageTime: room.last_message_time,
      createdAt: room.created_at
    }));

    res.json({ rooms });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Failed to load rooms' });
  }
});

// GET /rooms/:roomId/messages - Get messages for a room (paginated, 50 at a time)
router.get('/rooms/:roomId/messages', requireAuth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { before } = req.query;

    let query = `
      SELECT tcm.id, tcm.message, tcm.created_at,
        u.id as user_id, u.name as user_name, u.profile_picture, u.is_founder, u.founder_number
      FROM team_chat_messages tcm
      JOIN users u ON tcm.user_id = u.id
      WHERE tcm.room_id = $1
    `;
    const params = [roomId];

    if (before) {
      query += ' AND tcm.created_at < $2';
      params.push(before);
    }

    query += ' ORDER BY tcm.created_at DESC LIMIT 50';

    const result = await pool.query(query, params);
    const messages = result.rows.reverse().map(m => ({
      id: m.id,
      message: m.message,
      createdAt: m.created_at,
      userId: m.user_id,
      userName: m.user_name,
      profilePicture: m.profile_picture,
      isFounder: m.is_founder || false,
      founderNumber: m.founder_number || null
    }));
    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

// POST /rooms/:roomId/messages - Send a message to a room
router.post('/rooms/:roomId/messages', requireAuth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (message.length > 500) {
      return res.status(400).json({ error: 'Message too long (max 500 characters)' });
    }

    const result = await pool.query(
      `INSERT INTO team_chat_messages (room_id, user_id, message) VALUES ($1, $2, $3)
       RETURNING id, message, created_at`,
      [roomId, req.session.userId, message.trim()]
    );

    const user = await pool.query('SELECT name, profile_picture FROM users WHERE id = $1', [req.session.userId]);

    res.json({
      ...result.rows[0],
      user_id: req.session.userId,
      user_name: user.rows[0].name,
      profile_picture: user.rows[0].profile_picture
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// POST /rooms - Create a new team chat room
router.post('/rooms', requireAuth, async (req, res) => {
  try {
    const { sport, teamName, teamAbbrev, logoUrl } = req.body;

    if (!sport || !teamName) {
      return res.status(400).json({ error: 'Sport and team name are required' });
    }

    const result = await pool.query(
      `INSERT INTO team_chat_rooms (sport, team_name, team_abbrev, logo_url) 
       VALUES ($1, $2, $3, $4)
       RETURNING id, sport, team_name, team_abbrev, logo_url, created_at`,
      [sport, teamName, teamAbbrev || null, logoUrl || null]
    );

    res.status(201).json({
      id: result.rows[0].id,
      sport: result.rows[0].sport,
      teamName: result.rows[0].team_name,
      teamAbbrev: result.rows[0].team_abbrev,
      logoUrl: result.rows[0].logo_url,
      createdAt: result.rows[0].created_at,
      messageCount: 0,
      lastMessageTime: null
    });
  } catch (error) {
    console.error('Create room error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'A chat room for this sport and team already exists' });
    }
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// GET /rooms/search - Search for rooms by team name
router.get('/rooms/search', requireAuth, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = `%${q.trim()}%`;
    const result = await pool.query(
      `SELECT 
        tcr.id,
        tcr.sport,
        tcr.team_name,
        tcr.team_abbrev,
        tcr.logo_url,
        tcr.created_at,
        COUNT(tcm.id) as message_count,
        MAX(tcm.created_at) as last_message_time
      FROM team_chat_rooms tcr
      LEFT JOIN team_chat_messages tcm ON tcr.id = tcm.room_id
      WHERE tcr.team_name ILIKE $1 OR tcr.team_abbrev ILIKE $1
      GROUP BY tcr.id, tcr.sport, tcr.team_name, tcr.team_abbrev, tcr.logo_url, tcr.created_at
      ORDER BY tcr.team_name ASC`,
      [searchTerm]
    );

    const rooms = result.rows.map(room => ({
      id: room.id,
      sport: room.sport,
      teamName: room.team_name,
      teamAbbrev: room.team_abbrev,
      logoUrl: room.logo_url,
      messageCount: parseInt(room.message_count),
      lastMessageTime: room.last_message_time,
      createdAt: room.created_at
    }));

    res.json(rooms);
  } catch (error) {
    console.error('Search rooms error:', error);
    res.status(500).json({ error: 'Failed to search rooms' });
  }
});

export default router;
